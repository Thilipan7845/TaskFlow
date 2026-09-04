import {
  ListTodo,
  Clock3,
  CheckCircle2,
  AlertCircle,
  CalendarCheck2,
  Timer,
  CalendarDays,
} from "lucide-react";

function Dashboardstats({
  total,
  inProgress,
  completed,
  overdue,
  dueToday,
  dueSoon,
  upcoming,
  activeFilter,
  onFilter,
}) {
  return (
    <section className="dashboard-stats">

      {/* TOTAL TASKS */}

      <button
        type="button"
        className={`stat-card ${
          activeFilter === "All"
            ? "stat-card-active"
            : ""
        }`}
        onClick={() => onFilter("All")}
      >
        <div className="stat-icon total-icon">
          <ListTodo size={22} />
        </div>

        <div>
          <p>Total Tasks</p>
          <h3>{total}</h3>
        </div>
      </button>

      {/* IN PROGRESS */}

      <div className="stat-card stat-card-static">
        <div className="stat-icon progress-icon">
          <Clock3 size={22} />
        </div>

        <div>
          <p>In Progress</p>
          <h3>{inProgress}</h3>
        </div>
      </div>

      {/* COMPLETED */}

      <div className="stat-card stat-card-static">
        <div className="stat-icon completed-icon">
          <CheckCircle2 size={22} />
        </div>

        <div>
          <p>Completed</p>
          <h3>{completed}</h3>
        </div>
      </div>

      {/* OVERDUE */}

      <button
        type="button"
        className={`stat-card ${
          activeFilter === "overdue"
            ? "stat-card-active overdue-active"
            : ""
        }`}
        onClick={() =>
          onFilter("overdue")
        }
      >
        <div className="stat-icon overdue-icon">
          <AlertCircle size={22} />
        </div>

        <div>
          <p>Overdue</p>
          <h3>{overdue}</h3>
        </div>
      </button>

      {/* DUE TODAY */}

      <button
        type="button"
        className={`stat-card ${
          activeFilter === "today"
            ? "stat-card-active today-active"
            : ""
        }`}
        onClick={() =>
          onFilter("today")
        }
      >
        <div className="stat-icon today-icon">
          <CalendarCheck2 size={22} />
        </div>

        <div>
          <p>Due Today</p>
          <h3>{dueToday}</h3>
        </div>
      </button>

      {/* DUE SOON */}

      <button
        type="button"
        className={`stat-card ${
          activeFilter === "soon"
            ? "stat-card-active soon-active"
            : ""
        }`}
        onClick={() =>
          onFilter("soon")
        }
      >
        <div className="stat-icon soon-icon">
          <Timer size={22} />
        </div>

        <div>
          <p>Due Soon</p>
          <h3>{dueSoon}</h3>
        </div>
      </button>

      {/* UPCOMING */}

      <button
        type="button"
        className={`stat-card ${
          activeFilter === "upcoming"
            ? "stat-card-active upcoming-active"
            : ""
        }`}
        onClick={() =>
          onFilter("upcoming")
        }
      >
        <div className="stat-icon upcoming-icon">
          <CalendarDays size={22} />
        </div>

        <div>
          <p>Upcoming</p>
          <h3>{upcoming}</h3>
        </div>
      </button>

    </section>
  );
}

export default Dashboardstats;