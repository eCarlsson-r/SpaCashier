import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendationPanel } from "./RecommendationPanel";
import * as useRecommendationsModule from "@/hooks/useRecommendations";
import { TreatmentRecommendation } from "@/lib/types";

// Mock the hook so tests don't make real API calls
vi.mock("@/hooks/useRecommendations");

const mockRecommendations: TreatmentRecommendation[] = [
  {
    rank: 1,
    rationale: "Great for relaxation based on your history",
    treatment: {
      id: "T001",
      name: "Swedish Massage",
      duration: 60,
      price: 250000,
      description: "Full body relaxation massage",
      category_id: "1",
      icon_img: null,
      voucher_purchase_quantity: 0,
      voucher_normal_quantity: 0,
    } as any,
  },
  {
    rank: 2,
    rationale: "Popular choice for stress relief",
    treatment: {
      id: "T002",
      name: "Deep Tissue Massage",
      duration: 90,
      price: 350000,
      description: "Targets deep muscle layers",
      category_id: "1",
      icon_img: null,
      voucher_purchase_quantity: 0,
      voucher_normal_quantity: 0,
    } as any,
  },
  {
    rank: 3,
    rationale: "Recommended for skin rejuvenation",
    treatment: {
      id: "T003",
      name: "Facial Treatment",
      duration: 45,
      price: 200000,
      description: "Refreshing facial care",
      category_id: "2",
      icon_img: null,
      voucher_purchase_quantity: 0,
      voucher_normal_quantity: 0,
    } as any,
  },
];

describe("RecommendationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3 recommendation items with name, duration, price, and rationale", () => {
    vi.spyOn(useRecommendationsModule, "useRecommendations").mockReturnValue({
      data: mockRecommendations,
      isLoading: false,
      isError: false,
    });

    render(<RecommendationPanel customerId="123" branchId="1" />);

    // All 3 treatment names are visible
    expect(screen.getByText("Swedish Massage")).toBeInTheDocument();
    expect(screen.getByText("Deep Tissue Massage")).toBeInTheDocument();
    expect(screen.getByText("Facial Treatment")).toBeInTheDocument();

    // Duration is shown for each
    expect(screen.getByText("60 min")).toBeInTheDocument();
    expect(screen.getByText("90 min")).toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();

    // Rationale is shown for each
    expect(screen.getByText("Great for relaxation based on your history")).toBeInTheDocument();
    expect(screen.getByText("Popular choice for stress relief")).toBeInTheDocument();
    expect(screen.getByText("Recommended for skin rejuvenation")).toBeInTheDocument();

    // Price is shown (formatted as IDR)
    expect(screen.getByText(/250\.000/)).toBeInTheDocument();
    expect(screen.getByText(/350\.000/)).toBeInTheDocument();
    expect(screen.getByText(/200\.000/)).toBeInTheDocument();
  });

  it("hides the panel entirely when service returns an error", () => {
    vi.spyOn(useRecommendationsModule, "useRecommendations").mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    const { container } = render(<RecommendationPanel customerId="123" branchId="1" />);

    // Panel should not render anything
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("AI Recommendations")).not.toBeInTheDocument();
  });

  it("shows loading skeletons while fetching", () => {
    vi.spyOn(useRecommendationsModule, "useRecommendations").mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });

    render(<RecommendationPanel customerId="123" branchId="1" />);

    // Panel header is visible
    expect(screen.getByText("AI Recommendations")).toBeInTheDocument();
    // No treatment names shown yet
    expect(screen.queryByText("Swedish Massage")).not.toBeInTheDocument();
  });

  it("hides the panel when no customerId is provided", () => {
    vi.spyOn(useRecommendationsModule, "useRecommendations").mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const { container } = render(<RecommendationPanel customerId={null} branchId="1" />);

    expect(container.firstChild).toBeNull();
  });
});
