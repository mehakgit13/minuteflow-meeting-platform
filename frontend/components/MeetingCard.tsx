"use client";

import Link from "next/link";
import {
  Calendar,
  Clock3,
  MoreHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

import { MeetingListItem } from "@/lib/types";
import {
  formatDuration,
  initials,
} from "@/lib/format";

type MeetingCardProps = {
  meeting: MeetingListItem;
};

export function MeetingCard({
  meeting,
}: MeetingCardProps) {
  const formattedDate = new Date(
    `${meeting.meeting_date}T00:00:00`,
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="meeting-card enhanced-meeting-card"
    >
      <div className="card-top">
        <span className="source-pill">
          <Sparkles size={12} />
          {meeting.source || "Meeting"}
        </span>

        <button
          type="button"
          className="card-menu-button"
          aria-label="Meeting options"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="meeting-card-main">
        <h3>{meeting.title}</h3>

        <p className="meeting-card-description">
          Review the transcript, AI summary, topics and
          follow-up tasks from this conversation.
        </p>

        <div className="meta-row">
          <span>
            <Calendar size={15} />
            {formattedDate}
          </span>

          <span>
            <Clock3 size={15} />
            {formatDuration(meeting.duration_seconds)}
          </span>
        </div>

        <div className="topic-row">
          {meeting.topics.slice(0, 3).map((topic) => (
            <span key={topic.id}>{topic.label}</span>
          ))}

          {meeting.topics.length > 3 && (
            <span>+{meeting.topics.length - 3}</span>
          )}
        </div>
      </div>

      <div className="card-footer">
        <div className="avatars">
          {meeting.participants
            .slice(0, 4)
            .map((person, index) => (
              <span
                key={person.id}
                style={{ zIndex: 5 - index }}
                title={person.name}
              >
                {initials(person.name)}
              </span>
            ))}

          {meeting.participants.length > 4 && (
            <span>
              +{meeting.participants.length - 4}
            </span>
          )}
        </div>

        <span>
          <Users size={14} />
          {meeting.participants.length} participant
          {meeting.participants.length === 1
            ? ""
            : "s"}
        </span>
      </div>
    </Link>
  );
}