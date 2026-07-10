import { ClipboardList, Edit3, Plus, Trash2, Users } from "lucide-react";
import { ActionItem, Participant } from "@/lib/types";
import { initials } from "@/lib/format";

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
  const openCount = actionItems.filter((item) => !item.completed).length;

  return (
    <aside className="mf-side-panel">
      <section className="mf-side-section">
        <div className="mf-side-heading">
          <div>
            <ClipboardList size={18} />
            <h3>Action items</h3>
          </div>
          <span>{openCount} open</span>
        </div>

        <form className="mf-add-task" onSubmit={onAddTask}>
          <input
            value={newTask}
            onChange={(event) => onNewTaskChange(event.target.value)}
            placeholder="Add a follow-up task"
            aria-label="New action item"
          />
          <button type="submit" aria-label="Add action item">
            <Plus size={18} />
          </button>
        </form>

        <div className="mf-task-list">
          {actionItems.length === 0 ? (
            <div className="mf-mini-empty">No action items yet.</div>
          ) : (
            actionItems.map((item) => (
              <article className={`mf-task ${item.completed ? "is-complete" : ""}`} key={item.id}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onToggleTask(item.id, !item.completed)}
                  aria-label={`Mark ${item.text} as ${item.completed ? "open" : "complete"}`}
                />
                <div className="mf-task-copy">
                  <b>{item.text}</b>
                  <span>
                    {item.assignee || "Unassigned"}
                    {item.due_date ? ` • ${item.due_date}` : ""}
                  </span>
                </div>
                <div className="mf-task-actions">
                  <button type="button" onClick={() => onEditTask(item)} aria-label="Edit action item">
                    <Edit3 size={14} />
                  </button>
                  <button type="button" onClick={() => onDeleteTask(item.id)} aria-label="Delete action item">
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mf-side-section mf-participants-section">
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
              <span>{initials(participant.name)}</span>
              <div>
                <b>{participant.name}</b>
                <small>{participant.email || "Participant"}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}
