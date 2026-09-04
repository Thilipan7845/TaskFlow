import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Target,
} from "lucide-react";

function ProductivityInsights({
  total,
  completed,
  inProgress,
  overdue,
  dueToday,
  dueSoon,
  upcoming,
  noDeadline,
}) {
  const completion =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  const remaining = Math.max(
    total - completed,
    0
  );

  let message = "Start completing tasks to build momentum.";

  if (total === 0) {
    message = "Create your first task and start your flow.";
  } else if (overdue > 0) {
    message = `You have ${overdue} overdue task${
      overdue > 1 ? "s" : ""
    }. Clear those first.`;
  } else if (completion >= 80) {
    message = "Excellent work! Your productivity is very strong.";
  } else if (completion >= 50) {
    message = "Good progress. Keep pushing toward your goals.";
  } else if (completed > 0) {
    message = "You're making progress. Keep the momentum going.";
  }

  return (
    <section className="productivity-section">

      <div className="productivity-header">
        <div>
          <p className="section-label">
            PRODUCTIVITY
          </p>

          <h2>
            Your Productivity Insights
          </h2>

          <p>
            A quick overview of your current
            task performance.
          </p>
        </div>

        <div className="productivity-score">
          <TrendingUp size={18} />
          <strong>{completion}%</strong>
          <span>complete</span>
        </div>
      </div>


      {/* MAIN PROGRESS */}

      <div className="productivity-main">

        <div className="progress-content">

          <div className="progress-title">
            <div>
              <span>Overall Completion</span>

              <strong>
                {completed} / {total}
              </strong>
            </div>

            <span>
              {completion}%
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${completion}%`,
              }}
            />
          </div>

          <p className="progress-description">
            {remaining === 0
              ? "All tasks completed 🎉"
              : `${remaining} task${
                  remaining !== 1 ? "s" : ""
                } remaining`}
          </p>
        </div>


        {/* PRODUCTIVITY MESSAGE */}

        <div className="productivity-message">
          <Target size={22} />

          <div>
            <strong>
              Productivity Insight
            </strong>

            <p>{message}</p>
          </div>
        </div>

      </div>


      {/* BREAKDOWN */}

      <div className="productivity-breakdown">

        <div className="insight-item">
          <CheckCircle2 size={18} />

          <div>
            <span>Completed</span>
            <strong>{completed}</strong>
          </div>
        </div>


        <div className="insight-item">
          <Clock3 size={18} />

          <div>
            <span>In Progress</span>
            <strong>{inProgress}</strong>
          </div>
        </div>


        <div className="insight-item">
          <AlertTriangle size={18} />

          <div>
            <span>Overdue</span>
            <strong>{overdue}</strong>
          </div>
        </div>


        <div className="insight-item">
          <span className="insight-dot today-dot" />

          <div>
            <span>Due Today</span>
            <strong>{dueToday}</strong>
          </div>
        </div>


        <div className="insight-item">
          <span className="insight-dot soon-dot" />

          <div>
            <span>Due Soon</span>
            <strong>{dueSoon}</strong>
          </div>
        </div>


        <div className="insight-item">
          <span className="insight-dot upcoming-dot" />

          <div>
            <span>Upcoming</span>
            <strong>{upcoming}</strong>
          </div>
        </div>


        <div className="insight-item">
          <span className="insight-dot none-dot" />

          <div>
            <span>No Deadline</span>
            <strong>{noDeadline}</strong>
          </div>
        </div>

      </div>

    </section>
  );
}

export default ProductivityInsights;