import {
  useMemo,
} from "react";

import {
  Brain,
  Sparkles,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";

// =========================================
// DUE STATUS
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

  const today =
    new Date();

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
// AI ASSISTANT
// =========================================

function AIAssistant({
  tasks = [],
}) {
  // =======================================
  // ANALYZE TASKS
  // =======================================

  const analysis =
    useMemo(() => {
      const total =
        tasks.length;

      const completed =
        tasks.filter(
          (task) =>
            task.status ===
            "Completed"
        );

      const active =
        tasks.filter(
          (task) =>
            task.status !==
            "Completed"
        );

      const overdue =
        tasks.filter(
          (task) =>
            getDueStatus(
              task
            ) === "overdue"
        );

      const dueToday =
        tasks.filter(
          (task) =>
            getDueStatus(
              task
            ) === "today"
        );

      const dueSoon =
        tasks.filter(
          (task) =>
            getDueStatus(
              task
            ) === "soon"
        );

      const important =
        tasks.filter(
          (task) =>
            task.isImportant &&
            task.status !==
              "Completed"
        );

      const highPriority =
        active.filter(
          (task) =>
            task.priority ===
            "High"
        );

      const noDeadline =
        active.filter(
          (task) =>
            getDueStatus(
              task
            ) === "none"
        );

      // ===================================
      // COMPLETION RATE
      // ===================================

      const completionRate =
        total === 0
          ? 0
          : Math.round(
              (completed.length /
                total) *
                100
            );

      // ===================================
      // SCORE TASKS
      // ===================================

      const scoredTasks =
        [...active].map(
          (task) => {
            let score = 0;

            const dueStatus =
              getDueStatus(
                task
              );

            // Deadline
            if (
              dueStatus ===
              "overdue"
            ) {
              score += 100;
            }

            if (
              dueStatus ===
              "today"
            ) {
              score += 80;
            }

            if (
              dueStatus ===
              "soon"
            ) {
              score += 50;
            }

            if (
              dueStatus ===
              "upcoming"
            ) {
              score += 20;
            }

            // Priority
            if (
              task.priority ===
              "High"
            ) {
              score += 40;
            }

            if (
              task.priority ===
              "Medium"
            ) {
              score += 20;
            }

            // Important
            if (
              task.isImportant
            ) {
              score += 35;
            }

            // In progress
            if (
              task.status ===
              "In Progress"
            ) {
              score += 10;
            }

            return {
              ...task,
              score,
            };
          }
        );

      scoredTasks.sort(
        (a, b) =>
          b.score -
          a.score
      );

      const recommendedTask =
        scoredTasks.length >
        0
          ? scoredTasks[0]
          : null;

      // ===================================
      // PRODUCTIVITY SCORE
      // ===================================

      let productivityScore =
        50;

      if (
        completionRate >=
        80
      ) {
        productivityScore +=
          35;
      } else if (
        completionRate >=
        60
      ) {
        productivityScore +=
          25;
      } else if (
        completionRate >=
        40
      ) {
        productivityScore +=
          10;
      } else {
        productivityScore -=
          10;
      }

      productivityScore -=
        Math.min(
          overdue.length *
            8,
          30
        );

      if (
        dueToday.length ===
        0
      ) {
        productivityScore +=
          5;
      }

      productivityScore =
        Math.max(
          0,
          Math.min(
            100,
            productivityScore
          )
        );

      return {
        total,

        completed:
          completed.length,

        active:
          active.length,

        overdue:
          overdue.length,

        dueToday:
          dueToday.length,

        dueSoon:
          dueSoon.length,

        important:
          important.length,

        highPriority:
          highPriority.length,

        noDeadline:
          noDeadline.length,

        completionRate,

        productivityScore,

        recommendedTask,
      };
    }, [tasks]);

  // =======================================
  // AI RECOMMENDATIONS
  // =======================================

  const recommendations =
    useMemo(() => {
      const items = [];

      if (
        analysis.overdue >
        0
      ) {
        items.push({
          type: "danger",

          icon: (
            <AlertTriangle
              size={20}
            />
          ),

          title:
            "Clear overdue work first",

          message: `You have ${analysis.overdue} overdue ${
            analysis.overdue ===
            1
              ? "task"
              : "tasks"
          }. Completing one of these should be your first priority.`,
        });
      }

      if (
        analysis.dueToday >
        0
      ) {
        items.push({
          type: "warning",

          icon: (
            <CalendarDays
              size={20}
            />
          ),

          title:
            "Focus on today's deadlines",

          message: `${analysis.dueToday} ${
            analysis.dueToday ===
            1
              ? "task is"
              : "tasks are"
          } due today. Try to finish these before starting low-priority work.`,
        });
      }

      if (
        analysis.important >
        0
      ) {
        items.push({
          type: "important",

          icon: (
            <Star
              size={20}
            />
          ),

          title:
            "Important work detected",

          message: `${analysis.important} important ${
            analysis.important ===
            1
              ? "task needs"
              : "tasks need"
          } your attention.`,
        });
      }

      if (
        analysis.highPriority >
        0
      ) {
        items.push({
          type: "priority",

          icon: (
            <Zap
              size={20}
            />
          ),

          title:
            "High-priority workload",

          message: `You currently have ${analysis.highPriority} high-priority active ${
            analysis.highPriority ===
            1
              ? "task"
              : "tasks"
          }.`,
        });
      }

      if (
        analysis.dueSoon >
        0
      ) {
        items.push({
          type: "soon",

          icon: (
            <Clock
              size={20}
            />
          ),

          title:
            "Deadlines approaching",

          message: `${analysis.dueSoon} ${
            analysis.dueSoon ===
            1
              ? "task is"
              : "tasks are"
          } due within the next few days.`,
        });
      }

      if (
        analysis.noDeadline >
        0
      ) {
        items.push({
          type: "info",

          icon: (
            <Target
              size={20}
            />
          ),

          title:
            "Some tasks have no deadline",

          message: `${analysis.noDeadline} active ${
            analysis.noDeadline ===
            1
              ? "task has"
              : "tasks have"
          } no deadline. Adding due dates can improve planning.`,
        });
      }

      if (
        analysis.completionRate >=
        70
      ) {
        items.push({
          type: "success",

          icon: (
            <CheckCircle2
              size={20}
            />
          ),

          title:
            "Strong completion rate",

          message: `You're completing ${analysis.completionRate}% of your tasks. Keep the momentum going.`,
        });
      }

      if (
        analysis.total ===
        0
      ) {
        items.push({
          type: "info",

          icon: (
            <Sparkles
              size={20}
            />
          ),

          title:
            "Your workspace is empty",

          message:
            "Create your first task and I'll help you prioritize your workload.",
        });
      }

      return items;
    }, [analysis]);

  // =======================================
  // ASSISTANT MESSAGE
  // =======================================

  function getAssistantMessage() {
    if (
      analysis.total ===
      0
    ) {
      return "Your workspace is clear. Add some tasks and I'll analyze your workload.";
    }

    if (
      analysis.overdue >
      0
    ) {
      return "You have overdue work. Let's clear the most urgent task first.";
    }

    if (
      analysis.dueToday >
      0
    ) {
      return "You have deadlines today. Focus on finishing those before taking on new work.";
    }

    if (
      analysis.productivityScore >=
      80
    ) {
      return "You're doing great. Your workload is under control.";
    }

    if (
      analysis.active >
      8
    ) {
      return "Your active workload is getting heavy. Consider breaking it into smaller goals.";
    }

    return "Your workload looks manageable. Focus on the highest-impact task first.";
  }

  // =======================================
  // UI
  // =======================================

  return (
    <section className="ai-assistant-page">

      {/* HERO */}

      <div className="ai-assistant-hero">

        <div className="ai-hero-icon">
          <Brain
            size={32}
          />
        </div>

        <div className="ai-hero-content">

          <p className="section-label">
            INTELLIGENT WORKSPACE
          </p>

          <h2>
            AI Task Assistant
          </h2>

          <p>
            {getAssistantMessage()}
          </p>

        </div>

      </div>

      {/* PRODUCTIVITY SCORE */}

      <div className="ai-score-card">

        <div className="ai-score-left">

          <div className="ai-score-icon">
            <Sparkles
              size={22}
            />
          </div>

          <div>

            <span>
              Productivity Score
            </span>

            <strong>
              {
                analysis.productivityScore
              }

              <small>
                /100
              </small>
            </strong>

          </div>

        </div>

        <div className="ai-score-progress">

          <div className="ai-score-track">

            <div
              className="ai-score-fill"
              style={{
                width: `${analysis.productivityScore}%`,
              }}
            />

          </div>

          <span>
            Based on your current
            workload and completion
            rate
          </span>

        </div>

      </div>

      {/* STATISTICS */}

      <div className="ai-stat-grid">

        <div className="ai-stat-card">

          <div className="ai-stat-icon">
            <Target
              size={20}
            />
          </div>

          <span>
            Active Tasks
          </span>

          <strong>
            {analysis.active}
          </strong>

        </div>

        <div className="ai-stat-card">

          <div className="ai-stat-icon">
            <AlertTriangle
              size={20}
            />
          </div>

          <span>
            Overdue
          </span>

          <strong>
            {analysis.overdue}
          </strong>

        </div>

        <div className="ai-stat-card">

          <div className="ai-stat-icon">
            <CalendarDays
              size={20}
            />
          </div>

          <span>
            Due Today
          </span>

          <strong>
            {analysis.dueToday}
          </strong>

        </div>

        <div className="ai-stat-card">

          <div className="ai-stat-icon">
            <CheckCircle2
              size={20}
            />
          </div>

          <span>
            Completion
          </span>

          <strong>
            {analysis.completionRate}%
          </strong>

        </div>

      </div>

      {/* RECOMMENDED TASK */}

      {analysis.recommendedTask && (
        <div className="ai-recommended-card">

          <div className="ai-recommended-header">

            <div className="ai-section-title">

              <div className="ai-section-icon">
                <Zap
                  size={20}
                />
              </div>

              <div>

                <p>
                  AI RECOMMENDATION
                </p>

                <h3>
                  Work on this next
                </h3>

              </div>

            </div>

            <span className="ai-recommended-badge">
              Recommended
            </span>

          </div>

          <div className="ai-recommended-task">

            <div>

              <h4>
                {
                  analysis
                    .recommendedTask
                    .title
                }
              </h4>

              <div className="ai-task-meta">

                <span
                  className={`priority priority-${analysis.recommendedTask.priority.toLowerCase()}`}
                >
                  {
                    analysis
                      .recommendedTask
                      .priority
                  }
                </span>

                <span>
                  {
                    analysis
                      .recommendedTask
                      .status
                  }
                </span>

                {analysis
                  .recommendedTask
                  .isImportant && (
                  <span>
                    ⭐ Important
                  </span>
                )}

              </div>

            </div>

            <ArrowRight
              size={22}
            />

          </div>

          <p className="ai-recommendation-reason">
            This task received the
            highest priority score based
            on deadline, importance,
            priority, and current status.
          </p>

        </div>
      )}

      {/* INSIGHTS */}

      <div className="ai-insights-section">

        <div className="ai-section-heading">

          <div>

            <p className="section-label">
              SMART INSIGHTS
            </p>

            <h3>
              What should you know?
            </h3>

          </div>

          <span>
            {recommendations.length}
            {" "}
            insights
          </span>

        </div>

        <div className="ai-insights-grid">

          {recommendations.map(
            (
              item,
              index
            ) => (
              <div
                key={`${item.title}-${index}`}
                className={`ai-insight-card ai-insight-${item.type}`}
              >

                <div className="ai-insight-icon">
                  {item.icon}
                </div>

                <div>

                  <h4>
                    {item.title}
                  </h4>

                  <p>
                    {item.message}
                  </p>

                </div>

              </div>
            )
          )}

        </div>

      </div>

      {/* WORKLOAD BREAKDOWN */}

      <div className="ai-workload-card">

        <div className="ai-section-heading">

          <div>

            <p className="section-label">
              WORKLOAD ANALYSIS
            </p>

            <h3>
              Your current workload
            </h3>

          </div>

        </div>

        <div className="ai-workload-list">

          {/* COMPLETED */}

          <div className="ai-workload-row">

            <div>

              <span>
                Completed
              </span>

              <strong>
                {analysis.completed}
              </strong>

            </div>

            <div className="ai-workload-track">

              <div
                style={{
                  width: `${
                    analysis.total ===
                    0
                      ? 0
                      : (
                          analysis.completed /
                          analysis.total
                        ) *
                        100
                  }%`,
                }}
              />

            </div>

          </div>

          {/* IN PROGRESS */}

          <div className="ai-workload-row">

            <div>

              <span>
                In Progress
              </span>

              <strong>
                {
                  tasks.filter(
                    (task) =>
                      task.status ===
                      "In Progress"
                  ).length
                }
              </strong>

            </div>

            <div className="ai-workload-track">

              <div
                style={{
                  width: `${
                    analysis.total ===
                    0
                      ? 0
                      : (
                          tasks.filter(
                            (task) =>
                              task.status ===
                              "In Progress"
                          ).length /
                          analysis.total
                        ) *
                        100
                  }%`,
                }}
              />

            </div>

          </div>

          {/* IMPORTANT */}

          <div className="ai-workload-row">

            <div>

              <span>
                Important
              </span>

              <strong>
                {analysis.important}
              </strong>

            </div>

            <div className="ai-workload-track">

              <div
                style={{
                  width: `${
                    analysis.total ===
                    0
                      ? 0
                      : (
                          analysis.important /
                          analysis.total
                        ) *
                        100
                  }%`,
                }}
              />

            </div>

          </div>

          {/* HIGH PRIORITY */}

          <div className="ai-workload-row">

            <div>

              <span>
                High Priority
              </span>

              <strong>
                {analysis.highPriority}
              </strong>

            </div>

            <div className="ai-workload-track">

              <div
                style={{
                  width: `${
                    analysis.total ===
                    0
                      ? 0
                      : (
                          analysis.highPriority /
                          analysis.total
                        ) *
                        100
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div className="ai-footer">

        <Brain
          size={18}
        />

        <span>
          TaskFlow Assistant analyzes
          your existing task data to
          help you decide what deserves
          attention first.
        </span>

      </div>

    </section>
  );
}

export default AIAssistant;