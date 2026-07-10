"use client";
import { useState } from "react";
import { X, UploadCloud } from "lucide-react";
import { api } from "@/lib/api";
export function CreateMeetingModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!open) return null;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      if (mode === "upload") {
        await api.upload(fd);
      } else {
        await api.create({
          title: fd.get("title"),
          meeting_date: fd.get("meeting_date"),
          participants: String(fd.get("participants") || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          transcript: fd.get("transcript"),
        });
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create meeting");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2>Add meeting</h2>
            <p>Import a transcript or paste meeting notes.</p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="tabs">
          <button
            className={mode === "paste" ? "active" : ""}
            onClick={() => setMode("paste")}
          >
            Paste transcript
          </button>
          <button
            className={mode === "upload" ? "active" : ""}
            onClick={() => setMode("upload")}
          >
            Upload file
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            Meeting title
            <input
              name="title"
              required
              minLength={2}
              placeholder="e.g. Product roadmap review"
            />
          </label>
          <div className="form-grid">
            <label>
              Date
              <input
                type="date"
                name="meeting_date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </label>
            <label>
              Participants
              <input
                name="participants"
                placeholder="Names, separated by commas"
              />
            </label>
          </div>
          {mode === "paste" ? (
            <label>
              Transcript
              <textarea
                name="transcript"
                rows={9}
                placeholder="[00:00] Speaker: Paste transcript here..."
                required
              />
            </label>
          ) : (
            <label className="dropzone">
              <UploadCloud size={28} />
              <b>Choose transcript file</b>
              <span>.txt, .vtt, or .srt</span>
              <input
                type="file"
                name="transcript_file"
                accept=".txt,.vtt,.srt"
                required
              />
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" disabled={busy}>
              {busy ? "Processing…" : "Create meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
