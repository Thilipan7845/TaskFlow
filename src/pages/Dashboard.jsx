import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Plus,
  Search,
  ChevronDown,
  Users,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import Sidebar from "../components/Sidebar";

import DashboardStats from "../components/Dashboardstats";
import TaskCard from "../components/Taskcard";
import TaskForm from "../components/Taskform";

import ProductivityInsights from "../components/ProductivityInsights";
import TaskCalendar from "../components/TaskCalendar";
import TaskActivity from "../components/TaskActivity";
import AnalyticsPanel from "../components/AnalyticsPanel";
import TaskDetails from "../components/TaskDetails";

import NotificationCenter from "../components/NotificationCenter";
import AIAssistant from "../components/AIAssistant";

import DependencyManager from "../components/DependencyManager";
import CollaborationPanel from "../components/CollaborationPanel";

import Invitations from "../components/Invitations";


function Dashboard() {

  const location = useLocation();
  const navigate = useNavigate();


  // =========================================
  // STATE
  // =========================================

  const [tasks, setTasks] = useState([]);

  const [editingTask, setEditingTask] =
    useState(null);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [userName, setUserName] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [importantFilter, setImportantFilter] =
    useState("All");

  const [sortOption, setSortOption] =
    useState("newest");

  const [dueFilter, setDueFilter] =
    useState("All");

  const [activities, setActivities] =
    useState([]);

  const [
    selectedDependencyTaskId,
    setSelectedDependencyTaskId,
  ] = useState("");

  const [
    selectedCollaborationTaskId,
    setSelectedCollaborationTaskId,
  ] = useState("");


  // =========================================
  // ROUTES
  // =========================================

  const currentPath =
    location.pathname;

  const isDashboard =
    currentPath === "/dashboard";

  const isTasks =
    currentPath === "/dashboard/tasks";

  const isAddTask =
    currentPath === "/dashboard/add-task";

  const isProductivity =
    currentPath ===
    "/dashboard/productivity";

  const isPlanner =
    currentPath === "/dashboard/planner";

  const isPerformance =
    currentPath === "/dashboard/performance";

  const isAssistant =
    currentPath === "/dashboard/ai-assistant";

  const isDependencies =
    currentPath === "/dashboard/dependencies";

  const isCollaboration =
    currentPath === "/dashboard/collaboration";

  const isInvitations =
    currentPath === "/dashboard/invitations";


  // =========================================
  // DUE DATE STATUS
  // =========================================

  function getDueStatus(task) {

    if (
      !task.dueDate ||
      task.dueDate === "No date"
    ) {
      return "none";
    }

    if (
      task.status === "Completed"
    ) {
      return "completed";
    }


    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );


    const dueDate =
      new Date(
        `${task.dueDate}T00:00:00`
      );


    if (
      Number.isNaN(
        dueDate.getTime()
      )
    ) {
      return "none";
    }


    const difference =
      dueDate.getTime() -
      today.getTime();


    const daysRemaining =
      Math.round(
        difference /
          (1000 *
            60 *
            60 *
            24)
      );


    if (
      daysRemaining < 0
    ) {
      return "overdue";
    }

    if (
      daysRemaining === 0
    ) {
      return "today";
    }

    if (
      daysRemaining <= 3
    ) {
      return "soon";
    }

    return "upcoming";
  }


  // =========================================
  // LOAD DASHBOARD
  // =========================================

  async function loadDashboard() {

    try {

      setLoading(true);

      setErrorMessage("");


      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !user
      ) {

        setErrorMessage(
          "You are not logged in."
        );

        setTasks([]);

        setActivities([]);

        return;
      }


      setUserName(
        user.user_metadata?.full_name ||
          user.email
            ?.split("@")[0] ||
          "User"
      );


      // =====================================
      // OWNED TASKS
      // =====================================

      const {
        data: ownedTaskData,
        error: ownedTaskError,
      } =
        await supabase
          .from("tasks")
          .select("*")
          .eq(
            "user_id",
            user.id
          );


      if (
        ownedTaskError
      ) {
        throw ownedTaskError;
      }


      // =====================================
      // SHARED TASKS
      // =====================================

      const {
        data: collaborationData,
        error: collaborationError,
      } =
        await supabase
          .from("task_collaborators")
          .select("task_id")
          .eq(
            "collaborator_user_id",
            user.id
          )
          .eq(
            "status",
            "active"
          );


      if (
        collaborationError
      ) {

        console.error(
          "Collaboration loading failed:",
          collaborationError
        );
      }


      const sharedTaskIds =
        (
          collaborationData ||
          []
        )
          .map(
            (
              collaboration
            ) =>
              collaboration.task_id
          )
          .filter(Boolean);


      let sharedTaskData = [];


      if (
        sharedTaskIds.length >
        0
      ) {

        const {
          data,
          error,
        } =
          await supabase
            .from("tasks")
            .select("*")
            .in(
              "id",
              sharedTaskIds
            );


        if (error) {

          console.error(
            "Shared task loading failed:",
            error
          );

        } else {

          sharedTaskData =
            data || [];
        }
      }


      // =====================================
      // COMBINE TASKS
      // =====================================

      const taskMap =
        new Map();


      (
        ownedTaskData ||
        []
      ).forEach(
        (task) => {

          taskMap.set(
            task.id,
            {
              ...task,
              isShared: false,
              isOwner: true,
            }
          );
        }
      );


      (
        sharedTaskData ||
        []
      ).forEach(
        (task) => {

          if (
            !taskMap.has(
              task.id
            )
          ) {

            taskMap.set(
              task.id,
              {
                ...task,
                isShared: true,
                isOwner: false,
              }
            );
          }
        }
      );


      const combinedTasks =
        Array.from(
          taskMap.values()
        );


      combinedTasks.sort(
        (a, b) => {

          const dateA =
            new Date(
              a.created_at || 0
            ).getTime();

          const dateB =
            new Date(
              b.created_at || 0
            ).getTime();

          return dateB - dateA;
        }
      );


      // =====================================
      // SUBTASKS
      // =====================================

      const taskIds =
        combinedTasks.map(
          (task) => task.id
        );


      let subtaskData = [];


      if (
        taskIds.length > 0
      ) {

        const {
          data,
          error,
        } =
          await supabase
            .from("subtasks")
            .select(`
              id,
              task_id,
              is_completed
            `)
            .in(
              "task_id",
              taskIds
            );


        if (error) {

          console.error(
            "Subtask loading failed:",
            error
          );

        } else {

          subtaskData =
            data || [];
        }
      }


      // =====================================
      // PROGRESS MAP
      // =====================================

      const progressMap =
        {};


      subtaskData.forEach(
        (subtask) => {

          const taskId =
            String(
              subtask.task_id
            );


          if (
            !progressMap[
              taskId
            ]
          ) {

            progressMap[
              taskId
            ] = {
              total: 0,
              completed: 0,
            };
          }


          progressMap[
            taskId
          ].total += 1;


          if (
            subtask.is_completed
          ) {

            progressMap[
              taskId
            ].completed += 1;
          }
        }
      );


      // =====================================
      // FORMAT TASKS
      // =====================================

      const formattedTasks =
        combinedTasks.map(
          (task) => {

            const taskProgress =
              progressMap[
                String(task.id)
              ];


            let progress = 0;


            if (
              taskProgress &&
              taskProgress.total >
                0
            ) {

              progress =
                Math.round(
                  (
                    taskProgress.completed /
                    taskProgress.total
                  ) *
                    100
                );
            }


            return {

              id: task.id,

              title:
                task.title,

              description:
                task.description ||
                "",

              priority:
                task.priority,

              dueDate:
                task.due_date ||
                "",

              status:
                task.status,

              createdAt:
                task.created_at,

              tags:
                task.tags ||
                [],

              isImportant:
                task.is_important ||
                false,

              progress,

              isShared:
                task.isShared ||
                false,

              isOwner:
                task.isOwner !== false,
            };
          }
        );


      setTasks(
        formattedTasks
      );


      // =====================================
      // ACTIVITY
      // =====================================

      const {
        data: activityData,
        error: activityError,
      } =
        await supabase
          .from("task_activity")
          .select("*")
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(20);


      if (
        activityError
      ) {

        console.error(
          "Activity loading failed:",
          activityError
        );
      }


      setActivities(
        activityData || []
      );

    } catch (error) {

      console.error(
        "Dashboard loading error:",
        error
      );


      setErrorMessage(
        error.message ||
          "Failed to load dashboard."
      );

    } finally {

      setLoading(false);
    }
  }


  // =========================================
  // INITIAL DASHBOARD LOAD
  // =========================================

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();

  }, []);


  // =========================================
  // LOG ACTIVITY
  // =========================================

  async function logActivity(
    taskId,
    taskTitle,
    action
  ) {

    try {

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();


      if (!user) {
        return;
      }


      const {
        data,
        error,
      } =
        await supabase
          .from("task_activity")
          .insert([
            {
              user_id:
                user.id,

              task_id:
                taskId,

              task_title:
                taskTitle,

              action:
                action,
            },
          ])
          .select()
          .single();


      if (error) {

        console.error(
          "Activity logging failed:",
          error
        );

        return;
      }


      if (data) {

        setActivities(
          (current) => [
            data,
            ...current,
          ]
        );
      }

    } catch (error) {

      console.error(
        "Activity logging error:",
        error
      );
    }
  }


  // =========================================
  // ADD TASK
  // =========================================

  async function addTask(
    newTask
  ) {

    try {

      setErrorMessage("");


      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !user
      ) {

        setErrorMessage(
          "You must be logged in to add tasks."
        );

        return;
      }


      const {
        data,
        error,
      } =
        await supabase
          .from("tasks")
          .insert([
            {
              user_id:
                user.id,

              title:
                newTask.title,

              description:
                newTask.description ||
                "",

              priority:
                newTask.priority,

              due_date:
                newTask.dueDate ===
                  "No date" ||
                !newTask.dueDate
                  ? null
                  : newTask.dueDate,

              status:
                newTask.status,

              tags:
                newTask.tags ||
                [],

              is_important:
                newTask.isImportant ||
                false,
            },
          ])
          .select()
          .single();


      if (error) {
        throw error;
      }


      const formattedTask = {

        id: data.id,

        title:
          data.title,

        description:
          data.description ||
          "",

        priority:
          data.priority,

        dueDate:
          data.due_date ||
          "",

        status:
          data.status,

        createdAt:
          data.created_at,

        tags:
          data.tags ||
          [],

        isImportant:
          data.is_important ||
          false,

        progress: 0,

        isShared: false,

        isOwner: true,
      };


      setTasks(
        (currentTasks) => [
          formattedTask,
          ...currentTasks,
        ]
      );


      await logActivity(
        data.id,
        data.title,
        "created"
      );


      navigate(
        "/dashboard/tasks"
      );

    } catch (error) {

      console.error(error);


      setErrorMessage(
        error.message ||
          "Failed to add task."
      );
    }
  }


  // =========================================
  // UPDATE TASK PROGRESS
  // =========================================

  function updateTaskProgress(
    taskId,
    progress
  ) {

    setTasks(
      (currentTasks) =>
        currentTasks.map(
          (task) => {

            if (
              task.id === taskId
            ) {

              return {
                ...task,
                progress:
                  progress,
              };
            }

            return task;
          }
        )
    );


    setSelectedTask(
      (current) => {

        if (
          current &&
          current.id === taskId
        ) {

          return {
            ...current,
            progress:
              progress,
          };
        }

        return current;
      }
    );
  }


  // =========================================
  // TOGGLE IMPORTANT
  // =========================================

  async function toggleImportantTask(
    taskId
  ) {

    try {

      setErrorMessage("");


      const task =
        tasks.find(
          (item) =>
            item.id === taskId
        );


      if (!task) {
        return;
      }


      if (
        !task.isOwner
      ) {

        setErrorMessage(
          "Only the task owner can change important status."
        );

        return;
      }


      const newImportantState =
        !task.isImportant;


      const {
        error,
      } =
        await supabase
          .from("tasks")
          .update({
            is_important:
              newImportantState,
          })
          .eq(
            "id",
            taskId
          );


      if (error) {
        throw error;
      }


      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (item) => {

              if (
                item.id === taskId
              ) {

                return {
                  ...item,
                  isImportant:
                    newImportantState,
                };
              }

              return item;
            }
          )
      );


      setSelectedTask(
        (current) => {

          if (
            current &&
            current.id === taskId
          ) {

            return {
              ...current,
              isImportant:
                newImportantState,
            };
          }

          return current;
        }
      );

    } catch (error) {

      console.error(error);


      setErrorMessage(
        error.message ||
          "Failed to update important status."
      );
    }
  }


  // =========================================
  // DELETE TASK
  // =========================================

  async function deleteTask(
    taskId
  ) {

    try {

      setErrorMessage("");


      const taskToDelete =
        tasks.find(
          (task) =>
            task.id === taskId
        );


      if (
        taskToDelete &&
        !taskToDelete.isOwner
      ) {

        setErrorMessage(
          "Only the task owner can delete this shared task."
        );

        return;
      }


      const {
        error,
      } =
        await supabase
          .from("tasks")
          .delete()
          .eq(
            "id",
            taskId
          );


      if (error) {
        throw error;
      }


      setTasks(
        (currentTasks) =>
          currentTasks.filter(
            (task) =>
              task.id !== taskId
          )
      );


      setSelectedTask(
        null
      );


      setSelectedDependencyTaskId(
        (currentId) =>
          String(currentId) ===
          String(taskId)
            ? ""
            : currentId
      );


      setSelectedCollaborationTaskId(
        (currentId) =>
          String(currentId) ===
          String(taskId)
            ? ""
            : currentId
      );


      if (
        editingTask &&
        editingTask.id === taskId
      ) {

        setEditingTask(
          null
        );
      }


      if (
        taskToDelete
      ) {

        await logActivity(
          null,
          taskToDelete.title,
          "deleted"
        );
      }

    } catch (error) {

      console.error(error);


      setErrorMessage(
        error.message ||
          "Failed to delete task."
      );
    }
  }


  // =========================================
  // COMPLETE TASK
  // =========================================

  async function completeTask(
    taskId
  ) {

    try {

      setErrorMessage("");


      const taskToComplete =
        tasks.find(
          (task) =>
            task.id === taskId
        );


      const {
        error,
      } =
        await supabase
          .from("tasks")
          .update({
            status:
              "Completed",
          })
          .eq(
            "id",
            taskId
          );


      if (error) {
        throw error;
      }


      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (task) => {

              if (
                task.id === taskId
              ) {

                return {
                  ...task,
                  status:
                    "Completed",
                };
              }

              return task;
            }
          )
      );


      setSelectedTask(
        (current) => {

          if (
            current &&
            current.id === taskId
          ) {

            return {
              ...current,
              status:
                "Completed",
            };
          }

          return current;
        }
      );


      if (
        taskToComplete
      ) {

        await logActivity(
          taskId,
          taskToComplete.title,
          "completed"
        );
      }

    } catch (error) {

      console.error(error);


      setErrorMessage(
        error.message ||
          "Failed to mark task as completed."
      );
    }
  }


  // =========================================
  // TASK DETAILS
  // =========================================

  function openTaskDetails(
    task
  ) {

    setSelectedTask(
      task
    );
  }


  function closeTaskDetails() {

    setSelectedTask(
      null
    );
  }


  // =========================================
  // EDIT TASK
  // =========================================

  function startEditing(
    task
  ) {

    if (
      task &&
      !task.isOwner
    ) {

      setErrorMessage(
        "Only the task owner can edit this shared task."
      );

      return;
    }


    setEditingTask(
      task
    );


    setSelectedTask(
      null
    );


    navigate(
      "/dashboard/add-task"
    );
  }


  // =========================================
  // UPDATE TASK
  // =========================================

  async function updateTask(
    updatedTask
  ) {

    try {

      setErrorMessage("");


      const existingTask =
        tasks.find(
          (task) =>
            task.id ===
            updatedTask.id
        );


      if (
        existingTask &&
        !existingTask.isOwner
      ) {

        setErrorMessage(
          "Only the task owner can edit this task."
        );

        return;
      }


      const {
        error,
      } =
        await supabase
          .from("tasks")
          .update({

            title:
              updatedTask.title,

            description:
              updatedTask.description ||
              "",

            priority:
              updatedTask.priority,

            due_date:
              updatedTask.dueDate ===
                "No date" ||
              !updatedTask.dueDate
                ? null
                : updatedTask.dueDate,

            status:
              updatedTask.status,

            tags:
              updatedTask.tags ||
              [],

            is_important:
              updatedTask.isImportant ||
              false,
          })
          .eq(
            "id",
            updatedTask.id
          );


      if (error) {
        throw error;
      }


      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (task) => {

              if (
                task.id ===
                updatedTask.id
              ) {

                return {

                  ...updatedTask,

                  isImportant:
                    updatedTask.isImportant ||
                    false,

                  progress:
                    task.progress ||
                    0,

                  createdAt:
                    task.createdAt,

                  isShared:
                    task.isShared ||
                    false,

                  isOwner:
                    task.isOwner !==
                    false,
                };
              }

              return task;
            }
          )
      );


      setEditingTask(
        null
      );


      setSelectedTask(
        null
      );


      await logActivity(
        updatedTask.id,
        updatedTask.title,
        "updated"
      );


      navigate(
        "/dashboard/tasks"
      );

    } catch (error) {

      console.error(error);


      setErrorMessage(
        error.message ||
          "Failed to update task."
      );
    }
  }


  // =========================================
  // DUE FILTER
  // =========================================

  function handleDueFilter(
    filter
  ) {

    setDueFilter(
      filter
    );

    setSearchTerm("");

    setStatusFilter(
      "All"
    );

    setPriorityFilter(
      "All"
    );

    setImportantFilter(
      "All"
    );


    navigate(
      "/dashboard/tasks"
    );
  }


  // =========================================
  // FILTER TASKS
  // =========================================

  const filteredTasks =
    tasks.filter(
      (task) => {

        const search =
          searchTerm
            .toLowerCase()
            .trim();


        const matchesSearch =
          !search ||
          task.title
            .toLowerCase()
            .includes(search) ||
          task.description
            .toLowerCase()
            .includes(search) ||
          (
            task.tags ||
            []
          ).some(
            (tag) =>
              String(tag)
                .toLowerCase()
                .includes(search)
          );


        const matchesStatus =
          statusFilter ===
            "All" ||
          task.status ===
            statusFilter;


        const matchesPriority =
          priorityFilter ===
            "All" ||
          task.priority ===
            priorityFilter;


        const matchesImportant =
          importantFilter ===
            "All" ||
          (
            importantFilter ===
              "Important" &&
            task.isImportant
          );


        const matchesDueFilter =
          dueFilter ===
            "All" ||
          getDueStatus(
            task
          ) === dueFilter;


        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesImportant &&
          matchesDueFilter
        );
      }
    );


  // =========================================
  // PRIORITY VALUE
  // =========================================

  function getPriorityValue(
    priority
  ) {

    switch (
      priority
    ) {

      case "High":
        return 3;

      case "Medium":
        return 2;

      case "Low":
        return 1;

      default:
        return 0;
    }
  }


  // =========================================
  // COMPARE DUE DATES
  // =========================================

  function compareDueDates(
    dateA,
    dateB
  ) {

    const hasDateA =
      dateA &&
      dateA !==
        "No date";


    const hasDateB =
      dateB &&
      dateB !==
        "No date";


    if (
      !hasDateA &&
      !hasDateB
    ) {
      return 0;
    }


    if (!hasDateA) {
      return 1;
    }


    if (!hasDateB) {
      return -1;
    }


    const timeA =
      new Date(
        `${dateA}T00:00:00`
      ).getTime();


    const timeB =
      new Date(
        `${dateB}T00:00:00`
      ).getTime();


    return (
      timeA - timeB
    );
  }


  // =========================================
  // SMART DUE DATE COMPARISON
  // =========================================

  function compareSmartDueDates(
    taskA,
    taskB
  ) {

    const statusOrder = {

      overdue: 1,

      today: 2,

      soon: 3,

      upcoming: 4,

      completed: 5,

      none: 6,
    };


    const statusA =
      getDueStatus(
        taskA
      );


    const statusB =
      getDueStatus(
        taskB
      );


    const orderA =
      statusOrder[
        statusA
      ] || 6;


    const orderB =
      statusOrder[
        statusB
      ] || 6;


    if (
      orderA !==
      orderB
    ) {

      return (
        orderA - orderB
      );
    }


    return compareDueDates(
      taskA.dueDate,
      taskB.dueDate
    );
  }


  // =========================================
  // SORT TASKS
  // =========================================

  const sortedTasks =
    [
      ...filteredTasks,
    ].sort(
      (
        a,
        b
      ) => {

        switch (
          sortOption
        ) {

          case "oldest":

            return (
              new Date(
                a.createdAt ||
                0
              ).getTime() -
              new Date(
                b.createdAt ||
                0
              ).getTime()
            );


          case "priority-high":

            return (
              getPriorityValue(
                b.priority
              ) -
              getPriorityValue(
                a.priority
              )
            );


          case "priority-low":

            return (
              getPriorityValue(
                a.priority
              ) -
              getPriorityValue(
                b.priority
              )
            );


          case "due-earliest":

            return compareSmartDueDates(
              a,
              b
            );


          case "due-latest":

            return compareDueDates(
              b.dueDate,
              a.dueDate
            );


          default:

            return (
              new Date(
                b.createdAt ||
                0
              ).getTime() -
              new Date(
                a.createdAt ||
                0
              ).getTime()
            );
        }
      }
    );


  // =========================================
  // STATISTICS
  // =========================================

  const totalTasks =
    tasks.length;


  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "In Progress"
    ).length;


  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "Completed"
    ).length;


  const overdueTasks =
    tasks.filter(
      (task) =>
        getDueStatus(
          task
        ) === "overdue"
    ).length;


  const dueTodayTasks =
    tasks.filter(
      (task) =>
        getDueStatus(
          task
        ) === "today"
    ).length;


  const dueSoonTasks =
    tasks.filter(
      (task) =>
        getDueStatus(
          task
        ) === "soon"
    ).length;


  const upcomingTasks =
    tasks.filter(
      (task) =>
        getDueStatus(
          task
        ) === "upcoming"
    ).length;


  const noDeadlineTasks =
    tasks.filter(
      (task) =>
        getDueStatus(
          task
        ) === "none"
    ).length;


  // =========================================
  // ANALYTICS PROGRESS
  // =========================================

  const tasksWithProgress =
    tasks.map(
      (task) => ({

        ...task,

        progress: {

          percentage:
            typeof task.progress ===
            "number"
              ? task.progress
              : 0,
        },
      })
    );


  // =========================================
  // SELECTED DEPENDENCY TASK
  // =========================================

  const selectedDependencyTask =
    tasks.find(
      (task) =>
        String(task.id) ===
        String(
          selectedDependencyTaskId
        )
    ) || null;


  // =========================================
  // SELECTED COLLABORATION TASK
  // =========================================

  const selectedCollaborationTask =
    tasks.find(
      (task) =>
        String(task.id) ===
        String(
          selectedCollaborationTaskId
        )
    ) || null;


  // =========================================
  // UI
  // =========================================

  return (

    <div className="dashboard-layout">

      <Sidebar />


      <main className="dashboard-main">


        {/* ===================================
            HEADER
        =================================== */}

        <section className="dashboard-header">

          <div>

            <p className="dashboard-label">
              YOUR WORKSPACE
            </p>


            <h1>

              Hello,

              <span>
                {" "}
                {userName} ✦
              </span>

            </h1>


            <p>
              Here's what's happening with
              your tasks today.
            </p>

          </div>


          <div className="dashboard-header-actions">


            {/* SEARCH */}

            <div className="top-search">

              <Search
                size={19}
              />


              <input
                type="text"
                placeholder="Search tasks..."
                value={
                  searchTerm
                }
                onChange={
                  (
                    event
                  ) => {

                    setSearchTerm(
                      event.target.value
                    );


                    if (
                      event.target.value &&
                      !isTasks
                    ) {

                      navigate(
                        "/dashboard/tasks"
                      );
                    }
                  }
                }
              />


              {searchTerm && (

                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  ×
                </button>

              )}

            </div>


            {/* NOTIFICATIONS */}

            <NotificationCenter />


            {/* NEW TASK */}

            <Link
              to="/dashboard/add-task"
              className="dashboard-add-btn"
              onClick={() =>
                setEditingTask(
                  null
                )
              }
            >

              <Plus
                size={18}
              />

              New Task

            </Link>

          </div>

        </section>


        {/* ===================================
            ERROR
        =================================== */}

        {errorMessage && (

          <p className="dashboard-error-message">
            {errorMessage}
          </p>

        )}


        {/* ===================================
            DASHBOARD HOME
        =================================== */}

        {isDashboard && (

          <>

            <DashboardStats

              total={
                totalTasks
              }

              inProgress={
                inProgressTasks
              }

              completed={
                completedTasks
              }

              overdue={
                overdueTasks
              }

              dueToday={
                dueTodayTasks
              }

              dueSoon={
                dueSoonTasks
              }

              upcoming={
                upcomingTasks
              }

              activeFilter={
                dueFilter
              }

              onFilter={
                handleDueFilter
              }

            />


            <TaskActivity
              activities={
                activities
              }
            />

          </>

        )}


        {/* ===================================
            INVITATIONS
        =================================== */}

        {isInvitations && (
          <Invitations />
        )}


        {/* ===================================
            TASKS
        =================================== */}

        {isTasks && (

          <section className="tasks-section">


            <div className="section-heading">

              <div>

                <p className="section-label">
                  YOUR FLOW
                </p>

                <h2>
                  Current Tasks
                </h2>

              </div>


              <span className="task-count">
                {
                  sortedTasks.length
                }{" "}
                tasks
              </span>

            </div>


            {/* FILTER CONTROLS */}

            <div className="task-controls">


              {/* STATUS */}

              <div className="task-filter">

                <select
                  value={
                    statusFilter
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setStatusFilter(
                        event.target.value
                      )
                  }
                >

                  <option value="All">
                    All Status
                  </option>

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


                <ChevronDown
                  size={17}
                />

              </div>


              {/* PRIORITY */}

              <div className="task-filter">

                <select
                  value={
                    priorityFilter
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setPriorityFilter(
                        event.target.value
                      )
                  }
                >

                  <option value="All">
                    All Priority
                  </option>

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>


                <ChevronDown
                  size={17}
                />

              </div>


              {/* IMPORTANT */}

              <div className="task-filter">

                <select
                  value={
                    importantFilter
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setImportantFilter(
                        event.target.value
                      )
                  }
                >

                  <option value="All">
                    All Tasks
                  </option>

                  <option value="Important">
                    ⭐ Important
                  </option>

                </select>


                <ChevronDown
                  size={17}
                />

              </div>


              {/* SORT */}

              <div className="task-filter task-sort">

                <select
                  value={
                    sortOption
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setSortOption(
                        event.target.value
                      )
                  }
                >

                  <option value="newest">
                    Newest First
                  </option>

                  <option value="oldest">
                    Oldest First
                  </option>

                  <option value="priority-high">
                    Priority: High → Low
                  </option>

                  <option value="priority-low">
                    Priority: Low → High
                  </option>

                  <option value="due-earliest">
                    Due Date: Earliest
                  </option>

                  <option value="due-latest">
                    Due Date: Latest
                  </option>

                </select>


                <ChevronDown
                  size={17}
                />

              </div>

            </div>


            {/* LOADING */}

            {loading && (

              <p className="dashboard-loading">
                Loading your tasks...
              </p>

            )}


            {/* EMPTY */}

            {!loading &&
              tasks.length ===
                0 && (

                <p className="dashboard-empty">
                  No tasks yet. Create your first
                  task 🚀
                </p>

              )}


            {/* NO SEARCH RESULTS */}

            {!loading &&
              tasks.length > 0 &&
              sortedTasks.length ===
                0 && (

                <p className="dashboard-empty">
                  No tasks found 🔍
                </p>

              )}


            {/* TASK GRID */}

            {!loading &&
              sortedTasks.length >
                0 && (

                <div className="task-grid">

                  {sortedTasks.map(
                    (task) => (

                      <TaskCard

                        key={
                          task.id
                        }

                        id={
                          task.id
                        }

                        title={
                          task.title
                        }

                        description={
                          task.description
                        }

                        priority={
                          task.priority
                        }

                        dueDate={
                          task.dueDate
                        }

                        dueStatus={
                          getDueStatus(
                            task
                          )
                        }

                        status={
                          task.status
                        }

                        tags={
                          task.tags ||
                          []
                        }

                        isImportant={
                          task.isImportant
                        }

                        progress={
                          task.progress ||
                          0
                        }

                        isShared={
                          task.isShared
                        }

                        isOwner={
                          task.isOwner
                        }

                        onToggleImportant={
                          toggleImportantTask
                        }

                        onDelete={
                          deleteTask
                        }

                        onComplete={
                          completeTask
                        }

                        onEdit={() =>
                          startEditing(
                            task
                          )
                        }

                        onView={() =>
                          openTaskDetails(
                            task
                          )
                        }

                      />

                    )
                  )}

                </div>

              )}

          </section>

        )}


        {/* ===================================
            AI ASSISTANT
        =================================== */}

        {isAssistant && (

          <AIAssistant
            tasks={
              tasks
            }
          />

        )}


        {/* ===================================
            DEPENDENCIES
        =================================== */}

        {isDependencies && (

          <section className="dependencies-page">


            <div className="section-heading">

              <div>

                <p className="section-label">
                  TASK FLOW
                </p>


                <h2>
                  Task Dependencies
                </h2>


                <p>
                  Define which tasks must be
                  completed before other tasks
                  can proceed.
                </p>

              </div>

            </div>


            {tasks.length ===
              0 ? (

              <div className="dashboard-empty">
                No tasks available yet. Create
                tasks first 🚀
              </div>

            ) : (

              <>

                <div className="dependency-task-selector">

                  <label>
                    Task
                  </label>


                  <select
                    value={
                      selectedDependencyTaskId
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setSelectedDependencyTaskId(
                          event.target.value
                        )
                    }
                  >

                    <option value="">
                      Select task
                    </option>


                    {tasks.map(
                      (task) => (

                        <option
                          key={
                            task.id
                          }
                          value={
                            task.id
                          }
                        >
                          {
                            task.title
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>


                {selectedDependencyTask ? (

                  <DependencyManager

                    task={
                      selectedDependencyTask
                    }

                    allTasks={
                      tasks
                    }

                    onDependencyChange={() =>
                      loadDashboard()
                    }

                  />

                ) : (

                  <div className="dependency-select-message">
                    Select a task above to manage
                    its dependencies.
                  </div>

                )}

              </>

            )}

          </section>

        )}


        {/* ===================================
            COLLABORATION
        =================================== */}

        {isCollaboration && (

          <section className="collaboration-page">


            <div className="section-heading">

              <div>

                <p className="section-label">
                  TEAMWORK
                </p>


                <h2>
                  Collaborate on Tasks
                </h2>


                <p>
                  Choose a task and invite
                  teammates to collaborate
                  with you.
                </p>

              </div>

            </div>


            {loading ? (

              <div className="dashboard-empty">
                Loading tasks...
              </div>

            ) : tasks.length ===
              0 ? (

              <div className="dashboard-empty">
                No tasks available yet. Create
                your first task 🚀
              </div>

            ) : (

              <>

                <div className="collaboration-task-selector">

                  <label htmlFor="collaboration-task">
                    Select a Task
                  </label>


                  <select
                    id="collaboration-task"
                    value={
                      selectedCollaborationTaskId
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setSelectedCollaborationTaskId(
                          event.target.value
                        )
                    }
                  >

                    <option value="">
                      Select a task
                    </option>


                    {tasks
                      .filter(
                        (
                          task
                        ) =>
                          task.isOwner
                      )
                      .map(
                        (
                          task
                        ) => (

                          <option
                            key={
                              task.id
                            }
                            value={
                              task.id
                            }
                          >
                            {
                              task.title
                            }
                          </option>

                        )
                      )}

                  </select>

                </div>


                {!selectedCollaborationTask && (

                  <div className="collaboration-select-message">

                    <div className="collaboration-select-icon">

                      <Users
                        size={30}
                      />

                    </div>


                    <div>

                      <h3>
                        Select a task to start
                        collaborating
                      </h3>


                      <p>
                        Choose one of your tasks
                        above, then invite
                        teammates to work
                        together.
                      </p>

                    </div>

                  </div>

                )}


                {selectedCollaborationTask && (

                  <div className="collaboration-content">


                    <div className="selected-collaboration-task">

                      <span>
                        SELECTED TASK
                      </span>


                      <h3>
                        {
                          selectedCollaborationTask.title
                        }
                      </h3>


                      {selectedCollaborationTask.description && (

                        <p>
                          {
                            selectedCollaborationTask.description
                          }
                        </p>

                      )}

                    </div>


                    <CollaborationPanel

                      task={
                        selectedCollaborationTask
                      }

                    />

                  </div>

                )}

              </>

            )}

          </section>

        )}


        {/* ===================================
            PRODUCTIVITY
        =================================== */}

        {isProductivity && (

          <ProductivityInsights

            total={
              totalTasks
            }

            completed={
              completedTasks
            }

            inProgress={
              inProgressTasks
            }

            overdue={
              overdueTasks
            }

            dueToday={
              dueTodayTasks
            }

            dueSoon={
              dueSoonTasks
            }

            upcoming={
              upcomingTasks
            }

            noDeadline={
              noDeadlineTasks
            }

          />

        )}


        {/* ===================================
            PLANNER
        =================================== */}

        {isPlanner && (

          <TaskCalendar

            tasks={
              tasks
            }

            onTaskClick={
              openTaskDetails
            }

          />

        )}


        {/* ===================================
            PERFORMANCE
        =================================== */}

        {isPerformance && (

          <AnalyticsPanel

            tasks={
              tasksWithProgress
            }

            total={
              totalTasks
            }

            completed={
              completedTasks
            }

            inProgress={
              inProgressTasks
            }

            overdue={
              overdueTasks
            }

            dueToday={
              dueTodayTasks
            }

            dueSoon={
              dueSoonTasks
            }

            upcoming={
              upcomingTasks
            }

            noDeadline={
              noDeadlineTasks
            }

          />

        )}


        {/* ===================================
            ADD / EDIT TASK
        =================================== */}

        {isAddTask && (

          <TaskForm

            onAddTask={
              addTask
            }

            editingTask={
              editingTask
            }

            onUpdateTask={
              updateTask
            }

            onCancelEdit={() => {

              setEditingTask(
                null
              );

              navigate(
                "/dashboard/tasks"
              );

            }}

          />

        )}

      </main>


      {/* =====================================
          TASK DETAILS MODAL
      ===================================== */}

      {selectedTask && (

        <TaskDetails

          task={
            selectedTask
          }

          allTasks={
            tasks
          }

          onClose={
            closeTaskDetails
          }

          onEdit={
            startEditing
          }

          onComplete={
            completeTask
          }

          onDelete={
            deleteTask
          }

          onProgressChange={
            (
              progress
            ) =>
              updateTaskProgress(
                selectedTask.id,
                progress
              )
          }

          onDependencyChange={() =>
            loadDashboard()
          }

        />

      )}

    </div>
  );
}


export default Dashboard;