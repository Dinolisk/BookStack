import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";

const mockLoginAsDemo = vi.fn();
const mockSetError = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
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
});
