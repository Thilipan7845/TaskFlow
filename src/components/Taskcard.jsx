import {
  CalendarDays,
  Trash2,
  CheckCircle2,
  Pencil,
  Users,
  Crown,
} from "lucide-react";

import ImportantTask from "./ImportantTask";


function TaskCard({
  id,
  title,
  description,
  priority,
  dueDate,
  dueStatus,
  status,
  tags,
  isImportant,
  progress = 0,

  // =========================================
  // COLLABORATION
  // =========================================

  isShared = false,
  isOwner = true,

  onToggleImportant,
  onDelete,
  onComplete,
  onEdit,
  onView,
}) {


  // =========================================
  // DUE LABEL
  // =========================================

  function getDueLabel() {

    switch (dueStatus) {

      case "overdue":
        return "OVERDUE";

      case "today":
        return "DUE TODAY";

      case "soon":
        return "DUE SOON";

      case "upcoming":
        return "UPCOMING";

      case "completed":
        return "COMPLETED";

      case "none":
      default:
        return "NO DEADLINE";

    }

  }


  // =========================================
  // CARD CLICK
  // =========================================

  function handleCardClick() {

    if (onView) {

      onView();

    }

  }


  return (

    <article
      className={`task-card
        ${
          isImportant
            ? "task-card-important"
            : ""
        }
        ${
          isShared
            ? "task-card-shared"
            : ""
        }
      `}
      onClick={
        handleCardClick
      }
      style={{
        cursor: "pointer",
      }}
    >


      {/* =====================================
          TOP
      ====================================== */}

      <div className="task-card-top">


        <div className="task-card-top-left">


          {/* PRIORITY */}

          <span
            className={`priority priority-${priority.toLowerCase()}`}
          >
            {priority}
          </span>


          {/* SHARED BADGE */}

          {isShared && (

            <span className="shared-task-badge">

              <Users size={13} />

              Shared

            </span>

          )}


          {/* OWNER BADGE */}

          {isOwner && !isShared && (

            <span className="owner-task-badge">

              <Crown size={13} />

              Owner

            </span>

          )}

        </div>


        <div className="task-actions">


          {/* IMPORTANT */}

          <ImportantTask
            isImportant={
              isImportant
            }
            onToggle={() =>
              onToggleImportant(
                id
              )
            }
          />


          {/* EDIT

              Owner can edit.
              Collaborator cannot edit.
          */}

          {isOwner && (

            <button
              type="button"
              className="edit-task-btn"
              onClick={(event) => {

                event.stopPropagation();

                onEdit();

              }}
              title="Edit task"
            >

              <Pencil size={17} />

            </button>

          )}


          {/* DELETE

              Only owner can delete.
          */}

          {isOwner && (

            <button
              type="button"
              className="delete-task-btn"
              onClick={(event) => {

                event.stopPropagation();

                onDelete(
                  id
                );

              }}
              title="Delete task"
            >

              <Trash2 size={17} />

            </button>

          )}

        </div>

      </div>


      {/* =====================================
          TITLE
      ====================================== */}

      <h3>

        {title}

      </h3>


      {/* =====================================
          DESCRIPTION
      ====================================== */}

      <p>

        {
          description ||
          "No description provided."
        }

      </p>


      {/* =====================================
          SHARED TASK MESSAGE
      ====================================== */}

      {isShared && (

        <div className="shared-task-info">

          <Users size={15} />

          <span>

            You are collaborating on this task.

          </span>

        </div>

      )}


      {/* =====================================
          TAGS
      ====================================== */}

      {
        tags &&
        tags.length > 0 && (

          <div className="task-card-tags">

            {
              tags.map(
                (
                  tag,
                  index
                ) => (

                  <span
                    key={`${tag}-${index}`}
                  >

                    #{tag}

                  </span>

                )
              )
            }

          </div>

        )
      }


      {/* =====================================
          PROGRESS
      ====================================== */}

      <div className="task-card-progress">


        <div className="task-card-progress-header">

          <span>

            Progress

          </span>


          <strong>

            {progress}%

          </strong>

        </div>


        <div className="task-card-progress-track">

          <div
            className="task-card-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>


      {/* =====================================
          BOTTOM
      ====================================== */}

      <div className="task-card-bottom">


        <div
          className={`task-date task-date-${dueStatus}`}
        >

          <CalendarDays
            size={16}
          />

          {
            dueDate &&
            dueDate !== "No date"
              ? dueDate
              : "No deadline"
          }

        </div>


        <span
          className={`status status-${status
            .toLowerCase()
            .replace(
              /\s+/g,
              "-"
            )}`}
        >

          {status}

        </span>

      </div>


      {/* =====================================
          DUE INDICATOR
      ====================================== */}

      <div
        className={`task-due-indicator task-due-${dueStatus}`}
      >

        <span className="task-due-dot" />

        <span>

          {getDueLabel()}

        </span>

      </div>


      {/* =====================================
          COMPLETE

          Both owner and collaborator
          can complete the task.
      ====================================== */}

      {
        status !==
          "Completed" && (

          <button
            type="button"
            className="complete-task-btn"
            onClick={(event) => {

              event.stopPropagation();

              onComplete(
                id
              );

            }}
          >

            <CheckCircle2
              size={17}
            />

            Mark as Completed

          </button>

        )
      }


    </article>

  );

}


export default TaskCard;