import {
  Plus,
  Pencil,
  CheckCircle2,
  Trash2,
  Activity,
} from "lucide-react";

function getActivityIcon(action) {
  switch (action) {
    case "created":
      return <Plus size={16} />;

    case "updated":
      return <Pencil size={16} />;

    case "completed":
      return <CheckCircle2 size={16} />;

    case "deleted":
      return <Trash2 size={16} />;

    default:
      return <Activity size={16} />;
  }
}

function getActivityText(activity) {
  switch (activity.action) {
    case "created":
      return "Created task";

    case "updated":
      return "Updated task";

    case "completed":
      return "Completed task";

    case "deleted":
      return "Deleted task";

    default:
      return activity.action;
  }
}

function TaskActivity({ activities }) {
  return (
    <section className="activity-section">

      <div className="activity-header">
        <div>
          <p className="section-label">
            TIMELINE
          </p>

          <h2>Recent Activity</h2>

          <p>
            Track what has happened in your
            workspace.
          </p>
        </div>
      </div>


      {activities.length === 0 ? (
        <div className="activity-empty">
          <Activity size={28} />

          <p>
            No activity yet.
          </p>
        </div>
      ) : (
        <div className="activity-list">

          {activities.map((activity) => (
            <div
              key={activity.id}
              className="activity-item"
            >

              <div className="activity-icon">
                {getActivityIcon(
                  activity.action
                )}
              </div>

              <div className="activity-content">

                <strong>
                  {getActivityText(activity)}
                </strong>

                <span>
                  {activity.task_title}
                </span>

                <small>
                  {new Date(
                    activity.created_at
                  ).toLocaleString()}
                </small>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default TaskActivity;