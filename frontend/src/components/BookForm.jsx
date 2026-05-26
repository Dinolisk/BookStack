import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { STATUS_OPTIONS } from "../constants/bookStatus";
import { createBook } from "../services/api";
import { useCoverImage } from "../hooks/useCoverImage";
import BookSearch from "./BookSearch";

function SelectedBookPreview({ book, onBack }) {
  const cover = useCoverImage(book.coverImageUrl, book.isbn);
  return (
    <div className="rounded-lg border border-sky-500/30 bg-slate-950 p-4">
      <div className="flex gap-4">
        {cover.src ? (
          <img
            src={cover.src}
            onLoad={cover.handleLoad}
            onError={cover.handleError}
            alt={`Omslag för ${book.title}`}
            className="aspect-[2/3] w-20 shrink-0 rounded bg-slate-800 object-contain shadow-md"
          />
        ) : (
          <div className="flex aspect-[2/3] w-20 shrink-0 flex-col items-center justify-center gap-1 rounded bg-slate-800 px-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-slate-500"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span className="line-clamp-2 text-center text-xs text-slate-500">
              Inget omslag
            </span>
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-white">{book.title}</p>
          <p className="text-slate-400">{book.author}</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 text-sm text-sky-400 hover:text-sky-300"
          >
            Välj en annan bok
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookForm() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("search");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("Vill läsa");
  const [validationError, setValidationError] = useState("");

  const mutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      resetForm();
    },
  });

  function resetForm() {
    setMode("search");
    setSelectedBook(null);
    setTitle("");
    setAuthor("");
    setStatus("Vill läsa");
    setValidationError("");
    setSearchResetKey((key) => key + 1);
  }

  function handleSearchSelect(result) {
    setSelectedBook(result);
    setTitle(result.title);
    setAuthor(result.author);
    setStatus("Vill läsa");
    setValidationError("");
    setMode("selected");
    setSearchResetKey((key) => key + 1);
  }

  function openManualMode() {
    setSelectedBook(null);
    setTitle("");
    setAuthor("");
    setStatus("Vill läsa");
    setValidationError("");
    setMode("manual");
    setSearchResetKey((key) => key + 1);
  }

  function backToSearch() {
    setSelectedBook(null);
    setTitle("");
    setAuthor("");
    setValidationError("");
    setMode("search");
    setSearchResetKey((key) => key + 1);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setValidationError("");

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();

    if (!trimmedTitle || !trimmedAuthor) {
      setValidationError("Titel och författare krävs.");
      return;
    }

    mutation.mutate({
      title: trimmedTitle,
      author: trimmedAuthor,
      status,
      cover_image_url: selectedBook?.coverImageUrl || undefined,
      isbn: selectedBook?.isbn || undefined,
    });
  }

  const errorMessage = validationError || mutation.error?.message;

  return (
    <section className="mb-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold text-white">Lägg till bok</h2>
      <p className="mt-1 text-sm text-slate-400">
        {mode === "search" &&
          "Sök och välj en bok – titel, författare och omslag fylls i automatiskt."}
        {mode === "selected" &&
          "Bekräfta boken nedan och välj status innan du sparar."}
        {mode === "manual" &&
          "Manuellt läge utan Google Books – ingen omslagsbild hämtas."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {mode === "search" && (
          <>
            <BookSearch
              key={searchResetKey}
              onSelect={handleSearchSelect}
              disabled={mutation.isPending}
            />
            <button
              type="button"
              onClick={openManualMode}
              className="text-sm text-sky-400 hover:text-sky-300"
            >
              Hittar du inte boken? Lägg till manuellt
            </button>
          </>
        )}

        {mode === "selected" && selectedBook && (
          <SelectedBookPreview book={selectedBook} onBack={backToSearch} />
        )}

        {mode === "manual" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block" htmlFor="book-title">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  Titel
                </span>
                <input
                  id="book-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
                  placeholder="Ex. Broderna Lejonhjarta"
                  disabled={mutation.isPending}
                />
              </label>

              <label className="block" htmlFor="book-author">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  Författare
                </span>
                <input
                  id="book-author"
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
                  placeholder="Ex. Astrid Lindgren"
                  disabled={mutation.isPending}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={backToSearch}
              className="text-sm text-sky-400 hover:text-sky-300"
            >
              Tillbaka till sök
            </button>
          </>
        )}

        {(mode === "selected" || mode === "manual") && (
          <>
            <label className="block max-w-xs">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Status
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
                disabled={mutation.isPending}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {errorMessage && (
              <div
                className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Sparar..." : "Lägg till bok"}
            </button>
          </>
        )}
      </form>
    </section>
  );
}
