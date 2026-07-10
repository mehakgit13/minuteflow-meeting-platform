from datetime import date

from fastapi import APIRouter, Depends, File, Form, HTTPException, Path, Query, Response, UploadFile, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import ActionItem, Meeting, Participant, Topic, TranscriptSegment
from ..schemas import (
    ActionItemCreate,
    ActionItemOut,
    ActionItemUpdate,
    ErrorResponse,
    MeetingCreate,
    MeetingDetail,
    MeetingListItem,
    MeetingUpdate,
)
from ..services.transcript import derive_summary, derive_topics, parse_transcript

router = APIRouter(prefix="/meetings")

NOT_FOUND_RESPONSE = {
    404: {
        "model": ErrorResponse,
        "description": "The requested meeting or action item does not exist.",
    }
}


def meeting_query():
    return select(Meeting).options(
        selectinload(Meeting.participants),
        selectinload(Meeting.topics),
        selectinload(Meeting.segments),
        selectinload(Meeting.action_items),
    )


def to_list_item(meeting: Meeting) -> MeetingListItem:
    return MeetingListItem(
        id=meeting.id,
        title=meeting.title,
        meeting_date=meeting.meeting_date,
        duration_seconds=meeting.duration_seconds,
        source=meeting.source,
        status=meeting.status,
        participants=meeting.participants,
        topics=meeting.topics,
        updated_at=meeting.updated_at,
    )


def to_detail(meeting: Meeting) -> MeetingDetail:
    return MeetingDetail(
        **to_list_item(meeting).model_dump(),
        summary=meeting.summary,
        segments=meeting.segments,
        action_items=meeting.action_items,
        created_at=meeting.created_at,
    )


@router.get(
    "",
    response_model=list[MeetingListItem],
    tags=["Meetings"],
    summary="List and filter meetings",
    description=(
        "Returns meeting cards for the library view. Search matches meeting titles and transcript text. "
        "Filters can be combined with participant and date range constraints."
    ),
    operation_id="list_meetings",
)
def list_meetings(
    search: str | None = Query(
        default=None,
        min_length=1,
        description="Case-insensitive search across meeting titles and transcript text.",
        examples=["enterprise"],
    ),
    participant: str | None = Query(
        default=None,
        min_length=1,
        description="Case-insensitive participant-name filter.",
        examples=["Mehak"],
    ),
    date_from: date | None = Query(
        default=None,
        description="Include meetings held on or after this date.",
        examples=["2026-07-01"],
    ),
    date_to: date | None = Query(
        default=None,
        description="Include meetings held on or before this date.",
        examples=["2026-07-31"],
    ),
    sort: str = Query(
        default="recent",
        pattern="^(recent|oldest|title)$",
        description="Sort by newest date, oldest date, or alphabetic title.",
        examples=["recent"],
    ),
    db: Session = Depends(get_db),
):
    stmt = meeting_query()

    if search:
        term = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Meeting.title).like(term),
                Meeting.id.in_(
                    select(TranscriptSegment.meeting_id).where(
                        func.lower(TranscriptSegment.text).like(term)
                    )
                ),
            )
        )

    if participant:
        stmt = stmt.where(
            Meeting.id.in_(
                select(Participant.meeting_id).where(
                    func.lower(Participant.name).like(f"%{participant.lower()}%")
                )
            )
        )

    if date_from:
        stmt = stmt.where(Meeting.meeting_date >= date_from)
    if date_to:
        stmt = stmt.where(Meeting.meeting_date <= date_to)

    order = {
        "recent": Meeting.meeting_date.desc(),
        "oldest": Meeting.meeting_date.asc(),
        "title": Meeting.title.asc(),
    }[sort]

    meetings = db.scalars(stmt.order_by(order)).unique().all()
    return [to_list_item(meeting) for meeting in meetings]


@router.get(
    "/{meeting_id}",
    response_model=MeetingDetail,
    tags=["Meetings"],
    summary="Get complete meeting workspace data",
    description=(
        "Returns one meeting with metadata, participants, topics, summary, transcript segments, "
        "and action items for the detail workspace."
    ),
    operation_id="get_meeting",
    responses=NOT_FOUND_RESPONSE,
)
def get_meeting(
    meeting_id: int = Path(description="Meeting primary key", examples=[1]),
    db: Session = Depends(get_db),
):
    meeting = db.scalar(meeting_query().where(Meeting.id == meeting_id))
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return to_detail(meeting)


