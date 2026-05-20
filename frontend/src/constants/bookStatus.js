export const STATUS_OPTIONS = ["Vill läsa", "Läser", "Har läst klart"];

export const STATUS_TABS = [
  { id: "all", label: "Alla" },
  ...STATUS_OPTIONS.map((status) => ({ id: status, label: status })),
];

export function statusColor(status) {
  if (status === "Läser") return "bg-amber-500/20 text-amber-300";
  if (status === "Har läst klart") return "bg-emerald-500/20 text-emerald-300";
  return "bg-sky-500/20 text-sky-300";
}

export function countBooksByStatus(books) {
  const counts = {
    all: books.length,
  };

  for (const status of STATUS_OPTIONS) {
    counts[status] = books.filter((book) => book.status === status).length;
  }

  return counts;
}

export function filterBooksByStatus(books, activeTab) {
  if (activeTab === "all") {
    return books;
  }

  return books.filter((book) => book.status === activeTab);
}
