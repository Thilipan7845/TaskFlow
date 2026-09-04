import {
  X,
  CalendarDays,
  Flag,
  CheckCircle2,
  Tag,
  Pencil,
  Trash2,
  Clock,
  Star,
} from "lucide-react";

import SubtaskList from "./SubtaskList";
import DependencyManager from "./DependencyManager";
import CollaborationPanel from "./CollaborationPanel";

function TaskDetails({
  task,
  allTasks = [],
  onClose,
  onEdit,
  onComplete,
  onDelete,
  onProgressChange,
  onDependencyChange,
}) {
  if (!task) {
    return null;
  }

  function formatDate(date) {
    if (!date) {
      return "No deadline";
    }

    const formattedDate = new Date(
      `${date}T00:00:00`
    );

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "No deadline";
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  function formatCreatedDate(date) {
    if (!date) {
      return "Unknown";
    }

    const formattedDate = new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "Unknown";
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <div
      className="task-details-overlay"
      onClick={onClose}
    >
      <div
        className="task-details-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* CLOSE */}

        <button
          type="button"
          className="task-details-close"
          onClick={onClose}
          aria-label="Close task details"
        >
          <X size={21} />
        </button>

        {/* HEADER */}

        <div className="task-details-header">
          <div>
            <p className="task-details-label">
              TASK DETAILS
            </p>

            <h2>
              {task.title}
            </h2>

            {task.isImportant && (
              <div className="task-details-important">
                <Star
                  size={16}
                  fill="currentColor"
                />

                Important Task
              </div>
            )}
          </div>

          <span
            className={`task-details-status ${
              task.status
                ?.toLowerCase()
                .replace(/\s+/g, "-") ||
              ""
            }`}
          >
            {task.status}
          </span>
        </div>

        {/* DESCRIPTION */}

        <div className="task-details-description">
          <h3>
            Description
          </h3>

          <p>
            {task.description ||
              "No description provided for this task."}
          </p>
        </div>

        {/* INFORMATION */}

        <div className="task-details-info-grid">
          <div className="task-details-info">
            <div className="task-details-info-icon">
              <Flag size={18} />
            </div>

            <div>
              <span>
                Priority
              </span>

              <strong>
                {task.priority}
              </strong>
            </div>
          </div>

          <div className="task-details-info">
            <div className="task-details-info-icon">
              <CalendarDays
                size={18}
              />
            </div>

            <div>
              <span>
                Due Date
              </span>

              <strong>
                {formatDate(
                  task.dueDate
                )}
              </strong>
            </div>
          </div>

          <div className="task-details-info">
            <div className="task-details-info-icon">
              <Clock size={18} />
            </div>

            <div>
              <span>
                Created
              </span>

              <strong>
                {formatCreatedDate(
                  task.createdAt
                )}
              </strong>
            </div>
          </div>

          <div className="task-details-info">
            <div className="task-details-info-icon">
              <CheckCircle2
                size={18}
              />
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {task.status}
              </strong>
            </div>
          </div>
        </div>

        {/* TAGS */}

        <div className="task-details-tags-section">
          <div className="task-details-tags-heading">
            <Tag size={18} />

            <h3>
              Tags
            </h3>
          </div>

          {Array.isArray(task.tags) &&
          task.tags.length > 0 ? (
            <div className="task-details-tags">
              {task.tags.map(
                (tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          ) : (
            <p className="task-details-no-tags">
              No tags added.
            </p>
          )}
        </div>

        {/* SUBTASKS */}

        <SubtaskList
          taskId={task.id}
          onProgressChange={
            onProgressChange
          }
        />

        {/* DEPENDENCIES */}

        <DependencyManager
          task={task}
          allTasks={allTasks}
          onDependencyChange={
            onDependencyChange
          }
        />

        {/* COLLABORATION */}

        <CollaborationPanel
          task={task}
        />

        {/* ACTIONS */}

        <div className="task-details-actions">
          <button
            type="button"
            className="task-details-edit"
            onClick={() => {
              onEdit(task);
              onClose();
            }}
          >
            <Pencil size={18} />

            Edit Task
          </button>

          {task.status !==
            "Completed" && (
            <button
              type="button"
              className="task-details-complete"
              onClick={() => {
                onComplete(task.id);
                onClose();
              }}
            >
              <CheckCircle2
                size={18}
              />

              Mark Complete
            </button>
          )}

          <button
            type="button"
            className="task-details-delete"
            onClick={() => {
              const confirmed =
                window.confirm(
                  `Delete "${task.title}"?`
                );

              if (confirmed) {
                onDelete(task.id);
                onClose();
              }
            }}
          >
            <Trash2 size={18} />

            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;