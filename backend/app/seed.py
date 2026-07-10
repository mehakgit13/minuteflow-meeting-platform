from datetime import date
from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import ActionItem, Meeting, Participant, Topic, TranscriptSegment

SEED_MEETINGS = [
    {
        "title": "Q3 Product Strategy Review",
        "meeting_date": date(2026, 7, 8),
        "duration": 2530,
        "participants": ["Ananya Rao", "Rohan Mehta", "Mehak Yadav", "Kabir Shah"],
        "summary": "The team aligned on the Q3 launch sequence, prioritized onboarding improvements, and agreed to validate enterprise reporting requirements before development begins.",
        "topics": ["Product Strategy", "Onboarding", "Enterprise", "Q3 Roadmap"],
        "segments": [
            (
                0,
                42,
                "Ananya Rao",
                "Thanks everyone. Today we need to lock the Q3 priorities and identify decisions that still need customer validation.",
            ),
            (
                42,
                96,
                "Rohan Mehta",
                "Activation is our biggest opportunity. New teams understand the value, but the setup flow asks for too much information too early.",
            ),
            (
                96,
                148,
                "Mehak Yadav",
                "The prototype reduces setup to three steps and lets users configure integrations after they reach the dashboard.",
            ),
            (
                148,
                213,
                "Kabir Shah",
                "For enterprise accounts, reporting and role controls are still blockers. We should validate the exact permission model this week.",
            ),
            (
                213,
                282,
                "Ananya Rao",
                "Decision: onboarding ships first, while enterprise reporting moves into a discovery sprint with design and engineering.",
            ),
        ],
        "actions": [
            (
                "Schedule five enterprise discovery calls",
                "Ananya Rao",
                date(2026, 7, 15),
            ),
            ("Share revised onboarding prototype", "Mehak Yadav", date(2026, 7, 12)),
            ("Draft permission model options", "Kabir Shah", date(2026, 7, 16)),
        ],
    },
    {
        "title": "Design Critique — Analytics Workspace",
        "meeting_date": date(2026, 7, 6),
        "duration": 1845,
        "participants": ["Mehak Yadav", "Ishita Sen", "Dev Malhotra"],
        "summary": "The critique favored a calmer information hierarchy, clearer empty states, and a persistent filter summary. The team will test two navigation variants.",
        "topics": ["Design", "Analytics", "Navigation", "Usability"],
        "segments": [
            (
                0,
                55,
                "Ishita Sen",
                "Let us review the workspace from a first-time user's perspective.",
            ),
            (
                55,
                120,
                "Mehak Yadav",
                "The current header has equal visual weight for every control, which makes the primary task difficult to find.",
            ),
            (
                120,
                190,
                "Dev Malhotra",
                "We can group secondary filters and keep the active filter summary visible above the chart.",
            ),
            (
                190,
                250,
                "Ishita Sen",
                "We will test the sidebar and top-navigation variants with five users before Friday.",
            ),
        ],
        "actions": [
            ("Prepare two navigation prototypes", "Mehak Yadav", date(2026, 7, 11)),
            ("Recruit five usability participants", "Ishita Sen", date(2026, 7, 10)),
        ],
    },
    {
        "title": "Weekly Engineering Sync",
        "meeting_date": date(2026, 7, 3),
        "duration": 1420,
        "participants": ["Aarav Jain", "Mehak Yadav", "Nikhil Bose"],
        "summary": "Engineering reviewed API latency, closed the transcript indexing incident, and planned a staged rollout for the new search endpoint.",
        "topics": ["Engineering", "API", "Search", "Reliability"],
        "segments": [
            (
                0,
                48,
                "Aarav Jain",
                "The indexing backlog is cleared and new transcripts are processing normally.",
            ),
            (
                48,
                108,
                "Nikhil Bose",
                "The new search endpoint is faster, but we should release it behind a feature flag.",
            ),
            (
                108,
                168,
                "Mehak Yadav",
                "I will add dashboard monitoring for p95 latency and failed requests before rollout.",
            ),
            (
                168,
                220,
                "Aarav Jain",
                "We will start with ten percent of accounts and expand after twenty-four hours of stable metrics.",
            ),
        ],
        "actions": [
            ("Add API latency dashboard", "Mehak Yadav", date(2026, 7, 9)),
            ("Configure staged rollout flag", "Nikhil Bose", date(2026, 7, 9)),
        ],
    },
]


def seed_database(db: Session) -> None:
    if db.scalar(select(Meeting.id).limit(1)):
        return
    for item in SEED_MEETINGS:
        meeting = Meeting(
            title=item["title"],
            meeting_date=item["meeting_date"],
            duration_seconds=item["duration"],
            summary=item["summary"],
            source="Seeded demo",
            status="Processed",
        )
        meeting.participants = [Participant(name=name) for name in item["participants"]]
        meeting.topics = [Topic(label=label) for label in item["topics"]]
        meeting.segments = [
            TranscriptSegment(start_seconds=s, end_seconds=e, speaker=sp, text=t)
            for s, e, sp, t in item["segments"]
        ]
        meeting.action_items = [
            ActionItem(text=t, assignee=a, due_date=d) for t, a, d in item["actions"]
        ]
        db.add(meeting)
    db.commit()
