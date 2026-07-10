"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { ActionItem, MeetingDetail } from "@/lib/types";
import { formatDuration, formatTime } from "@/lib/format";
import { ActionItemsPanel } from "@/components/meeting/ActionItemsPanel";
import { MediaPlayer } from "@/components/meeting/MediaPlayer";
import { MeetingHeader } from "@/components/meeting/MeetingHeader";
import { SummaryPanel } from "@/components/meeting/SummaryPanel";
import { TranscriptPanel } from "@/components/meeting/TranscriptPanel";

export function MeetingDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"summary" | "transcript">("summary");
  const [query, setQuery] = useState("");
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [newTask, setNewTask] = useState("");
  const [editingMeeting, setEditingMeeting] = useState(false);
  const [editingTask, setEditingTask] = useState<ActionItem | null>(null);
  const [toast, setToast] = useState("");

  async function loadMeeting(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const data = await api.meeting(id);
      setMeeting(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the meeting.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMeeting(true);
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!playing || !meeting) return;

    const timer = window.setInterval(() => {
      setTime((current) => {
        const next = current + speed;
        if (next >= meeting.duration_seconds) {
          setPlaying(false);
          return meeting.duration_seconds;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [playing, meeting, speed]);

  const activeId = useMemo(
    () =>
      meeting?.segments.find(
        (segment) =>
          time >= segment.start_seconds && time < segment.end_seconds,
      )?.id,
    [meeting, time],
  );

  async function runMutation(
    operation: () => Promise<unknown>,
    successMessage: string,
  ) {
    try {
      setError("");
      await operation();
      await loadMeeting();
      setToast(successMessage);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The requested update failed.",
      );
    }
  }

  async function toggleAction(actionId: number, completed: boolean) {
    await runMutation(
      () => api.updateAction(id, actionId, { completed }),
      completed ? "Action item completed" : "Action item reopened",
    );
  }

  async function addAction(event: React.FormEvent) {
    event.preventDefault();
    if (!newTask.trim()) return;

    const text = newTask.trim();
    setNewTask("");
    await runMutation(
      () => api.addAction(id, { text, completed: false }),
      "Action item added",
    );
  }

  async function deleteAction(actionId: number) {
    if (!window.confirm("Delete this action item?")) return;
    await runMutation(
      () => api.deleteAction(id, actionId),
      "Action item deleted",
    );
  }

  async function saveTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTask) return;

    const form = new FormData(event.currentTarget);
    const taskId = editingTask.id;
    setEditingTask(null);

    await runMutation(
      () =>
        api.updateAction(id, taskId, {
          text: String(form.get("text") || "").trim(),
          assignee: String(form.get("assignee") || "").trim() || null,
          due_date: String(form.get("due_date") || "") || null,
        }),
      "Action item updated",
    );
  }

  async function saveMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setEditingMeeting(false);

    await runMutation(
      () =>
        api.update(id, {
          title: String(form.get("title") || "").trim(),
          meeting_date: String(form.get("meeting_date") || ""),
          participants: String(form.get("participants") || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          summary: String(form.get("summary") || "").trim(),
        }),
      "Meeting updated",
    );
  }

  async function removeMeeting() {
    if (!window.confirm("Delete this meeting and all related data permanently?")) {
      return;
    }

    try {
      await api.remove(id);
      router.push("/");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete the meeting.",
      );
    }
  }

  function handleExport() {
    const exportMarkdown = window.confirm(
      "Click OK to export Markdown, or Cancel to export TXT.",
    );

    downloadExport(exportMarkdown ? "md" : "txt");
  }

  async function copyMeetingLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Meeting link copied");
    } catch {
      setToast("Copy the URL from your browser");
    }
  }

  function openTranscriptAt(seconds: number) {
    setTime(seconds);
    setTab("transcript");
    window.setTimeout(() => {
      document
        .querySelector(".mf-content-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
function buildMeetingExport(
  format: "txt" | "md",
) {
  if (!meeting) return "";

  const actionItems = meeting.action_items
    .map((item) => {
      const status = item.completed ? "x" : " ";
      const assignee = item.assignee
        ? ` — ${item.assignee}`
        : "";

      return format === "md"
        ? `- [${status}] ${item.text}${assignee}`
        : `${item.completed ? "DONE" : "OPEN"}: ${item.text}${assignee}`;
    })
    .join("\n");

  const transcript = meeting.segments
    .map(
      (segment) =>
        `[${formatTime(segment.start_seconds)}] ${segment.speaker}: ${segment.text}`,
    )
    .join("\n\n");

  if (format === "md") {
    return `# ${meeting.title}

## Meeting details

- Date: ${meeting.meeting_date}
- Duration: ${formatDuration(
      meeting.duration_seconds,
    )}
- Participants: ${meeting.participants
      .map((person) => person.name)
      .join(", ")}

## AI summary

${meeting.summary}

## Topics

${meeting.topics
  .map((topic) => `- ${topic.label}`)
  .join("\n")}

## Action items

${actionItems || "No action items."}

## Transcript

${transcript}
`;
  }

  return `${meeting.title}

MEETING DETAILS
Date: ${meeting.meeting_date}
Duration: ${formatDuration(
    meeting.duration_seconds,
  )}
Participants: ${meeting.participants
    .map((person) => person.name)
    .join(", ")}

AI SUMMARY
${meeting.summary}

TOPICS
${meeting.topics
  .map((topic) => `- ${topic.label}`)
  .join("\n")}

ACTION ITEMS
${actionItems || "No action items."}

TRANSCRIPT
${transcript}
`;
}

function downloadExport(
  format: "txt" | "md",
) {
  if (!meeting) return;

  const content = buildMeetingExport(format);
  const blob = new Blob([content], {
    type:
      format === "md"
        ? "text/markdown;charset=utf-8"
        : "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${meeting.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.${format}`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
  setToast(
    `${format.toUpperCase()} export downloaded`,
  );
}
  if (loading) {
    return (
      <div className="mf-detail-loading" aria-live="polite">
        <div className="mf-skeleton mf-skeleton-title" />
        <div className="mf-skeleton mf-skeleton-player" />
        <div className="mf-skeleton mf-skeleton-panel" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="mf-error-state">
        <h2>Meeting could not be loaded</h2>
        <p>{error || "The meeting may have been deleted."}</p>
        <button className="mf-button mf-button-primary" onClick={() => loadMeeting(true)}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mf-detail-page">
      {toast && (
        <div className="mf-toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}

      {error && (
        <div className="mf-inline-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={15} />
          </button>
        </div>
      )}

      <MeetingHeader
        meeting={meeting}
        onBack={() => router.push("/")}
        onExport={handleExport}
        onEdit={() => setEditingMeeting(true)}
        onDelete={removeMeeting}
        onCopyLink={copyMeetingLink}
      />

      <MediaPlayer
        currentTime={time}
        duration={meeting.duration_seconds}
        playing={playing}
        speed={speed}
        onToggle={() => setPlaying((value) => !value)}
        onSeek={setTime}
        onSpeedChange={setSpeed}
      />

      <div className="mf-detail-layout">
        <section className="mf-content-panel">
          <div className="mf-tabs" role="tablist" aria-label="Meeting content">
            <button
              className={tab === "summary" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={tab === "summary"}
              onClick={() => setTab("summary")}
            >
              AI Summary
            </button>
            <button
              className={tab === "transcript" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={tab === "transcript"}
              onClick={() => setTab("transcript")}
            >
              Transcript
              <span>{meeting.segments.length}</span>
            </button>
          </div>

          {tab === "summary" ? (
            <SummaryPanel
              meeting={meeting}
              onOpenTranscriptAt={openTranscriptAt}
            />
          ) : (
            <TranscriptPanel
              segments={meeting.segments}
              query={query}
              activeId={activeId}
              onQueryChange={setQuery}
              onSeek={setTime}
            />
          )}
        </section>

        <ActionItemsPanel
          actionItems={meeting.action_items}
          participants={meeting.participants}
          newTask={newTask}
          onNewTaskChange={setNewTask}
          onAddTask={addAction}
          onToggleTask={toggleAction}
          onEditTask={setEditingTask}
          onDeleteTask={deleteAction}
        />
      </div>

      {editingMeeting && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-meeting-title">
            <div className="modal-head">
              <div>
                <h2 id="edit-meeting-title">Edit meeting</h2>
                <p>Update metadata, participants, and the saved summary.</p>
              </div>
              <button className="icon-btn" type="button" onClick={() => setEditingMeeting(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveMeeting}>
              <label>
                Title
                <input name="title" defaultValue={meeting.title} required minLength={2} />
              </label>
              <div className="form-grid">
                <label>
                  Date
                  <input type="date" name="meeting_date" defaultValue={meeting.meeting_date} required />
                </label>
                <label>
                  Participants (comma separated)
                  <input
                    name="participants"
                    defaultValue={meeting.participants.map((participant) => participant.name).join(", ")}
                  />
                </label>
              </div>
              <label>
                Summary
                <textarea name="summary" rows={7} defaultValue={meeting.summary} />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setEditingMeeting(false)}>
                  Cancel
                </button>
                <button className="primary" type="submit">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal small-modal" role="dialog" aria-modal="true" aria-labelledby="edit-task-title">
            <div className="modal-head">
              <div>
                <h2 id="edit-task-title">Edit action item</h2>
                <p>Change the task, owner, or due date.</p>
              </div>
              <button className="icon-btn" type="button" onClick={() => setEditingTask(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveTask}>
              <label>
                Task
                <input name="text" defaultValue={editingTask.text} required />
              </label>
              <div className="form-grid">
                <label>
                  Assignee
                  <input name="assignee" defaultValue={editingTask.assignee || ""} />
                </label>
                <label>
                  Due date
                  <input type="date" name="due_date" defaultValue={editingTask.due_date || ""} />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setEditingTask(null)}>
                  Cancel
                </button>
                <button className="primary" type="submit">Update action</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
