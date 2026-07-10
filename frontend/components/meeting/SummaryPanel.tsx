import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { MeetingDetail } from "@/lib/types";
import { formatTime } from "@/lib/format";

type Props = {
  meeting: MeetingDetail;
  onOpenTranscriptAt: (seconds: number) => void;
};

function sentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function SummaryPanel({ meeting, onOpenTranscriptAt }: Props) {
  const summarySentences = sentences(meeting.summary);
  const decisions = summarySentences.slice(0, 3);
  const risks = meeting.segments
    .filter((segment) => /risk|block|concern|issue|delay|unclear|validate/i.test(segment.text))
    .slice(0, 3);
  const nextSteps = meeting.action_items.slice(0, 4);

  return (
    <div className="mf-summary-content">
      <section className="mf-summary-hero">
        <div className="mf-summary-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="mf-section-kicker">AI MEETING SUMMARY</p>
          <h2>Executive overview</h2>
          <p>{meeting.summary}</p>
        </div>
      </section>

      <div className="mf-summary-grid">
        <section className="mf-insight-card">
          <div className="mf-card-heading">
            <CheckCircle2 size={18} />
            <h3>Key decisions</h3>
          </div>
          <ul>
            {(decisions.length ? decisions : ["No explicit decisions were detected."]).map(
              (decision, index) => (
                <li key={`${decision}-${index}`}>{decision}</li>
              ),
            )}
          </ul>
        </section>

        <section className="mf-insight-card">
          <div className="mf-card-heading">
            <ListChecks size={18} />
            <h3>Next steps</h3>
          </div>
          <ul>
            {(nextSteps.length
              ? nextSteps.map((item) => item.text)
              : ["No action items have been added yet."]
            ).map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mf-summary-section">
        <div className="mf-section-title-row">
          <div>
            <p className="mf-section-kicker">DISCUSSION MAP</p>
            <h3>Topics and themes</h3>
          </div>
          <span>{meeting.topics.length} topics</span>
        </div>
        <div className="mf-topic-list">
          {meeting.topics.map((topic) => (
            <span key={topic.id}>
              <Target size={14} /> {topic.label}
            </span>
          ))}
        </div>
      </section>

      {risks.length > 0 && (
        <section className="mf-summary-section">
          <div className="mf-section-title-row">
            <div>
              <p className="mf-section-kicker">ATTENTION NEEDED</p>
              <h3>Risks and open questions</h3>
            </div>
            <AlertTriangle size={18} />
          </div>
          <div className="mf-risk-list">
            {risks.map((risk) => (
              <button
                key={risk.id}
                type="button"
                onClick={() => onOpenTranscriptAt(risk.start_seconds)}
              >
                <Clock3 size={15} />
                <span>{formatTime(risk.start_seconds)}</span>
                <p>{risk.text}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mf-summary-section">
        <div className="mf-section-title-row">
          <div>
            <p className="mf-section-kicker">TIMELINE</p>
            <h3>Conversation chapters</h3>
          </div>
          <span>Click a chapter to open transcript</span>
        </div>
        <div className="mf-chapter-list">
          {meeting.segments.slice(0, 7).map((segment, index) => (
            <button
              key={segment.id}
              type="button"
              onClick={() => onOpenTranscriptAt(segment.start_seconds)}
            >
              <span className="mf-chapter-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="mf-chapter-time">{formatTime(segment.start_seconds)}</span>
              <span className="mf-chapter-copy">
                <b>{segment.speaker}</b>
                <p>{segment.text}</p>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