@router.post(
    "",
    response_model=MeetingDetail,
    status_code=status.HTTP_201_CREATED,
    tags=["Meetings"],
    summary="Create a meeting from pasted transcript text",
    description=(
        "Creates a meeting, parses timestamped transcript lines into segments, derives duration, "
        "generates a deterministic summary when needed, extracts topics, and persists all records."
    ),
    operation_id="create_meeting",
)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)):
    segments = parse_transcript(payload.transcript)
    duration = payload.duration_seconds or (
        segments[-1]["end_seconds"] if segments else 0
    )

    meeting = Meeting(
        title=payload.title,
        meeting_date=payload.meeting_date,
        duration_seconds=duration,
        summary=payload.summary or derive_summary(segments),
        source="Pasted transcript",
        status="Processed",
    )
    meeting.participants = [
        Participant(name=name.strip())
        for name in payload.participants
        if name.strip()
    ]
    meeting.segments = [TranscriptSegment(**segment) for segment in segments]
    meeting.topics = [Topic(label=topic) for topic in derive_topics(payload.transcript)]

    db.add(meeting)
    db.commit()
    return get_meeting(meeting.id, db)


@router.post(
    "/upload",
    response_model=MeetingDetail,
    status_code=status.HTTP_201_CREATED,
    tags=["Meetings"],
    summary="Create a meeting from an uploaded transcript",
    description=(
        "Accepts UTF-8 `.txt`, `.vtt`, or `.srt` transcript files. Participants must be supplied "
        "as a comma-separated string."
    ),
    operation_id="upload_meeting",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Unsupported file type or non-UTF-8 content.",
        }
    },
)
async def upload_meeting(
    title: str = Form(..., min_length=2, max_length=180),
    meeting_date: date = Form(...),
    participants: str = Form(
        default="",
        description="Comma-separated participant names.",
        examples=["Mehak Yadav, Rohan Mehta"],
    ),
    transcript_file: UploadFile = File(
        ...,
        description="UTF-8 transcript file with .txt, .vtt, or .srt extension.",
    ),
    db: Session = Depends(get_db),
):
    filename = transcript_file.filename or ""
    if not filename.lower().endswith((".txt", ".vtt", ".srt")):
        raise HTTPException(
            status_code=400,
            detail="Upload a .txt, .vtt, or .srt transcript",
        )

    raw = await transcript_file.read()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail="Transcript must be UTF-8 text",
        ) from exc

    return create_meeting(
        MeetingCreate(
            title=title,
            meeting_date=meeting_date,
            participants=[
                participant.strip()
                for participant in participants.split(",")
                if participant.strip()
            ],
            transcript=text,
        ),
        db,
    )


@router.patch(
    "/{meeting_id}",
    response_model=MeetingDetail,
    tags=["Meetings"],
    summary="Update meeting metadata",
    description="Partially updates title, date, participants, or summary.",
    operation_id="update_meeting",
    responses=NOT_FOUND_RESPONSE,
)
def update_meeting(
    meeting_id: int,
    payload: MeetingUpdate,
    db: Session = Depends(get_db),
):
    meeting = db.scalar(meeting_query().where(Meeting.id == meeting_id))
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    data = payload.model_dump(exclude_unset=True)
    participants = data.pop("participants", None)

    for key, value in data.items():
        setattr(meeting, key, value)

    if participants is not None:
        meeting.participants = [
            Participant(name=name.strip())
            for name in participants
            if name.strip()
        ]

    db.commit()
    return get_meeting(meeting_id, db)


@router.delete(
    "/{meeting_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Meetings"],
    summary="Delete a meeting",
    description="Deletes the meeting and cascades deletion to participants, topics, transcript segments, and action items.",
    operation_id="delete_meeting",
    responses=NOT_FOUND_RESPONSE,
)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
) -> Response:
    meeting = db.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    db.delete(meeting)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{meeting_id}/actions",
    response_model=ActionItemOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Action Items"],
    summary="Add an action item",
    description="Creates and persists a task linked to a meeting.",
    operation_id="add_action_item",
    responses=NOT_FOUND_RESPONSE,
)
def add_action(
    meeting_id: int,
    payload: ActionItemCreate,
    db: Session = Depends(get_db),
):
    if not db.get(Meeting, meeting_id):
        raise HTTPException(status_code=404, detail="Meeting not found")

    item = ActionItem(meeting_id=meeting_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch(
    "/{meeting_id}/actions/{action_id}",
    response_model=ActionItemOut,
    tags=["Action Items"],
    summary="Edit or complete an action item",
    description="Partially updates task text, assignee, due date, or completion state.",
    operation_id="update_action_item",
    responses=NOT_FOUND_RESPONSE,
)
def update_action(
    meeting_id: int,
    action_id: int,
    payload: ActionItemUpdate,
    db: Session = Depends(get_db),
):
    item = db.get(ActionItem, action_id)
    if not item or item.meeting_id != meeting_id:
        raise HTTPException(status_code=404, detail="Action item not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/{meeting_id}/actions/{action_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Action Items"],
    summary="Delete an action item",
    description="Permanently removes one task from its meeting.",
    operation_id="delete_action_item",
    responses=NOT_FOUND_RESPONSE,
)
def delete_action(
    meeting_id: int,
    action_id: int,
    db: Session = Depends(get_db),
) -> Response:
    item = db.get(ActionItem, action_id)
    if not item or item.meeting_id != meeting_id:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
