import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { register, login, loginAsDemo, error, setError } = useAuth();

  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [localError, setLocalError] = useState("");

  function switchTab(tab) {
    setActiveTab(tab);
    setLocalError("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");
    setError("");

    if (activeTab === "register" && password !== confirmPassword) {
      setLocalError("Lösenorden matchar inte.");
      return;
    }

    setIsPending(true);
    try {
      if (activeTab === "register") {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsPending(false);
    }
  }

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

  const alertMessage = localError || error;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-sky-400">
          BookStack
        </p>
        <h1 className="mt-3 text-center text-3xl font-bold text-white">Välkommen</h1>

        {/* Tab switcher */}
        <div className="mt-6 flex rounded-lg border border-slate-700 p-1">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              activeTab === "login"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Logga in
          </button>
          <button
            type="button"
            onClick={() => switchTab("register")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              activeTab === "register"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Skapa konto
          </button>
        </div>

        {/* Login / Register form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">
              E-post
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="din@email.com"
              disabled={isPending}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-sky-500 placeholder:text-slate-500 focus:ring-2 disabled:opacity-50"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">
              Lösenord
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={activeTab === "register" ? "new-password" : "current-password"}
              placeholder="••••••••"
              disabled={isPending}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-sky-500 placeholder:text-slate-500 focus:ring-2 disabled:opacity-50"
            />
          </label>

          {activeTab === "register" && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Bekräfta lösenord
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isPending}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-sky-500 placeholder:text-slate-500 focus:ring-2 disabled:opacity-50"
              />
            </label>
          )}

          {alertMessage && (
            <div
              className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
              role="alert"
            >
              {alertMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? activeTab === "register" ? "Skapar konto..." : "Loggar in..."
              : activeTab === "register" ? "Skapa konto" : "Logga in"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs text-slate-500">eller</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        {/* Demo button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isPending}
          className="w-full rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Loggar in..." : "Prova demo (demo@bookstack.com)"}
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          Demo-kontot ger dig direkt tillgång till en fullt förifylld bokhylla.
        </p>
      </div>
    </div>
  );
}
