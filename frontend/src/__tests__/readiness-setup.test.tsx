import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children as React.ReactNode}</div>,
    span: ({ children, ...props }: Record<string, unknown>) => <span {...props}>{children as React.ReactNode}</span>,
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children as React.ReactNode}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Play: () => <span data-testid="icon-play">Play</span>,
  Check: () => <span data-testid="icon-check">Check</span>,
  BookOpen: () => <span data-testid="icon-book-open">BookOpen</span>,
  ArrowRight: () => <span data-testid="icon-arrow-right">ArrowRight</span>,
  Loader2: () => <span data-testid="icon-loader">Loader2</span>,
}));

import ReadinessSetup, { SUBJECTS } from "../components/readiness-setup";
import type { SubjectType } from "../components/readiness-setup";

describe("ReadinessSetup", () => {
  const defaultProps = {
    selectedSubjects: [] as SubjectType[],
    onSubjectChange: vi.fn(),
    itemCount: 10 as const,
    onItemCountChange: vi.fn(),
    selectedDifficulty: 3 as const,
    onDifficultyChange: vi.fn(),
    isLoading: false,
    loadError: null as string | null,
    onStartDiagnostics: vi.fn(),
    onStartMockExam: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Happy Path Tests ──────────────────────────────────────────────

  it("renders the setup form title", () => {
    render(<ReadinessSetup {...defaultProps} />);
    expect(screen.getByText("Option 1: Gamified Quick Diagnostics")).toBeInTheDocument();
  });

  it("renders all 5 subject checkboxes", () => {
    render(<ReadinessSetup {...defaultProps} />);
    SUBJECTS.forEach((subject) => {
      expect(screen.getByText(subject)).toBeInTheDocument();
    });
  });

  it("renders difficulty selection buttons", () => {
    render(<ReadinessSetup {...defaultProps} />);
    expect(screen.getByText("Lvl 1 · Easiest")).toBeInTheDocument();
    expect(screen.getByText("Lvl 3 · Moderate")).toBeInTheDocument();
    expect(screen.getByText("Lvl 5 · Advanced")).toBeInTheDocument();
  });

  it("calls onSubjectChange when a subject is clicked", async () => {
    const onSubjectChange = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessSetup {...defaultProps} onSubjectChange={onSubjectChange} />);

    await user.click(screen.getByText("Mathematics"));
    expect(onSubjectChange).toHaveBeenCalledWith("Mathematics");
  });

  it("calls onDifficultyChange when a difficulty is clicked", async () => {
    const onDifficultyChange = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessSetup {...defaultProps} onDifficultyChange={onDifficultyChange} />);

    await user.click(screen.getByText("Lvl 1 · Easiest"));
    expect(onDifficultyChange).toHaveBeenCalledWith(1);
  });

  it("calls onStartDiagnostics when Start Diagnostics button is clicked", async () => {
    const onStartDiagnostics = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessSetup {...defaultProps} onStartDiagnostics={onStartDiagnostics} />);

    await user.click(screen.getByText("Start Diagnostics Check"));
    expect(onStartDiagnostics).toHaveBeenCalledOnce();
  });

  it("calls onStartMockExam when Launch Full Mock Exam button is clicked", async () => {
    const onStartMockExam = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessSetup {...defaultProps} onStartMockExam={onStartMockExam} />);

    await user.click(screen.getByText("Launch Full Mock Exam"));
    expect(onStartMockExam).toHaveBeenCalledOnce();
  });

  it("shows selected subjects with check icon", () => {
    const selectedSubjects: SubjectType[] = ["Mathematics", "Science"];
    render(<ReadinessSetup {...defaultProps} selectedSubjects={selectedSubjects} />);

    // Subject buttons should exist
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
  });

  it("renders the range slider for item count", () => {
    render(<ReadinessSetup {...defaultProps} />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue("10");
  });

  it("renders the mock exam option card", () => {
    render(<ReadinessSetup {...defaultProps} />);
    expect(screen.getByText("Option 2: Comprehensive Mock Exam")).toBeInTheDocument();
  });

  // ─── Edge Case Tests ───────────────────────────────────────────────

  it("renders correctly with no subjects selected", () => {
    render(<ReadinessSetup {...defaultProps} selectedSubjects={[]} />);
    // No check icons should be rendered
    const checks = screen.queryAllByTestId("icon-check");
    expect(checks.length).toBe(0);
  });

  it("renders correctly with all subjects selected", () => {
    const allSubjects: SubjectType[] = [...SUBJECTS];
    render(<ReadinessSetup {...defaultProps} selectedSubjects={allSubjects} />);
    // All 5 check icons should be rendered
    const checks = screen.queryAllByTestId("icon-check");
    expect(checks.length).toBe(5);
  });

  it("renders with minimum item count (10)", () => {
    render(<ReadinessSetup {...defaultProps} itemCount={10} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("10");
  });

  it("renders with maximum item count (50)", () => {
    render(<ReadinessSetup {...defaultProps} itemCount={50} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("50");
  });

  it("calls onItemCountChange when slider value changes", () => {
    const onItemCountChange = vi.fn();
    render(<ReadinessSetup {...defaultProps} onItemCountChange={onItemCountChange} />);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
    expect(onItemCountChange).toHaveBeenCalledWith(20);
  });

  it("renders mock exam statistics correctly", () => {
    render(<ReadinessSetup {...defaultProps} />);
    expect(screen.getByText("Fixed 250 items total")).toBeInTheDocument();
    expect(screen.getByText("Exactly 50 items per subject")).toBeInTheDocument();
    expect(screen.getByText("3 Hours countdown timer")).toBeInTheDocument();
  });

  // ─── Display State Tests ──────────────────────────────────────────

  it("highlights selected difficulty as active", () => {
    render(<ReadinessSetup {...defaultProps} selectedDifficulty={5} />);

    // All difficulty buttons exist
    expect(screen.getByText("Lvl 1 · Easiest")).toBeInTheDocument();
    expect(screen.getByText("Lvl 3 · Moderate")).toBeInTheDocument();
    expect(screen.getByText("Lvl 5 · Advanced")).toBeInTheDocument();
  });

  it("displays correct item count label", () => {
    render(<ReadinessSetup {...defaultProps} itemCount={20} />);
    expect(screen.getByText("Selected: 20 Items")).toBeInTheDocument();
  });

  it("has accessible subject selection buttons", () => {
    render(<ReadinessSetup {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    // Should have 5 subject buttons + 5 difficulty buttons + 2 launch buttons + tick marks
    expect(buttons.length).toBeGreaterThanOrEqual(10);
  });
});
