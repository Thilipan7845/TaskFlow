import { useEffect, useState } from "react";

import {
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  ArrowRight,
  Link2,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function DependencyManager({
  task,
  allTasks = [],
  onDependencyChange,
}) {
  // =========================================
  // STATE
  // =========================================

  const [dependencies, setDependencies] =
    useState([]);

  const [
    selectedDependencyId,
    setSelectedDependencyId,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================
  // LOAD DEPENDENCIES
  // =========================================

  useEffect(() => {
    async function loadDependencies() {
      if (!task?.id) {
        setDependencies([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            "You must be logged in."
          );
        }

        const {
          data,
          error: dependencyError,
        } =
          await supabase
            .from("task_dependencies")
            .select(`
              id,
              task_id,
              depends_on_task_id,
              user_id,
              created_at
            `)
            .eq(
              "task_id",
              task.id
            )
            .eq(
              "user_id",
              user.id
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

        if (dependencyError) {
          throw dependencyError;
        }

        setDependencies(
          data || []
        );
      } catch (err) {
        console.error(
          "Dependency loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dependencies."
        );

        setDependencies([]);
      } finally {
        setLoading(false);
      }
    }

    loadDependencies();
  }, [task?.id]);

  // =========================================
  // GET TASK BY ID
  // =========================================

  function getTask(taskId) {
    return allTasks.find(
      (item) =>
        String(item.id) ===
        String(taskId)
    );
  }

  // =========================================
  // DEPENDENCY IDS
  // =========================================

  const dependencyTaskIds =
    dependencies.map(
      (dependency) =>
        String(
          dependency.depends_on_task_id
        )
    );

  // =========================================
  // AVAILABLE PREREQUISITE TASKS
  // =========================================

  const availableTasks =
    allTasks.filter(
      (item) =>
        String(item.id) !==
          String(task?.id) &&
        !dependencyTaskIds.includes(
          String(item.id)
        )
    );

  // =========================================
  // BLOCKED DEPENDENCIES
  // =========================================

  const blockedDependencies =
    dependencies.filter(
      (dependency) => {
        const dependencyTask =
          getTask(
            dependency.depends_on_task_id
          );

        return (
          dependencyTask &&
          dependencyTask.status !==
            "Completed"
        );
      }
    );

  // =========================================
  // ADD DEPENDENCY
  // =========================================

  async function addDependency() {
    if (
      !task?.id ||
      !selectedDependencyId
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be logged in."
        );
      }

      // Prevent self dependency

      if (
        String(task.id) ===
        String(
          selectedDependencyId
        )
      ) {
        throw new Error(
          "A task cannot depend on itself."
        );
      }

      const {
        data,
        error: insertError,
      } =
        await supabase
          .from("task_dependencies")
          .insert([
            {
              task_id:
                task.id,

              depends_on_task_id:
                selectedDependencyId,

              user_id:
                user.id,
            },
          ])
          .select()
          .single();

      if (insertError) {
        throw insertError;
      }

      setDependencies(
        (current) => [
          data,
          ...current,
        ]
      );

      setSelectedDependencyId("");

      if (onDependencyChange) {
        onDependencyChange();
      }
    } catch (err) {
      console.error(
        "Dependency creation error:",
        err
      );

      // Supabase duplicate error

      if (
        err.code === "23505"
      ) {
        setError(
          "This dependency already exists."
        );
      } else {
        setError(
          err.message ||
            "Unable to add dependency."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // REMOVE DEPENDENCY
  // =========================================

  async function removeDependency(
    dependencyId
  ) {
    try {
      setError("");

      const {
        error: deleteError,
      } =
        await supabase
          .from("task_dependencies")
          .delete()
          .eq(
            "id",
            dependencyId
          );

      if (deleteError) {
        throw deleteError;
      }

      setDependencies(
        (current) =>
          current.filter(
            (dependency) =>
              dependency.id !==
              dependencyId
          )
      );

      if (onDependencyChange) {
        onDependencyChange();
      }
    } catch (err) {
      console.error(
        "Dependency deletion error:",
        err
      );

      setError(
        err.message ||
          "Unable to remove dependency."
      );
    }
  }

  // =========================================
  // SAFETY
  // =========================================

  if (!task) {
    return null;
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="dependency-manager">

      {/* SELECTED TASK */}

      <div className="selected-dependency-task">

        <span>
          Managing dependencies for
        </span>

        <strong>
          {task.title}
        </strong>

      </div>

      {/* ERROR */}

      {error && (

        <div className="feature-error">
          {error}
        </div>

      )}

      {/* BLOCKED WARNING */}

      {blockedDependencies.length >
        0 && (

        <div className="blocked-task-alert">

          <Lock size={19} />

          <div>

            <strong>
              Task is blocked
            </strong>

            <span>
              Complete{" "}

              {blockedDependencies.length}

              {" "}
              prerequisite task

              {blockedDependencies.length !==
              1
                ? "s"
                : ""}

              {" "}
              before completing this task.
            </span>

          </div>

        </div>

      )}

      {/* ADD DEPENDENCY */}

      <div className="dependency-add-section">

        <div className="dependency-add-header">

          <div>

            <h3>
              Add Prerequisite
            </h3>

            <p>
              Select a task that must be
              completed before{" "}

              <strong>
                {task.title}
              </strong>

              .
            </p>

          </div>

        </div>

        <div className="dependency-add-row">

          <select
            value={
              selectedDependencyId
            }
            onChange={(event) => {
              setSelectedDependencyId(
                event.target.value
              );

              setError("");
            }}
          >

            <option value="">
              Select prerequisite task
            </option>

            {availableTasks.map(
              (availableTask) => (

                <option
                  key={
                    availableTask.id
                  }
                  value={
                    availableTask.id
                  }
                >

                  {
                    availableTask.title
                  }

                </option>

              )
            )}

          </select>

          <button
            type="button"
            onClick={
              addDependency
            }
            disabled={
              saving ||
              !selectedDependencyId
            }
          >

            <Plus size={17} />

            {saving
              ? "Adding..."
              : "Add Dependency"}

          </button>

        </div>

      </div>

      {/* LOADING */}

      {loading && (

        <p className="feature-loading">
          Loading dependencies...
        </p>

      )}

      {/* NO DEPENDENCIES */}

      {!loading &&
        dependencies.length ===
          0 && (

        <div className="feature-empty">

          <Link2 size={22} />

          <span>
            No prerequisite tasks
            added yet.
          </span>

        </div>

      )}

      {/* DEPENDENCY LIST */}

      {!loading &&
        dependencies.length >
          0 && (

        <div className="dependency-list">

          <div className="dependency-list-header">

            <h3>
              Prerequisite Tasks
            </h3>

            <span>

              {
                dependencies.length
              }

              {" "}

              {dependencies.length ===
              1
                ? "dependency"
                : "dependencies"}

            </span>

          </div>

          {dependencies.map(
            (dependency) => {

              const dependencyTask =
                getTask(
                  dependency.depends_on_task_id
                );

              const completed =
                dependencyTask?.status ===
                "Completed";

              return (

                <div
                  key={
                    dependency.id
                  }
                  className={`dependency-item ${
                    completed
                      ? "dependency-completed"
                      : "dependency-blocking"
                  }`}
                >

                  {/* LEFT */}

                  <div className="dependency-flow">

                    <div className="dependency-status-icon">

                      {completed ? (

                        <CheckCircle2
                          size={19}
                        />

                      ) : (

                        <Lock
                          size={18}
                        />

                      )}

                    </div>

                    <div className="dependency-info">

                      <strong>

                        {
                          dependencyTask?.title ||
                          "Unknown Task"
                        }

                      </strong>

                      <span>

                        {completed
                          ? "Completed — dependency satisfied"
                          : "Must be completed first"}

                      </span>

                    </div>

                  </div>

                  {/* ARROW */}

                  <ArrowRight
                    size={18}
                    className="dependency-arrow"
                  />

                  {/* TARGET */}

                  <div className="dependency-target">

                    <span>
                      Required for
                    </span>

                    <strong>
                      {task.title}
                    </strong>

                  </div>

                  {/* DELETE */}

                  <button
                    type="button"
                    className="dependency-delete"
                    onClick={() =>
                      removeDependency(
                        dependency.id
                      )
                    }
                    title="Remove dependency"
                  >

                    <Trash2
                      size={17}
                    />

                  </button>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>
  );
}

export default DependencyManager;