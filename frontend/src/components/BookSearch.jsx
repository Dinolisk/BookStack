import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { searchBooks } from "../services/api";

export default function BookSearch({ onSelect, disabled = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, error, isFetched } = useQuery({
    queryKey: ["bookSearch", debouncedQuery],
    queryFn: () => searchBooks(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const showEmptyState =
    isFetched && !isLoading && !isError && debouncedQuery.length >= 2 && data?.length === 0;

  return (
    <div className="space-y-3">
      <label className="block" htmlFor="book-search">
        <span className="mb-1 block text-sm font-medium text-slate-300">
          Sök bok
        </span>
        <input
          id="book-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          disabled={disabled}
          placeholder="Sök titel eller författare..."
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
        />
      </label>

      {isLoading && debouncedQuery.length >= 2 && (
        <p className="text-sm text-slate-400" role="status">
          Söker efter böcker...
        </p>
      )}

      {isError && (
        <div
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200"
          role="alert"
        >
          {error.message} Prova igen eller lägg till boken manuellt.
        </div>
      )}

      {showEmptyState && (
        <p className="text-sm text-slate-400" role="status">
          Inga träffar för &quot;{debouncedQuery}&quot;. Prova ett annat sökord
          eller lägg till boken manuellt.
        </p>
      )}

      {data?.length > 0 && (
        <ul className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-2">
          {data.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => onSelect(result)}
                disabled={disabled}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-900 disabled:opacity-50"
              >
                {result.coverImageUrl ? (
                  <img
                    src={result.coverImageUrl}
                    alt=""
                    className="aspect-[2/3] w-11 shrink-0 rounded bg-slate-800 object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-11 items-center justify-center rounded bg-slate-800 text-xs text-slate-500">
                    Inget omslag
                  </div>
                )}
                <span>
                  <span className="block font-medium text-white">
                    {result.title}
                  </span>
                  <span className="block text-sm text-slate-400">
                    {result.author}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
