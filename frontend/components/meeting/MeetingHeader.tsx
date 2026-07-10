import {
  ArrowLeft,
  Check,
  Download,
  Edit3,
  Link2,
  Trash2,
} from "lucide-react";
import { MeetingDetail } from "@/lib/types";
import { initials } from "@/lib/format";

type Props = {
  meeting: MeetingDetail;
  onBack: () => void;
  onExport: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
};

export function MeetingHeader({
  meeting,
  onBack,
  onExport,
  onEdit,
  onDelete,
  onCopyLink,
}: Props) {
  const date = new Date(`${meeting.meeting_date}T00:00:00`).toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <header className="mf-detail-header">
      <button className="mf-back-button" type="button" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to meetings
      </button>

      <div className="mf-detail-header-row">
        <div className="mf-detail-heading">
          <div className="mf-title-line">
            <h1>{meeting.title}</h1>
            <span className="mf-status-badge">
              <Check size={13} /> Processed
            </span>
          </div>

          <p className="mf-meeting-meta">
            {date}
            <span>•</span>
            {meeting.participants.length} participants
            <span>•</span>
            {meeting.source || "Uploaded transcript"}
          </p>

          <div className="mf-participant-strip">
            <div className="mf-avatar-stack" aria-label="Meeting participants">
              {meeting.participants.slice(0, 5).map((participant) => (
                <span key={participant.id} title={participant.name}>
                  {initials(participant.name)}
                </span>
              ))}
            </div>
            <p>
              {meeting.participants.map((participant) => participant.name).join(", ")}
            </p>
          </div>
        </div>

        <div className="mf-header-actions">
          <button className="mf-button mf-button-secondary" type="button" onClick={onCopyLink}>
            <Link2 size={16} /> Share
          </button>
          <button className="mf-button mf-button-secondary" type="button" onClick={onExport}>
            <Download size={16} /> Export
          </button>
          <button className="mf-button mf-button-secondary" type="button" onClick={onEdit}>
            <Edit3 size={16} /> Edit
          </button>
          <button
            className="mf-icon-button mf-danger-button"
            type="button"
            onClick={onDelete}
            aria-label="Delete meeting"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
