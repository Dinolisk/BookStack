import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLoginAsDemo = vi.fn();
const mockSetError = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    loginAsDemo: mockLoginAsDemo,
    error: "",
    setError: mockSetError,
  }),
}));

function renderLoginPage() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginPage />
    </QueryClientProvider>
  );
}

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ── Login tab ──────────────────────────────────────────────────────────────

  it("renders the demo login button", () => {
    renderLoginPage();

    expect(
      screen.getByRole("button", { name: /prova demo/i })
    ).toBeInTheDocument();
  });

  it("calls loginAsDemo when demo button is clicked", async () => {
    const user = userEvent.setup();
    mockLoginAsDemo.mockResolvedValueOnce({
      email: "demo@bookstack.com",
      isDemo: true,
    });

    renderLoginPage();
    await user.click(screen.getByRole("button", { name: /prova demo/i }));

    expect(mockLoginAsDemo).toHaveBeenCalledOnce();
  });

  it("shows an error when demo login fails", async () => {
    const user = userEvent.setup();
    mockLoginAsDemo.mockRejectedValueOnce(new Error("Demo login failed"));

    renderLoginPage();
    await user.click(screen.getByRole("button", { name: /prova demo/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Demo login failed"
    );
  });

  it("calls login with email and password on submit", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});

    renderLoginPage();
    await user.type(screen.getByPlaceholderText(/din@email\.com/i), "user@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByText("Logga in", { selector: "button[type='submit']" }));

    expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password123");
  });

  it("shows an error when login fails", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("Fel e-post eller lösenord."));

    renderLoginPage();
    await user.type(screen.getByPlaceholderText(/din@email\.com/i), "user@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");
    await user.click(screen.getByText("Logga in", { selector: "button[type='submit']" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Fel e-post eller lösenord.");
  });

  // ── Register tab ───────────────────────────────────────────────────────────

  it("shows confirm password field when switching to register tab", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    expect(screen.queryByPlaceholderText(/bekräfta/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /skapa konto/i }));
    expect(screen.getByLabelText(/bekräfta lösenord/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: /skapa konto/i }));

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(screen.getByPlaceholderText(/din@email\.com/i), "user@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "different456");
    await user.click(screen.getByText("Skapa konto", { selector: "button[type='submit']" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Lösenorden matchar inte.");
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls register with email and password when passwords match", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({});

    renderLoginPage();
    await user.click(screen.getByRole("button", { name: /skapa konto/i }));

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(screen.getByPlaceholderText(/din@email\.com/i), "new@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");
    await user.click(screen.getByText("Skapa konto", { selector: "button[type='submit']" }));

    expect(mockRegister).toHaveBeenCalledWith("new@example.com", "password123");
  });
});
