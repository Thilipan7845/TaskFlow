import {
  BarChart3,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Target,
  TrendingUp,
} from "lucide-react";

function AnalyticsPanel({
  tasks = [],
  total = 0,
  completed = 0,
  inProgress = 0,
  overdue = 0,
  dueToday = 0,
  dueSoon = 0,
  upcoming = 0,
  noDeadline = 0,
}) {
  const completionRate =
    total > 0
      ? Math.round(
          (completed /
            total) *
            100
        )
      : 0;

  const activeTasks =
    total - completed;

  const highPriority =
    tasks.filter(
      (task) =>
        task.priority ===
        "High"
    ).length;

  const mediumPriority =
    tasks.filter(
      (task) =>
        task.priority ===
        "Medium"
    ).length;

  const lowPriority =
    tasks.filter(
      (task) =>
        task.priority ===
        "Low"
    ).length;

  const importantTasks =
    tasks.filter(
      (task) =>
        task.isImportant
    ).length;

  const progressValues =
    tasks
      .map(
        (task) =>
          task.progress
            ?.percentage || 0
      );

  const averageProgress =
    progressValues.length >
    0
      ? Math.round(
          progressValues.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          ) /
            progressValues.length
        )
      : 0;

  const productivityScore =
    Math.min(
      100,
      Math.round(
        completionRate * 0.6 +
          averageProgress *
            0.25 +
          (overdue === 0
            ? 15
            : Math.max(
                0,
                15 -
                  overdue *
                    3
              ))
      )
    );

  function getBarWidth(
    value
  ) {
    if (total === 0) {
      return 0;
    }

    return Math.round(
      (value / total) *
        100
    );
  }

  return (
    <section className="advanced-analytics">

      <div className="analytics-page-header">

        <div>
          <p className="section-label">
            PERFORMANCE CENTER
          </p>

          <h2>
            Productivity Analytics
          </h2>

          <p>
            Understand how effectively
            you're managing your work.
          </p>
        </div>

        <div className="analytics-score-card">

          <TrendingUp
            size={23}
          />

          <div>
            <span>
              Productivity Score
            </span>

            <strong>
              {productivityScore}
              /100
            </strong>
          </div>

        </div>

      </div>

      <div className="analytics-metric-grid">

        <div className="analytics-metric-card">
          <Target size={22} />

          <span>
            Completion Rate
          </span>

          <strong>
            {completionRate}%
          </strong>

          <small>
            {completed} of{" "}
            {total} tasks
          </small>
        </div>

        <div className="analytics-metric-card">
          <CheckCircle2
            size={22}
          />

          <span>
            Completed
          </span>

          <strong>
            {completed}
          </strong>

          <small>
            Finished tasks
          </small>
        </div>

        <div className="analytics-metric-card">
          <Clock3 size={22} />

          <span>
            Active
          </span>

          <strong>
            {activeTasks}
          </strong>

          <small>
            Tasks remaining
          </small>
        </div>

        <div className="analytics-metric-card analytics-danger">
          <AlertTriangle
            size={22}
          />

          <span>
            Overdue
          </span>

          <strong>
            {overdue}
          </strong>

          <small>
            Need attention
          </small>
        </div>

      </div>

      <div className="analytics-grid">

        <div className="analytics-card">

          <div className="analytics-card-title">
            <BarChart3
              size={19}
            />

            <h3>
              Task Status
            </h3>
          </div>

          <div className="analytics-bars">

            <div className="analytics-bar-row">

              <div>
                <span>
                  Completed
                </span>

                <strong>
                  {completed}
                </strong>
              </div>

              <div className="analytics-track">
                <div
                  className="analytics-fill"
                  style={{
                    width: `${getBarWidth(
                      completed
                    )}%`,
                  }}
                />
              </div>

            </div>

            <div className="analytics-bar-row">

              <div>
                <span>
                  In Progress
                </span>

                <strong>
                  {inProgress}
                </strong>
              </div>

              <div className="analytics-track">
                <div
                  className="analytics-fill"
                  style={{
                    width: `${getBarWidth(
                      inProgress
                    )}%`,
                  }}
                />
              </div>

            </div>

            <div className="analytics-bar-row">

              <div>
                <span>
                  Overdue
                </span>

                <strong>
                  {overdue}
                </strong>
              </div>

              <div className="analytics-track">
                <div
                  className="analytics-fill"
                  style={{
                    width: `${getBarWidth(
                      overdue
                    )}%`,
                  }}
                />
              </div>

            </div>

          </div>

        </div>

        <div className="analytics-card">

          <div className="analytics-card-title">
            <Target size={19} />

            <h3>
              Priority Distribution
            </h3>
          </div>

          <div className="priority-analysis">

            <div>
              <span>
                High
              </span>

              <strong>
                {highPriority}
              </strong>
            </div>

            <div>
              <span>
                Medium
              </span>

              <strong>
                {mediumPriority}
              </strong>
            </div>

            <div>
              <span>
                Low
              </span>

              <strong>
                {lowPriority}
              </strong>
            </div>

          </div>

        </div>

        <div className="analytics-card">

          <div className="analytics-card-title">
            <TrendingUp
              size={19}
            />

            <h3>
              Task Progress
            </h3>
          </div>

          <div className="analytics-big-number">
            {averageProgress}%
          </div>

          <p>
            Average subtask completion
            across your tasks.
          </p>

          <div className="analytics-track">
            <div
              className="analytics-fill"
              style={{
                width: `${averageProgress}%`,
              }}
            />
          </div>

        </div>

        <div className="analytics-card">

          <div className="analytics-card-title">
            <CheckCircle2
              size={19}
            />

            <h3>
              Planning Overview
            </h3>
          </div>

          <div className="planning-analysis">

            <div>
              <span>
                Due Today
              </span>
              <strong>
                {dueToday}
              </strong>
            </div>

            <div>
              <span>
                Due Soon
              </span>
              <strong>
                {dueSoon}
              </strong>
            </div>

            <div>
              <span>
                Upcoming
              </span>
              <strong>
                {upcoming}
              </strong>
            </div>

            <div>
              <span>
                No Deadline
              </span>
              <strong>
                {noDeadline}
              </strong>
            </div>

          </div>

        </div>

      </div>

      <div className="analytics-insight">

        <TrendingUp size={21} />

        <div>
          <strong>
            Productivity insight
          </strong>

          <p>
            {overdue > 0
              ? `You currently have ${overdue} overdue task${
                  overdue ===
                  1
                    ? ""
                    : "s"
                }. Clearing these should be your next priority.`
              : completionRate >=
                80
              ? "Excellent work! Your completion rate is very strong."
              : completionRate >=
                50
              ? "You're making steady progress. Focus on finishing active tasks."
              : "Try breaking large tasks into smaller subtasks to increase momentum."}
          </p>
        </div>

      </div>

      <div className="analytics-mini-stats">

        <span>
          ⭐ {importantTasks} important
          tasks
        </span>

        <span>
          📅 {dueToday} due today
        </span>

        <span>
          🚨 {overdue} overdue
        </span>

        <span>
          📈 {averageProgress}% average
          progress
        </span>

      </div>

    </section>
  );
}

export default AnalyticsPanel;