import { useEffect } from "react";
import { statusColor } from "../constants/bookStatus";
import { useCoverImage } from "../hooks/useCoverImage";
import StarRating from "./StarRating";

export default function BookModal({ book, onClose }) {
  const cover = useCoverImage(book.cover_image_url);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          ✕
        </button>

        {/* Top section: cover + metadata */}
        <div className="flex gap-5 p-6">
          {cover.src ? (
            <img
              src={cover.src}
              onLoad={cover.handleLoad}
              onError={cover.handleError}
              alt={`Omslag för ${book.title}`}
              className="h-40 w-28 shrink-0 rounded-lg object-contain shadow-lg"
            />
          ) : (
            <div className="flex h-40 w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-lg bg-slate-800 px-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-slate-500"
                aria-hidden="true"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="line-clamp-3 text-center text-xs text-slate-500">
                {book.title}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1 pt-1">
            <h2 className="text-xl font-bold leading-snug text-white">
              {book.title}
            </h2>
            <p className="mt-1 text-slate-400">{book.author}</p>

            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor(book.status)}`}
            >
              {book.status}
            </span>

            {book.rating != null && (
              <div className="mt-3">
                <StarRating value={book.rating} readOnly />
              </div>
            )}

            {book.created_at && (
              <p className="mt-3 text-xs text-slate-500">
                Tillagd{" "}
                {new Date(book.created_at).toLocaleDateString("sv-SE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Review */}
        {book.review && (
          <div className="border-t border-slate-800 px-6 py-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recension
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {book.review}
            </p>
          </div>
        )}

        {/* Footer close */}
        <div className="border-t border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-slate-700 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}
