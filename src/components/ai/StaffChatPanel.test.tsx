import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { StaffChatPanel } from "./StaffChatPanel";
import * as useAuthModule from "@/hooks/useAuth";
import api from "@/lib/api";

vi.mock("@/lib/api");
vi.mock("@/hooks/useAuth");

const mockUser = {
  id: 1,
  username: "staff01",
  type: "staff",
  employee: { id: 1, name: "Staff One", branch_id: 1, gender: "male" },
  branch: { id: 1, name: "Main Branch" },
  branches: [],
};

function openPanel() {
  const toggleBtn = screen.getByRole("button", { name: /open staff assistant/i });
  fireEvent.click(toggleBtn);
}

describe("StaffChatPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("renders the toggle button for authenticated staff", () => {
    render(<StaffChatPanel />);
    expect(screen.getByRole("button", { name: /open staff assistant/i })).toBeInTheDocument();
  });

  it("does not render when user is not authenticated", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = render(<StaffChatPanel />);
    expect(container.firstChild).toBeNull();
  });

  it("opens the chat panel when toggle button is clicked", () => {
    render(<StaffChatPanel />);
    openPanel();
    expect(screen.getByText("Staff Assistant")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask a question...")).toBeInTheDocument();
  });

  it("shows typing indicator while awaiting response (Requirement 5.8)", async () => {
    // Delay the API response so we can observe the typing indicator
    vi.mocked(api.post).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { type: "data_response", value: 100, period: "This week", branch: "Main Branch", formattedAnswer: "Revenue is 100" } }), 200))
    );

    render(<StaffChatPanel />);
    openPanel();

    const input = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "What is this week's revenue?" } });
    fireEvent.submit(input.closest("form")!);

    // Typing indicator should appear immediately
    await waitFor(() => {
      // The three animated dots are rendered as spans inside the typing indicator
      const dots = document.querySelectorAll(".animate-bounce");
      expect(dots.length).toBe(3);
    });

    // After response, typing indicator disappears
    await waitFor(() => {
      expect(document.querySelectorAll(".animate-bounce").length).toBe(0);
    });
  });

  it("displays structured answer with value, period, and branch for data_response (Requirement 5.4)", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        type: "data_response",
        value: "Rp 5.000.000",
        period: "This week",
        branch: "Main Branch",
        formattedAnswer: "Total revenue this week is Rp 5.000.000",
      },
    });

    render(<StaffChatPanel />);
    openPanel();

    const input = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "What is this week's revenue?" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Total revenue this week is Rp 5.000.000")).toBeInTheDocument();
      expect(screen.getByText("This week")).toBeInTheDocument();
      expect(screen.getByText("Main Branch")).toBeInTheDocument();
      expect(screen.getByText("Rp 5.000.000")).toBeInTheDocument();
    });
  });

  it("shows inline unavailability message on error response (Requirement 5.7)", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { type: "error", message: "Service unavailable" },
    });

    render(<StaffChatPanel />);
    openPanel();

    const input = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "Show me bookings" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Assistant temporarily unavailable.")).toBeInTheDocument();
    });
  });

  it("shows inline unavailability message on network error (Requirement 5.7)", async () => {
    vi.mocked(api.post).mockRejectedValue(new Error("Network error"));

    render(<StaffChatPanel />);
    openPanel();

    const input = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "Show me staff" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Assistant temporarily unavailable.")).toBeInTheDocument();
    });
  });

  it("shows authorization error message for out-of-scope queries", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { type: "authorization_error" },
    });

    render(<StaffChatPanel />);
    openPanel();

    const input = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "Show all branches revenue" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Data not accessible for your role.")).toBeInTheDocument();
    });
  });

  it("displays user message in the chat", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { type: "data_response", value: 0, period: "Today", branch: "Main", formattedAnswer: "No bookings today" },
    });

    render(<StaffChatPanel />);
    openPanel();

    const input = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(input, { target: { value: "How many bookings today?" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByText("How many bookings today?")).toBeInTheDocument();
  });
});
