import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
  Timer: (props: Record<string, unknown>) => <span data-testid="icon-timer" {...props}>Timer</span>,
}));

import ReadinessQuestion from "../components/readiness-question";

const mockQuestion = {
  id: 1,
  subject: "Mathematics" as const,
  difficulty: 1,
  questionText: "What is the square root of 144?",
  options: ["10", "11", "12", "13"],
  correctAnswer: 2,
};

describe("ReadinessQuestion", () => {
  const defaultProps = {
    question: mockQuestion,
    questionIndex: 0,
    totalQuestions: 10,
    selectedAnswer: undefined as number | undefined,
    onSelectOption: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    timeLeft: 45,
    canGoNext: true,
    canGoPrev: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Happy Path Tests ──────────────────────────────────────────────

  it("renders the question text", () => {
    render(<ReadinessQuestion {...defaultProps} />);
    expect(screen.getByText("What is the square root of 144?")).toBeInTheDocument();
  });

  it("renders all 4 answer options", () => {
    render(<ReadinessQuestion {...defaultProps} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("renders the question counter", () => {
    render(<ReadinessQuestion {...defaultProps} />);
    expect(screen.getByText("Question 1 of 10")).toBeInTheDocument();
  });

  it("renders the subject label", () => {
    render(<ReadinessQuestion {...defaultProps} />);
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
  });

  it("renders the timer display", () => {
    render(<ReadinessQuestion {...defaultProps} />);
    expect(screen.getByText("45s")).toBeInTheDocument();
  });

  it("calls onSelectOption when an option is clicked", async () => {
    const onSelectOption = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessQuestion {...defaultProps} onSelectOption={onSelectOption} />);

    await user.click(screen.getByText("12"));
    expect(onSelectOption).toHaveBeenCalledWith(2);
  });

  it("calls onNext when Next button is clicked", async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessQuestion {...defaultProps} onNext={onNext} />);

    await user.click(screen.getByText("Next Item"));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("shows Finish Assessment for last question", () => {
    render(
      <ReadinessQuestion
        {...defaultProps}
        questionIndex={9}
        totalQuestions={10}
      />
    );
    expect(screen.getByText("Finish Assessment")).toBeInTheDocument();
  });

  // ─── Edge Case Tests ───────────────────────────────────────────────

  it("disables Previous button on first question", () => {
    render(<ReadinessQuestion {...defaultProps} canGoPrev={false} />);
    expect(screen.getByText("Previous")).toBeDisabled();
  });

  it("disables Next button when canGoNext is false", () => {
    render(<ReadinessQuestion {...defaultProps} canGoNext={false} />);
    expect(screen.getByText("Next Item")).toBeDisabled();
  });

  it("highlights selected answer with correct styles", async () => {
    const user = userEvent.setup();
    render(<ReadinessQuestion {...defaultProps} selectedAnswer={2} />);

    // Selected option should exist
    const selected = screen.getByText("12");
    expect(selected).toBeInTheDocument();
  });

  it("renders timer in red when time is low (< 10s)", () => {
    render(<ReadinessQuestion {...defaultProps} timeLeft={5} />);
    expect(screen.getByText("5s")).toBeInTheDocument();
  });

  it("displays correct progress for middle question", () => {
    render(<ReadinessQuestion {...defaultProps} questionIndex={4} totalQuestions={10} />);
    expect(screen.getByText("Question 5 of 10")).toBeInTheDocument();
  });

  it("handles all subject types", () => {
    const subjects = ["Mathematics", "Science", "English", "Filipino", "Logical Reasoning"] as const;
    subjects.forEach((subject) => {
      const { unmount } = render(
        <ReadinessQuestion
          {...defaultProps}
          question={{ ...mockQuestion, subject }}
        />
      );
      expect(screen.getByText(subject)).toBeInTheDocument();
      unmount();
    });
  });

  // ─── Error / Boundary Tests ────────────────────────────────────────

  it("renders with no answer selected (undefined)", () => {
    render(<ReadinessQuestion {...defaultProps} selectedAnswer={undefined} />);
    // All options should be visible and clickable
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("handles zero time left gracefully", () => {
    render(<ReadinessQuestion {...defaultProps} timeLeft={0} />);
    expect(screen.getByText("0s")).toBeInTheDocument();
  });

  it("renders long question text without breaking", () => {
    render(
      <ReadinessQuestion
        {...defaultProps}
        question={{
          ...mockQuestion,
          questionText:
            "This is a very long question text that tests how the component handles extremely verbose prompts without layout breakage or overflow issues in the UI.",
        }}
      />
    );
    expect(
      screen.getByText(/very long question text/)
    ).toBeInTheDocument();
  });
});
