import { Star } from "lucide-react";

function ImportantTask({
  isImportant,
  onToggle,
}) {
  return (
    <button
      type="button"
      className={`important-task-btn ${
        isImportant
          ? "important-active"
          : ""
      }`}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      title={
        isImportant
          ? "Remove from important"
          : "Mark as important"
      }
      aria-label={
        isImportant
          ? "Remove from important"
          : "Mark as important"
      }
    >
      <Star
        size={18}
        fill={
          isImportant
            ? "currentColor"
            : "none"
        }
      />
    </button>
  );
}

export default ImportantTask;