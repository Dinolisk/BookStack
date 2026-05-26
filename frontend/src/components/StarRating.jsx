const STAR_LABELS = ["1 stjärna", "2 stjärnor", "3 stjärnor", "4 stjärnor", "5 stjärnor"];

export default function StarRating({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}) {
  return (
    <div
      className="flex items-center gap-1"
      role={readOnly ? "img" : "group"}
      aria-label={readOnly && value ? `${value} av 5 stjärnor` : "Välj betyg"}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value != null && star <= value;

        if (readOnly) {
          return (
            <span
              key={star}
              className={filled ? "text-amber-400" : "text-slate-600"}
              aria-hidden="true"
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            aria-label={STAR_LABELS[star - 1]}
            aria-pressed={value === star}
            className={`text-xl transition disabled:opacity-50 ${
              filled ? "text-amber-400 hover:text-amber-300" : "text-slate-600 hover:text-amber-200"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
