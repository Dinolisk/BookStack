import { useAuth } from "../context/AuthContext";

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">
          BookStack
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Min bokhylla</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Inloggad som {user.email}
          {user.isDemo ? " (demo)" : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={logout}
        className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
      >
        Logga ut
      </button>
    </header>
  );
}
