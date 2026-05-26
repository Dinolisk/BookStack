import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { STATUS_OPTIONS, statusColor } from "../constants/bookStatus";
import { deleteBook, updateBook } from "../services/api";
import StarRating from "./StarRating";

export default function BookCard({ book }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
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
              onChange={(event) => setStatus(event.target.value)}
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

  return (
    <li className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20">
      <div className="flex gap-4 p-5">
        {book.cover_image_url && (
          <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded">
            <img
              src={book.cover_image_url}
              alt={`Omslag för ${book.title}`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{book.title}</h2>
          <p className="text-slate-400">{book.author}</p>
          {book.rating != null && (
            <div className="mt-2">
              <StarRating value={book.rating} readOnly />
            </div>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(book.status)}`}
        >
          {book.status}
        </span>
      </div>

      {book.review && (
        <blockquote className="mb-4 border-l-2 border-slate-700 pl-3 text-sm italic text-slate-300">
          {book.review}
        </blockquote>
      )}

      {book.created_at && (
        <p className="mb-4 text-xs text-slate-500">
          Tillagd{" "}
          {new Date(book.created_at).toLocaleDateString("sv-SE", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}

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
          <p className="text-sm text-red-200">Ta bort den här boken permanent?</p>
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
  );
}
