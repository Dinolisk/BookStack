import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginAsDemo, error, setError } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleDemoLogin() {
    setLocalError("");
    setError("");
    setIsPending(true);

    try {
      await loginAsDemo();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  const message = localError || error;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">
          BookStack
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Välkommen</h1>
        <p className="mt-3 text-slate-400">
          Testa appen direkt med demokontot – perfekt för rekryterare som vill se
          bokhyllan utan registrering.
        </p>

        {message && (
          <div
            className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
            role="alert"
          >
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isPending}
          className="mt-8 w-full rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Loggar in..." : "Prova demo (demo@bookstack.com)"}
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          Full registrering och inloggning kommer i nästa steg.
        </p>
      </div>
    </div>
  );
}
