from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class ErrorResponse(BaseModel):
    """Standard API error response returned for client and resource errors."""

    detail: str = Field(
        examples=["Meeting not found"],
        description="Human-readable explanation of the error.",
    )


class HealthResponse(BaseModel):
    status: str = Field(examples=["ok"])
    service: str = Field(examples=["MinuteFlow API"])
    version: str = Field(examples=["1.1.0"])


class ParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(examples=[1])
    name: str = Field(examples=["Mehak Yadav"])
    email: str | None = Field(default=None, examples=["mehak@example.com"])


class SegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(examples=[1])
    speaker: str = Field(examples=["Mehak Yadav"])
    start_seconds: int = Field(ge=0, examples=[96])
    end_seconds: int = Field(ge=0, examples=[148])
    text: str = Field(
        examples=["The prototype reduces setup to three steps."],
        description="Transcript text spoken during this segment.",
    )


class ActionItemBase(BaseModel):
    text: Annotated[
        str,
        Field(
            min_length=1,
            max_length=500,
            examples=["Share the revised onboarding prototype"],
        ),
    ]
    assignee: str | None = Field(default=None, examples=["Mehak Yadav"])
    due_date: date | None = Field(default=None, examples=["2026-07-15"])
    completed: bool = Field(default=False, examples=[False])


class ActionItemCreate(ActionItemBase):
    """Payload used to create an action item for a meeting."""


class ActionItemUpdate(BaseModel):
    """Partial payload used to edit or complete an action item."""

    text: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
        examples=["Share the final onboarding prototype"],
    )
    assignee: str | None = Field(default=None, examples=["Mehak Yadav"])
    due_date: date | None = Field(default=None, examples=["2026-07-16"])
    completed: bool | None = Field(default=None, examples=[True])


class ActionItemOut(ActionItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(examples=[1])


class TopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(examples=[1])
    label: str = Field(examples=["Onboarding"])


class MeetingBase(BaseModel):
    title: Annotated[
        str,
        Field(
            min_length=2,
            max_length=180,
            examples=["Q3 Product Strategy Review"],
        ),
    ]
    meeting_date: date = Field(examples=["2026-07-08"])
    participants: list[str] = Field(
        default_factory=list,
        examples=[["Ananya Rao", "Rohan Mehta", "Mehak Yadav"]],
        description="Participant display names.",
    )


class MeetingCreate(MeetingBase):
    transcript: str = Field(
        default="",
        examples=[
            "[00:00] Ananya Rao: Welcome everyone.\n[00:18] Mehak Yadav: The prototype is ready."
        ],
        description="Pasted transcript text. Timestamped speaker lines are recommended.",
    )
    summary: str = Field(
        default="",
        examples=["The team aligned on the Q3 launch sequence."],
        description="Optional summary. When omitted, MinuteFlow generates a deterministic summary.",
    )
    duration_seconds: int | None = Field(
        default=None,
        ge=0,
        examples=[2530],
        description="Optional duration. When omitted, it is derived from transcript timestamps.",
    )


class MeetingUpdate(BaseModel):
    """Partial meeting metadata update."""

    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=180,
        examples=["Updated Q3 Product Strategy Review"],
    )
    meeting_date: date | None = Field(default=None, examples=["2026-07-09"])
    participants: list[str] | None = Field(
        default=None,
        examples=[["Mehak Yadav", "Rohan Mehta"]],
    )
    summary: str | None = Field(
        default=None,
        examples=["The team confirmed the launch priorities and ownership."],
    )


class MeetingListItem(BaseModel):
    id: int = Field(examples=[1])
    title: str = Field(examples=["Q3 Product Strategy Review"])
    meeting_date: date = Field(examples=["2026-07-08"])
    duration_seconds: int = Field(examples=[2530])
    source: str = Field(examples=["Seeded demo"])
    status: str = Field(examples=["Processed"])
    participants: list[ParticipantOut]
    topics: list[TopicOut]
    updated_at: datetime = Field(examples=["2026-07-08T12:30:00"])


class MeetingDetail(MeetingListItem):
    summary: str = Field(
        examples=["The team aligned on launch sequencing and onboarding improvements."]
    )
    segments: list[SegmentOut]
    action_items: list[ActionItemOut]
    created_at: datetime = Field(examples=["2026-07-08T10:00:00"])
