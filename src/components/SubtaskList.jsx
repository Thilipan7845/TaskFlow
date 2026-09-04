import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function SubtaskList({ taskId }) {
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * LOAD SUBTASKS
   */
  useEffect(() => {
    async function loadSubtasks() {
      if (!taskId) {
        setSubtasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("subtasks")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Error fetching subtasks:",
          error
        );

        setLoading(false);
        return;
      }

      setSubtasks(data || []);
      setLoading(false);
    }

    loadSubtasks();
  }, [taskId]);

  /*
   * CALCULATE PROGRESS
   */
  const progress = useMemo(() => {
    if (subtasks.length === 0) {
      return 0;
    }

    const completed = subtasks.filter(
      (subtask) => subtask.is_completed
    ).length;

    return Math.round(
      (completed / subtasks.length) * 100
    );
  }, [subtasks]);

  const completedCount = subtasks.filter(
    (subtask) => subtask.is_completed
  ).length;

  /*
   * ADD SUBTASK
   */
  async function handleAddSubtask(event) {
    event.preventDefault();

    const title = newSubtask.trim();

    if (!title) {
      return;
    }

    if (!taskId) {
      alert("Task ID is missing.");
      return;
    }

    setSaving(true);

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      setSaving(false);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("subtasks")
      .insert([
        {
          task_id: taskId,
          user_id: user.id,
          title: title,
          is_completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(
        "Error adding subtask:",
        error
      );

      alert(
        "Failed to add subtask: " +
          error.message
      );

      setSaving(false);
      return;
    }

    setSubtasks((current) => [
      ...current,
      data,
    ]);

    setNewSubtask("");
    setSaving(false);
  }

  /*
   * TOGGLE SUBTASK
   */
  async function handleToggleSubtask(subtask) {
    const newStatus =
      !subtask.is_completed;

    const {
      error,
    } = await supabase
      .from("subtasks")
      .update({
        is_completed: newStatus,
      })
      .eq("id", subtask.id);

    if (error) {
      console.error(
        "Error updating subtask:",
        error
      );

      alert(
        "Failed to update subtask: " +
          error.message
      );

      return;
    }

    setSubtasks((current) =>
      current.map((item) =>
        item.id === subtask.id
          ? {
              ...item,
              is_completed: newStatus,
            }
          : item
      )
    );
  }

  /*
   * START EDITING
   */
  function startEditing(subtask) {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
  }

  /*
   * CANCEL EDITING
   */
  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  /*
   * SAVE EDIT
   */
  async function handleEditSubtask(subtaskId) {
    const title = editingTitle.trim();

    if (!title) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("subtasks")
      .update({
        title: title,
      })
      .eq("id", subtaskId);

    if (error) {
      console.error(
        "Error editing subtask:",
        error
      );

      alert(
        "Failed to edit subtask: " +
          error.message
      );

      return;
    }

    setSubtasks((current) =>
      current.map((item) =>
        item.id === subtaskId
          ? {
              ...item,
              title: title,
            }
          : item
      )
    );

    cancelEditing();
  }

  /*
   * DELETE SUBTASK
   */
  async function handleDeleteSubtask(subtask) {
    const confirmed = window.confirm(
      `Delete "${subtask.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("subtasks")
      .delete()
      .eq("id", subtask.id);

    if (error) {
      console.error(
        "Error deleting subtask:",
        error
      );

      alert(
        "Failed to delete subtask: " +
          error.message
      );

      return;
    }

    setSubtasks((current) =>
      current.filter(
        (item) =>
          item.id !== subtask.id
      )
    );
  }

  /*
   * UI
   */
  return (
    <section className="subtask-section">

      {/* HEADER */}
      <div className="subtask-header">
        <div>
          <h3>Subtasks</h3>

          <span>
            {completedCount} of{" "}
            {subtasks.length} completed
          </span>
        </div>

        <strong>
          {progress}%
        </strong>
      </div>

      {/* PROGRESS BAR */}
      <div className="subtask-progress-track">
        <div
          className="subtask-progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* ADD SUBTASK */}
      <form
        className="subtask-add-form"
        onSubmit={handleAddSubtask}
      >
        <input
          type="text"
          placeholder="Add a subtask..."
          value={newSubtask}
          onChange={(event) =>
            setNewSubtask(
              event.target.value
            )
          }
          disabled={saving}
        />

        <button
          type="submit"
          disabled={
            saving ||
            !newSubtask.trim()
          }
        >
          <Plus size={18} />
          Add
        </button>
      </form>

      {/* LOADING */}
      {loading && (
        <div className="subtask-empty">
          Loading subtasks...
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        subtasks.length === 0 && (
          <div className="subtask-empty">
            <p>No subtasks yet.</p>

            <span>
              Break this task into
              smaller steps to track
              your progress.
            </span>
          </div>
        )}

      {/* SUBTASK LIST */}
      {!loading &&
        subtasks.length > 0 && (
          <div className="subtask-list">

            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={`subtask-item ${
                  subtask.is_completed
                    ? "subtask-completed"
                    : ""
                }`}
              >

                {/* CHECKBOX */}
                <button
                  type="button"
                  className="subtask-check"
                  onClick={() =>
                    handleToggleSubtask(
                      subtask
                    )
                  }
                  aria-label={
                    subtask.is_completed
                      ? "Mark incomplete"
                      : "Mark complete"
                  }
                >
                  {subtask.is_completed && (
                    <Check size={15} />
                  )}
                </button>

                {/* EDIT MODE */}
                {editingId ===
                subtask.id ? (
                  <div className="subtask-edit-area">

                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(event) =>
                        setEditingTitle(
                          event.target.value
                        )
                      }
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleEditSubtask(
                          subtask.id
                        )
                      }
                      title="Save"
                    >
                      <Check size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelEditing
                      }
                      title="Cancel"
                    >
                      <X size={17} />
                    </button>

                  </div>
                ) : (
                  <>
                    {/* TITLE */}
                    <span className="subtask-title">
                      {subtask.title}
                    </span>

                    {/* ACTIONS */}
                    <div className="subtask-actions">

                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            subtask
                          )
                        }
                        title="Edit subtask"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteSubtask(
                            subtask
                          )
                        }
                        title="Delete subtask"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </>
                )}

              </div>
            ))}

          </div>
        )}

    </section>
  );
}

export default SubtaskList;