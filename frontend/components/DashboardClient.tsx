"use client";

import {
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { api } from "@/lib/api";
import { MeetingListItem } from "@/lib/types";
import { CreateMeetingModal } from "./CreateMeetingModal";
import { MeetingCard } from "./MeetingCard";

export function DashboardClient() {
  const searchParams = useSearchParams();
  const initialSearch =
    searchParams.get("search") || "";

  const [data, setData] = useState<
    MeetingListItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [topic, setTopic] = useState("");

  const visibleMeetings = topic
    ? data.filter((meeting) =>
        meeting.topics.some((meetingTopic) =>
          meetingTopic.label
            .toLowerCase()
            .includes(topic.trim().toLowerCase()),
        ),
      )
    : data;
  
  const [search, setSearch] =
    useState(initialSearch);
  const [participant, setParticipant] =
    useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("recent");

  const [showFilters, setShowFilters] =
    useState(false);
  const [modalOpen, setModalOpen] =
    useState(false);
  const [toast, setToast] = useState("");

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (participant.trim()) {
      params.set(
        "participant",
        participant.trim(),
      );
    }

    if (dateFrom) {
      params.set("date_from", dateFrom);
    }

    if (dateTo) {
      params.set("date_to", dateTo);
    }

    params.set("sort", sort);

    try {
      const meetings =
        await api.meetings(params);

      setData(meetings);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load meetings",
      );
    } finally {
      setLoading(false);
    }
  }, [
    search,
    participant,
    dateFrom,
    dateTo,
    sort,
  ]);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const timer = window.setTimeout(
      loadMeetings,
      300,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadMeetings]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const activeFilterCount = [
    participant,
    topic,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  function clearFilters() {
    setParticipant("");
    setTopic("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <>
      {toast && (
        <div className="toast">✓ {toast}</div>
      )}

      <section className="page-head">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Meeting library</h1>
          <p>
            Search, revisit, and act on every
            conversation.
          </p>
        </div>

        <button
          type="button"
          className="primary"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={18} />
          Add meeting
        </button>
      </section>

      <section className="dashboard-stats">
        <div>
          <span>Total meetings</span>
          <strong>{data.length}</strong>
          <small>Available in your workspace</small>
        </div>

        <div>
          <span>Participants</span>
          <strong>
            {
              new Set(
                data.flatMap((meeting) =>
                  meeting.participants.map(
                    (participantItem) =>
                      participantItem.name,
                  ),
                ),
              ).size
            }
          </strong>
          <small>Unique meeting participants</small>
        </div>

        <div>
          <span>Recorded time</span>
          <strong>
            {Math.round(
              data.reduce(
                (total, meeting) =>
                  total +
                  meeting.duration_seconds,
                0,
              ) / 3600,
            )}
            h
          </strong>
          <small>Total meeting duration</small>
        </div>

        <div>
          <span>Topics</span>
          <strong>
            {
              new Set(
                data.flatMap((meeting) =>
                  meeting.topics.map(
                    (topic) => topic.label,
                  ),
                ),
              ).size
            }
          </strong>
          <small>AI-detected themes</small>
        </div>
      </section>

      <section className="toolbar">
        <div className="searchbox">
          <Search size={18} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search titles and transcripts"
          />

          {search && (
            <button
              type="button"
              className="inline-clear-button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`secondary ${
            activeFilterCount > 0
              ? "filter-active"
              : ""
          }`}
          onClick={() =>
            setShowFilters(
              (current) => !current,
            )
          }
        >
          <Filter size={17} />
          Filters

          {activeFilterCount > 0 && (
            <span className="filter-count">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
          aria-label="Sort meetings"
        >
          <option value="recent">
            Recently held
          </option>
          <option value="oldest">
            Oldest first
          </option>
          <option value="title">
            Title A–Z
          </option>
        </select>
      </section>

      {showFilters && (
        <section className="filter-panel">
          <label>
            <span>Participant</span>
            <input
              value={participant}
              onChange={(event) =>
                setParticipant(
                  event.target.value,
                )
              }
              placeholder="e.g. Mehak Yadav"
            />
          </label>

          <label>
            <span>Topic</span>
            <input
              value={topic}
              onChange={(event) =>
                setTopic(event.target.value)
              }
              placeholder="e.g. Onboarding"
            />
          </label>

          <label>
            <span>From date</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(event.target.value)
              }
            />
          </label>

          <label>
            <span>To date</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(event.target.value)
              }
            />
          </label>

          <button
            type="button"
            className="secondary"
            onClick={clearFilters}
            disabled={activeFilterCount === 0}
          >
            <X size={16} />
            Clear filters
          </button>
        </section>
      )}

      <div className="result-meta">
        <div>
          <b>
            {visibleMeetings.length} meeting
            {visibleMeetings.length === 1 ? "" : "s"}
          </b>

          <span>
            Transcripts, summaries and action items
          </span>
        </div>

        {(search || activeFilterCount > 0) && (
          <small>
            Showing filtered workspace results
          </small>
        )}
      </div>

      {loading ? (
        <div className="meeting-grid">
          {[1, 2, 3].map((item) => (
            <div
              className="meeting-card meeting-card-skeleton"
              key={item}
            >
              <div className="skeleton-line short" />
              <div className="skeleton-line title" />
              <div className="skeleton-line" />
              <div className="skeleton-line medium" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="empty error-empty">
          <h3>Unable to load meetings</h3>
          <p>{error}</p>

          <button
            type="button"
            className="primary"
            onClick={loadMeetings}
          >
            Try again
          </button>
        </div>
      ) : visibleMeetings.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Search size={26} />
          </div>

          <h3>No meetings found</h3>

          <p>
            Try another keyword or clear your
            active filters.
          </p>

          <div className="empty-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setSearch("");
                clearFilters();
              }}
            >
              Clear search
            </button>

            <button
              type="button"
              className="primary"
              onClick={() =>
                setModalOpen(true)
              }
            >
              <Plus size={17} />
              Add meeting
            </button>
          </div>
        </div>
      ) : (
        <div className="meeting-grid">
          {visibleMeetings.map((meeting) => (
            <MeetingCard
              meeting={meeting}
              key={meeting.id}
            />
          ))}
        </div>
      )}

      <CreateMeetingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          loadMeetings();
          setToast("Meeting created");
        }}
      />
    </>
  );
}