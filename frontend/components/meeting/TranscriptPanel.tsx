import { Search, X } from "lucide-react";
import { Segment } from "@/lib/types";
import { formatTime, initials } from "@/lib/format";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={`${part}-${index}`}>{part}</mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

type Props = {
  segments: Segment[];
  query: string;
  activeId?: number;
  onQueryChange: (query: string) => void;
  onSeek: (seconds: number) => void;
};

export function TranscriptPanel({
  segments,
  query,
  activeId,
  onQueryChange,
  onSeek,
}: Props) {
  const visibleSegments = segments.filter(
    (segment) =>
      segment.text.toLowerCase().includes(query.toLowerCase()) ||
      segment.speaker.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mf-transcript-content">
      <div className="mf-transcript-toolbar">
        <div className="mf-transcript-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search transcript or speaker"
          />
          {query && (
            <button type="button" onClick={() => onQueryChange("")}>
              <X size={15} />
            </button>
          )}
        </div>
        <span>{visibleSegments.length} matches</span>
      </div>

      {visibleSegments.length === 0 ? (
        <div className="mf-empty-state">
          <Search size={25} />
          <h3>No transcript matches</h3>
          <p>Try another word, phrase, or speaker name.</p>
        </div>
      ) : (
        <div className="mf-transcript-list">
          {visibleSegments.map((segment) => (
            <button
              key={segment.id}
              type="button"
              className={`mf-transcript-row ${activeId === segment.id ? "is-active" : ""}`}
              onClick={() => onSeek(segment.start_seconds)}
            >
              <span className="mf-speaker-avatar">{initials(segment.speaker)}</span>
              <span className="mf-transcript-copy">
                <span className="mf-transcript-row-head">
                  <b>
                    <Highlight text={segment.speaker} query={query} />
                  </b>
                  <time>{formatTime(segment.start_seconds)}</time>
                </span>
                <p>
                  <Highlight text={segment.text} query={query} />
                </p>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
