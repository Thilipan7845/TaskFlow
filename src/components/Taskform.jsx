import { useState } from "react";
import { Plus, Save, X } from "lucide-react";

function Taskform({
  onAddTask,
  editingTask,
  onUpdateTask,
  onCancelEdit,
}) {
  return (
    <TaskformContent
      key={editingTask ? editingTask.id : "new-task"}
      onAddTask={onAddTask}
      editingTask={editingTask}
      onUpdateTask={onUpdateTask}
      onCancelEdit={onCancelEdit}
    />
  );
}

function TaskformContent({
  onAddTask,
  editingTask,
  onUpdateTask,
  onCancelEdit,
}) {
  // Check if we are editing
  const isEditing = Boolean(editingTask);

  // Initial values
  const [title, setTitle] = useState(
    editingTask?.title || ""
  );

  const [description, setDescription] = useState(
    editingTask?.description || ""
  );

  const [priority, setPriority] = useState(
    editingTask?.priority || "Medium"
  );

  const [dueDate, setDueDate] = useState(() => {
    const date = editingTask?.dueDate || "";

    // HTML date input requires YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    return "";
  });

  const [status, setStatus] = useState(
    editingTask?.status || "To Do"
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setStatus("To Do");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || "No date",
      status,
    };

    // UPDATE EXISTING TASK
    if (isEditing) {
      onUpdateTask({
        ...taskData,
        id: editingTask.id,
      });

      return;
    }

    // ADD NEW TASK
    onAddTask(taskData);

    resetForm();
  }

  function handleCancel() {
    resetForm();

    onCancelEdit();
  }

  return (
    <section
      className="task-form-section"
      id="add-task"
    >
      <div className="section-heading">
        <div>
          <p className="section-label">
            {isEditing ? "EDITING" : "CREATE"}
          </p>

          <h2>
            {isEditing
              ? "Edit Task"
              : "Add New Task"}
          </h2>
        </div>
      </div>

      <form
        className="task-form"
        onSubmit={handleSubmit}
      >
        <div className="task-form-grid">

          {/* TASK TITLE */}

          <div className="form-group">
            <label>Task Title</label>

            <input
              type="text"
              placeholder="What do you need to do?"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />
          </div>

          {/* PRIORITY */}

          <div className="form-group">
            <label>Priority</label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
            >
              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>
            </select>
          </div>

        </div>

        {/* DESCRIPTION */}

        <div className="form-group">
          <label>Description</label>

          <textarea
            rows="4"
            placeholder="Add more details about your task..."
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </div>

        <div className="task-form-grid">

          {/* DUE DATE */}

          <div className="form-group">
            <label>Due Date</label>

            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
            />
          </div>

          {/* STATUS */}

          <div className="form-group">
            <label>Status</label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="To Do">
                To Do
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>
          </div>

        </div>

        <div className="task-form-actions">

          {/* ADD / UPDATE */}

          <button
            type="submit"
            className="add-task-btn"
          >
            {isEditing ? (
              <>
                <Save size={18} />
                Update Task
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Task
              </>
            )}
          </button>

          {/* CANCEL */}

          {isEditing && (
            <button
              type="button"
              className="cancel-edit-btn"
              onClick={handleCancel}
            >
              <X size={18} />
              Cancel
            </button>
          )}

        </div>
      </form>
    </section>
  );
}

export default Taskform;