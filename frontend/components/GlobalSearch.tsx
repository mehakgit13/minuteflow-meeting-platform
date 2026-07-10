"use client";

import {
  ArrowRight,
  Clock3,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "@/lib/api";
import { MeetingListItem } from "@/lib/types";
import { formatDuration } from "@/lib/format";

export function GlobalSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    MeetingListItem[]
  >([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (!isShortcut) return;

      event.preventDefault();

      const input = document.getElementById(
        "global-meeting-search",
      ) as HTMLInputElement | null;

      input?.focus();
      setOpen(true);
    }

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut,
      );
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const meetings =
          await api.searchMeetings(trimmedQuery);

        setResults(meetings.slice(0, 6));
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Search failed",
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  function openMeeting(meetingId: number) {
    setOpen(false);
    setQuery("");
    router.push(`/meetings/${meetingId}`);
  }

  function showAllResults() {
    const value = query.trim();

    setOpen(false);

    if (value) {
      router.push(
        `/?search=${encodeURIComponent(value)}`,
      );
    } else {
      router.push("/");
    }
  }

  return (
    <div
      className="global-search-wrapper"
      ref={containerRef}
    >
      <div
        className={`global-search ${
          open ? "global-search-active" : ""
        }`}
      >
        <Search size={17} />

        <input
          id="global-meeting-search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder="Search all meetings"
          aria-label="Search all meetings"
        />

        {query ? (
          <button
            type="button"
            className="search-clear-button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        ) : (
          <kbd>Ctrl K</kbd>
        )}
      </div>

      {open && (
        <div className="global-search-dropdown">
          {!query.trim() ? (
            <div className="search-hint">
              <Search size={20} />
              <div>
                <strong>Search your meetings</strong>
                <p>
                  Search meeting titles, transcripts,
                  participants and topics.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="search-status">
              Searching meetings…
            </div>
          ) : error ? (
            <div className="search-status search-error">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="search-status">
              <strong>No matching meetings</strong>
              <span>
                Try searching with another keyword.
              </span>
            </div>
          ) : (
            <>
              <div className="search-dropdown-heading">
                <span>Search results</span>
                <small>{results.length} found</small>
              </div>

              <div className="search-result-list">
                {results.map((meeting) => (
                  <button
                    type="button"
                    className="search-result-item"
                    key={meeting.id}
                    onClick={() =>
                      openMeeting(meeting.id)
                    }
                  >
                    <div className="search-result-icon">
                      {meeting.title
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="search-result-content">
                      <strong>{meeting.title}</strong>

                      <span>
                        {new Date(
                          `${meeting.meeting_date}T00:00:00`,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <i>•</i>
                        <Clock3 size={13} />
                        {formatDuration(
                          meeting.duration_seconds,
                        )}
                      </span>

                      {meeting.topics.length > 0 && (
                        <small>
                          {meeting.topics
                            .slice(0, 3)
                            .map((topic) => topic.label)
                            .join(" · ")}
                        </small>
                      )}
                    </div>

                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="view-all-search-results"
                onClick={showAllResults}
              >
                View all matching meetings
                <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}