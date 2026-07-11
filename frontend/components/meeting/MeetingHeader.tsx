"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Download,
  Edit3,
  FileText,
  Link2,
  Printer,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { initials } from "@/lib/format";
import { MeetingDetail } from "@/lib/types";

export type ExportFormat =
  | "txt"
  | "md"
  | "print"
  | "copy-summary"
  | "copy-transcript";

type Props = {
  meeting: MeetingDetail;
  onBack: () => void;
  onExport: (format: ExportFormat) => void;
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
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const date = new Date(
    `${meeting.meeting_date}T00:00:00`,
  ).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    function onOutsideClick(event: MouseEvent) {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setExportOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExportOpen(false);
      }
    }

    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function chooseExport(format: ExportFormat) {
    setExportOpen(false);
    onExport(format);
  }

  return (
    <header className="mf-meeting-header">
      <button
        type="button"
        className="mf-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        Back to meetings
      </button>

      <div className="mf-meeting-header-main">
        <div className="mf-meeting-heading">
          <div className="mf-title-row">
            <h1>{meeting.title}</h1>

            <span className="mf-status-pill">
              <Check size={13} />
              Processed
            </span>
          </div>

          <p className="mf-meeting-meta">
            {date}
            <span>•</span>
            {meeting.participants.length} participants
            <span>•</span>
            {meeting.source || "Uploaded transcript"}
          </p>

          <div className="mf-participant-summary">
            <div className="mf-header-avatars">
              {meeting.participants.slice(0, 5).map((participant, index) => (
                <span
                  key={participant.id}
                  style={{ zIndex: 10 - index }}
                  title={participant.name}
                >
                  {initials(participant.name)}
                </span>
              ))}

              {meeting.participants.length > 5 && (
                <span className="mf-avatar-overflow">
                  +{meeting.participants.length - 5}
                </span>
              )}
            </div>

            <span>
              {meeting.participants
                .map((participant) => participant.name)
                .join(", ")}
            </span>
          </div>
        </div>

        <div className="mf-header-actions">
          <button
            type="button"
            className="secondary"
            onClick={onCopyLink}
          >
            <Link2 size={16} />
            Share
          </button>

          <div className="mf-export-menu" ref={exportRef}>
            <button
              type="button"
              className="secondary"
              onClick={() => setExportOpen((current) => !current)}
              aria-expanded={exportOpen}
              aria-haspopup="menu"
            >
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </button>

            {exportOpen && (
              <div className="mf-export-dropdown" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => chooseExport("txt")}
                >
                  <FileText size={16} />
                  <span>
                    <b>Export TXT</b>
                    <small>Plain-text transcript and notes</small>
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => chooseExport("md")}
                >
                  <FileText size={16} />
                  <span>
                    <b>Export Markdown</b>
                    <small>Structured meeting document</small>
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => chooseExport("print")}
                >
                  <Printer size={16} />
                  <span>
                    <b>Print / Save as PDF</b>
                    <small>Uses the browser print dialog</small>
                  </span>
                </button>

                <div className="mf-export-divider" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => chooseExport("copy-summary")}
                >
                  <Copy size={16} />
                  <span>
                    <b>Copy summary</b>
                    <small>Copy summary to clipboard</small>
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => chooseExport("copy-transcript")}
                >
                  <Copy size={16} />
                  <span>
                    <b>Copy transcript</b>
                    <small>Copy complete transcript</small>
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="secondary"
            onClick={onEdit}
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            type="button"
            className="mf-danger-button"
            onClick={onDelete}
            aria-label="Delete meeting"
            title="Delete meeting"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
