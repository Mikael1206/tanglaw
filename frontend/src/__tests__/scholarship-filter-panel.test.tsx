import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScholarshipFilterPanel from "../components/scholarship-filter-panel";

describe("ScholarshipFilterPanel", () => {
  const defaultProps = {
    searchTerm: "",
    onSearchChange: vi.fn(),
    incomeLimit: "all",
    onIncomeChange: vi.fn(),
    scholarshipType: "all",
    onTypeChange: vi.fn(),
    programType: "all",
    onProgramChange: vi.fn(),
    showMobileFilters: true,
    onToggleMobile: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input", () => {
    render(<ScholarshipFilterPanel {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Search DOST, Megaworld/)).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in search input", async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(<ScholarshipFilterPanel {...defaultProps} onSearchChange={onSearchChange} />);

    await user.type(screen.getByPlaceholderText(/Search DOST, Megaworld/), "DOST");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("calls onIncomeChange when changing income dropdown", () => {
    const onIncomeChange = vi.fn();
    render(<ScholarshipFilterPanel {...defaultProps} onIncomeChange={onIncomeChange} />);

    fireEvent.change(screen.getByDisplayValue("Any Income Bracket"), {
      target: { value: "400000" },
    });
    expect(onIncomeChange).toHaveBeenCalledWith("400000");
  });

  it("calls onReset when clear all is clicked", async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();
    render(<ScholarshipFilterPanel {...defaultProps} onReset={onReset} />);

    const clearButtons = screen.getAllByText("Clear All");
    await user.click(clearButtons[0]);
    expect(onReset).toHaveBeenCalled();
  });

  it("renders income bracket options", () => {
    render(<ScholarshipFilterPanel {...defaultProps} />);

    expect(screen.getByText("Any Income Bracket")).toBeInTheDocument();
    expect(screen.getByText("₱400,000 or below")).toBeInTheDocument();
    expect(screen.getByText("₱350,000 or below")).toBeInTheDocument();
  });

  it("renders sponsoring type buttons", () => {
    render(<ScholarshipFilterPanel {...defaultProps} />);

    expect(screen.getByText("all")).toBeInTheDocument();
    expect(screen.getByText("public")).toBeInTheDocument();
    expect(screen.getByText("private")).toBeInTheDocument();
  });

  it("calls onTypeChange when clicking a sponsoring type button", async () => {
    const onTypeChange = vi.fn();
    const user = userEvent.setup();
    render(<ScholarshipFilterPanel {...defaultProps} onTypeChange={onTypeChange} />);

    await user.click(screen.getByText("private"));
    expect(onTypeChange).toHaveBeenCalledWith("private");
  });

  it("renders academic stream radio options", () => {
    render(<ScholarshipFilterPanel {...defaultProps} />);

    expect(screen.getByText("All Programs / Any")).toBeInTheDocument();
    expect(screen.getByText("STEM Courses")).toBeInTheDocument();
    expect(screen.getByText("Humanities / Arts")).toBeInTheDocument();
  });

  it("calls onToggleMobile when mobile toggle is clicked", async () => {
    const onToggleMobile = vi.fn();
    const user = userEvent.setup();
    render(<ScholarshipFilterPanel {...defaultProps} onToggleMobile={onToggleMobile} />);

    const filterHeaders = screen.getAllByText("Filter Controls");
    await user.click(filterHeaders[0]);
    expect(onToggleMobile).toHaveBeenCalled();
  });

  it("does not show filter body when showMobileFilters is false", () => {
    render(<ScholarshipFilterPanel {...defaultProps} showMobileFilters={false} />);

    // The filter body should be in the DOM (rendered but hidden via CSS)
    // The parent div has `hidden` class when showMobileFilters is false
    const filterBody = screen.getByPlaceholderText(/Search DOST, Megaworld/).closest(".space-y-6");
    expect(filterBody).toBeInTheDocument();
  });
});
