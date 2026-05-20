import AppHeader from "./components/AppHeader";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./context/AuthContext";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-400">
      Laddar...
    </div>
  );
}

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <AppHeader />
      <BookForm />
      <BookList />
    </div>
  );
}

export default function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}
