import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { STATUS_OPTIONS, statusColor } from "../constants/bookStatus";
import { deleteBook, updateBook } from "../services/api";
import BookModal from "./BookModal";
import StarRating from "./StarRating";
import { useCoverImage } from "../hooks/useCoverImage";

export default function BookCard({ book }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [status, setStatus] = useState(book.status);
  const [rating, setRating] = useState(book.rating ?? null);
  const [review, setReview] = useState(book.review ?? "");
  const [validationError, setValidationError] = useState("");

  const updateMutation = useMutation({
    mutationFn: (updates) => updateBook(book.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setIsEditing(false);
      setValidationError("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBook(book.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setConfirmDelete(false);
    },
  });

  const isPending = updateMutation.isPending || deleteMutation.isPending;
  const cover = useCoverImage(book.cover_image_url, book.isbn);
  const errorMessage =
    validationError ||
    updateMutation.error?.message ||
    deleteMutation.error?.message;

  function startEditing() {
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setRating(book.rating ?? null);
    setReview(book.review ?? "");
    setValidationError("");
    setConfirmDelete(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setValidationError("");
    updateMutation.reset();
  }

  function handleUpdate(event) {
    event.preventDefault();
    setValidationError("");

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();

    if (!trimmedTitle || !trimmedAuthor) {
      setValidationError("Titel och författare krävs.");
      return;
    }

    updateMutation.mutate({
      title: trimmedTitle,
      author: trimmedAuthor,
      status,
      rating,
      review: review.trim() || null,
    });
  }

  function handleDelete() {
    deleteMutation.mutate();
  }

  // ── Edit mode ─────────────────────────────────────────────
  if (isEditing) {
    return (
      <li className="rounded-xl border border-sky-500/40 bg-slate-900 p-5 shadow-lg shadow-black/20">
        <form onSubmit={handleUpdate} className="space-y-3" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">
              Titel
            </span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">
              Författare
            </span>
            <input
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">
              Status
            </span>
            <select
              value={status}
              onChange={(event) => {
                const newStatus = event.target.value;
                setStatus(newStatus);
                if (newStatus !== "Har läst klart") {
                  setRating(null);
                  setReview("");
                }
              }}
              disabled={isPending}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {status === "Har läst klart" && (
            <>
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  Betyg
                </span>
                <StarRating
                  value={rating}
                  onChange={setRating}
                  disabled={isPending}
                />
                {rating != null && (
                  <button
                    type="button"
                    onClick={() => setRating(null)}
                    disabled={isPending}
                    className="mt-1 text-xs text-slate-500 hover:text-slate-300"
                  >
                    Ta bort betyg
                  </button>
                )}
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  Recension
                </span>
                <textarea
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  disabled={isPending}
                  rows={3}
                  placeholder="Skriv ett kort omdöme (valfritt)"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
                />
              </label>
            </>
          )}

          {errorMessage && (
            <div
              className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Sparar..." : "Spara"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isPending}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      </li>
    );
  }

  // ── View mode ─────────────────────────────────────────────
  return (
    <>
      <li className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20">
        {/* Cover image – portrait 2:3 aspect ratio, never cropped */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="aspect-[2/3] w-full shrink-0 overflow-hidden bg-slate-950"
          aria-label={`Visa detaljer för ${book.title}`}
        >
          {cover.src ? (
            <img
              src={cover.src}
              onLoad={cover.handleLoad}
              onError={cover.handleError}
              alt={`Omslag för ${book.title}`}
              className="h-full w-full object-contain transition duration-200 hover:opacity-90"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-800/60 px-3">
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
              <span className="line-clamp-3 text-center text-xs font-medium text-slate-400">
                {book.title}
              </span>
            </div>
          )}
        </button>

        {/* Card body – flex-col so buttons pin to bottom */}
        <div className="flex flex-1 flex-col p-4">
          {/* Title, author, status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-white">
                {book.title}
              </h2>
              <p className="truncate text-sm text-slate-400">{book.author}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(book.status)}`}
            >
              {book.status}
            </span>
          </div>

          {/* Stars */}
          {book.rating != null && (
            <div className="mt-2">
              <StarRating value={book.rating} readOnly />
            </div>
          )}

          {/* Review indicator */}
          {book.review && (
            <p className="mt-2 line-clamp-2 text-xs italic text-slate-500">
              {book.review}
            </p>
          )}

          {/* Buttons – always at bottom */}
          <div className="mt-auto pt-4">
            {errorMessage && (
              <div
                className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            {confirmDelete ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                <p className="text-sm text-red-200">
                  Ta bort den här boken permanent?
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? "Tar bort..." : "Ja, ta bort"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(false);
                      deleteMutation.reset();
                    }}
                    disabled={isPending}
                    className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="flex-1 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Detaljer
                </button>
                <button
                  type="button"
                  onClick={startEditing}
                  disabled={isPending}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                >
                  Redigera
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isPending}
                  className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                >
                  Ta bort
                </button>
              </div>
            )}
          </div>
        </div>
      </li>

      {/* Modal – rendered outside li to avoid stacking context issues */}
      {showModal && (
        <BookModal book={book} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
