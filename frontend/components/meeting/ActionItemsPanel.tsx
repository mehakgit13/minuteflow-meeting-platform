"use client";

import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { initials } from "@/lib/format";
import { ActionItem, Participant } from "@/lib/types";

type Filter = "all" | "open" | "completed";

type Props = {
  actionItems: ActionItem[];
  participants: Participant[];
  newTask: string;
  onNewTaskChange: (value: string) => void;
  onAddTask: (event: React.FormEvent) => void;
  onToggleTask: (id: number, completed: boolean) => void;
  onEditTask: (task: ActionItem) => void;
  onDeleteTask: (id: number) => void;
};

function getDueState(item: ActionItem) {
  if (item.completed) {
    return { label: "Completed", className: "is-completed" };
  }

  if (!item.due_date) {
    return { label: "No due date", className: "is-neutral" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${item.due_date}T00:00:00`);
  const difference = dueDate.getTime() - today.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (difference < 0) {
    return { label: "Overdue", className: "is-overdue" };
  }

  if (difference < oneDay) {
    return { label: "Due today", className: "is-due-today" };
  }

  return {
    label: new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(dueDate),
    className: "is-upcoming",
  };
}

export function ActionItemsPanel({
  actionItems,
  participants,
  newTask,
  onNewTaskChange,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const openCount = actionItems.filter((item) => !item.completed).length;
  const completedCount = actionItems.length - openCount;

  const visibleItems = useMemo(() => {
    if (filter === "open") {
      return actionItems.filter((item) => !item.completed);
    }

    if (filter === "completed") {
      return actionItems.filter((item) => item.completed);
    }

    return actionItems;
  }, [actionItems, filter]);

  return (
    <aside className="mf-side-panel">
      <section className="mf-action-section">
        <div className="mf-side-heading">
          <div>
            <ClipboardList size={18} />
            <h3>Action items</h3>
          </div>

          <span>{openCount} open</span>
        </div>

        <div className="mf-action-summary">
          <span>{openCount} open</span>
          <span>•</span>
          <span>{completedCount} completed</span>
        </div>

        <form className="mf-add-task" onSubmit={onAddTask}>
          <input
            value={newTask}
            onChange={(event) => onNewTaskChange(event.target.value)}
            placeholder="Add a follow-up task"
            aria-label="New action item"
            maxLength={240}
          />

          <button
            type="submit"
            className="primary"
            disabled={!newTask.trim()}
            aria-label="Add action item"
          >
            <Plus size={18} />
          </button>
        </form>

        <div className="mf-task-filters" role="tablist">
          {(["all", "open", "completed"] as Filter[]).map((value) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "is-active" : ""}
              onClick={() => setFilter(value)}
              role="tab"
              aria-selected={filter === value}
            >
              {value === "all"
                ? `All ${actionItems.length}`
                : value === "open"
                  ? `Open ${openCount}`
                  : `Completed ${completedCount}`}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <div className="mf-task-empty">
            <CheckCircle2 size={22} />
            <b>
              {filter === "completed"
                ? "No completed tasks"
                : filter === "open"
                  ? "No open tasks"
                  : "No action items yet"}
            </b>
            <p>
              {filter === "open"
                ? "Everything is complete."
                : "Add a follow-up task above."}
            </p>
          </div>
        ) : (
          <div className="mf-task-list">
            {visibleItems.map((item) => {
              const dueState = getDueState(item);

              return (
                <article
                  className={`mf-task-item ${
                    item.completed ? "is-complete" : ""
                  }`}
                  key={item.id}
                >
                  <label className="mf-task-checkbox">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        onToggleTask(item.id, !item.completed)
                      }
                      aria-label={`Mark ${item.text} as ${
                        item.completed ? "open" : "complete"
                      }`}
                    />
                    <span />
                  </label>

                  <div className="mf-task-content">
                    <b>{item.text}</b>

                    <div className="mf-task-meta">
                      <span>{item.assignee || "Unassigned"}</span>

                      <span className={`mf-due-badge ${dueState.className}`}>
                        <CalendarClock size={12} />
                        {dueState.label}
                      </span>
                    </div>
                  </div>

                  <div className="mf-task-actions">
                    <button
                      type="button"
                      onClick={() => onEditTask(item)}
                      aria-label="Edit action item"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(item.id)}
                      aria-label="Delete action item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mf-participant-section">
        <div className="mf-side-heading">
          <div>
            <Users size={18} />
            <h3>Participants</h3>
          </div>

          <span>{participants.length}</span>
        </div>

        <div className="mf-participant-list">
          {participants.map((participant) => (
            <article key={participant.id}>
              <span className="mf-participant-avatar">
                {initials(participant.name)}
              </span>

              <div>
                <b>{participant.name}</b>
                <small>{participant.email || "Meeting participant"}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}
