import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  countBooksByStatus,
  filterBooksByStatus,
} from "../constants/bookStatus";
import { getBooks } from "../services/api";
import BookCard from "./BookCard";
import StatusTabs from "./StatusTabs";

function emptyMessage(activeTab) {
  if (activeTab === "all") {
    return {
      title: "Inga böcker ännu",
      description: "Använd formuläret ovan för att lägga till din första bok.",
    };
  }

  return {
    title: `Inga böcker med status "${activeTab}"`,
    description: `Lägg till en bok med status "${activeTab}" eller byt flik.`,
  };
}

export default function BookList() {
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  if (isLoading) {
    return (
      <p className="text-slate-400" role="status">
        Laddar böcker...
      </p>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300"
        role="alert"
      >
        Kunde inte hämta böcker: {error.message}
      </div>
    );
  }

  const counts = countBooksByStatus(data);
  const filteredBooks = filterBooksByStatus(data, activeTab);
  const message = emptyMessage(activeTab);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Dina böcker</h2>
        <p className="text-sm text-slate-400">
          {filteredBooks.length} av {data.length} böcker
        </p>
      </div>

      <StatusTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {filteredBooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <p className="text-lg font-medium text-slate-200">{message.title}</p>
          <p className="mt-2 text-slate-400">{message.description}</p>
        </div>
      ) : (
        <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </ul>
      )}
    </section>
  );
}
