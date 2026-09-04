import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useMemo, useState } from "react";

function TaskCalendar({ tasks, onTaskClick }) {
  const [currentDate, setCurrentDate] =
    useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const today = new Date();

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const tasksByDate = useMemo(() => {
    const map = {};

    tasks.forEach((task) => {
      if (!task.dueDate) return;

      if (!map[task.dueDate]) {
        map[task.dueDate] = [];
      }

      map[task.dueDate].push(task);
    });

    return map;
  }, [tasks]);

  function previousMonth() {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  }

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(
      <div
        key={`empty-${i}`}
        className="calendar-day empty"
      />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(
      month + 1
    ).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

    const dayTasks =
      tasksByDate[dateString] || [];

    cells.push(
      <div
        key={dateString}
        className={`calendar-day ${
          isToday(day)
            ? "calendar-today"
            : ""
        }`}
      >
        <div className="calendar-day-number">
          {day}
        </div>

        <div className="calendar-task-list">
          {dayTasks.slice(0, 3).map((task) => (
            <button
              key={task.id}
              type="button"
              className={`calendar-task ${
                task.status === "Completed"
                  ? "calendar-task-completed"
                  : ""
              }`}
              onClick={() =>
                onTaskClick?.(task)
              }
              title={task.title}
            >
              {task.title}
            </button>
          ))}

          {dayTasks.length > 3 && (
            <span className="calendar-more">
              +{dayTasks.length - 3} more
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="calendar-section">

      <div className="calendar-header">

        <div>
          <p className="section-label">
            PLANNER
          </p>

          <h2>Task Calendar</h2>

          <p>
            See your deadlines at a glance.
          </p>
        </div>

        <div className="calendar-navigation">

          <button
            type="button"
            onClick={previousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <strong>
            {monthName} {year}
          </strong>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>

        </div>

      </div>


      <div className="calendar-weekdays">
        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>


      <div className="calendar-grid">
        {cells}
      </div>


      <div className="calendar-legend">
        <CalendarDays size={15} />
        <span>
          Click a task to focus on it.
        </span>
      </div>

    </section>
  );
}

export default TaskCalendar;