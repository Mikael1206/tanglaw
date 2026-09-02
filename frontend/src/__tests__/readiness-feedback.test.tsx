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
  Award: () => <span data-testid="icon-award">Award</span>,
  CheckCircle2: () => <span data-testid="icon-check-circle">CheckCircle2</span>,
  AlertTriangle: () => <span data-testid="icon-alert-triangle">AlertTriangle</span>,
  BookMarked: () => <span data-testid="icon-book-marked">BookMarked</span>,
  RotateCcw: () => <span data-testid="icon-rotate-ccw">RotateCcw</span>,
}));

import ReadinessFeedback from "../components/readiness-feedback";

type SubjectType = "Mathematics" | "Science" | "English" | "Filipino" | "Logical Reasoning";

const defaultSubjectScores: Record<SubjectType, { correct: number; total: number; answered: number }> = {
  Mathematics: { correct: 8, total: 10, answered: 10 },
  Science: { correct: 6, total: 10, answered: 10 },
  English: { correct: 9, total: 10, answered: 10 },
  Filipino: { correct: 7, total: 10, answered: 10 },
  "Logical Reasoning": { correct: 5, total: 10, answered: 10 },
};

const defaultReadinessDetails = {
  level: "Moderately Ready",
  color: "#f59e0b",
  icon: <span data-testid="readiness-icon">Icon</span>,
  text: "You have a solid foundation but need to strengthen a few key areas. Focus on the subjects where you scored below 70%.",
};

const defaultStudyRecommendations = [
  "Review logical reasoning patterns and syllogisms",
  "Practice more science problem sets",
  "Focus on Filipino grammar rules",
];

describe("ReadinessFeedback", () => {
  const defaultProps = {
    score: 35,
    total: 50,
    scorePercentage: 70,
    subjectScores: defaultSubjectScores,
    readinessDetails: defaultReadinessDetails,
    studyRecommendations: defaultStudyRecommendations,
    onRestart: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Happy Path Tests ──────────────────────────────────────────────

  it("renders the readiness analysis header", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(screen.getByText("Readiness Check Analysis")).toBeInTheDocument();
  });

  it("displays the cumulative score", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(screen.getByText("35")).toBeInTheDocument();
    expect(screen.getByText("/ 50")).toBeInTheDocument();
  });

  it("displays the score percentage", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(screen.getByText("(70% accuracy)")).toBeInTheDocument();
  });

  it("renders the readiness summary level", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(screen.getByText("Moderately Ready")).toBeInTheDocument();
  });

  it("renders the readiness details text", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(screen.getByText(/solid foundation/)).toBeInTheDocument();
  });

  it("renders all subject breakdowns", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Filipino")).toBeInTheDocument();
    expect(screen.getByText("Logical Reasoning")).toBeInTheDocument();
  });

  it("renders study recommendations", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(screen.getByText(/logical reasoning patterns/)).toBeInTheDocument();
    expect(screen.getByText(/science problem sets/)).toBeInTheDocument();
    expect(screen.getByText(/Filipino grammar rules/)).toBeInTheDocument();
  });

  it("calls onRestart when restart button is clicked", async () => {
    const onRestart = vi.fn();
    const user = userEvent.setup();
    render(<ReadinessFeedback {...defaultProps} onRestart={onRestart} />);

    await user.click(screen.getByText("Start New Assessment Check"));
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("renders the Award icon", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(screen.getByTestId("icon-award")).toBeInTheDocument();
  });

  // ─── Edge Case Tests ───────────────────────────────────────────────

  it("renders with a perfect score", () => {
    render(
      <ReadinessFeedback
        {...defaultProps}
        score={50}
        total={50}
        scorePercentage={100}
        readinessDetails={{
          ...defaultReadinessDetails,
          level: "Fully Ready",
          text: "Excellent performance across all subjects!",
        }}
      />
    );
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("(100% accuracy)")).toBeInTheDocument();
    expect(screen.getByText("Fully Ready")).toBeInTheDocument();
  });

  it("renders with a zero score", () => {
    render(
      <ReadinessFeedback
        {...defaultProps}
        score={0}
        total={50}
        scorePercentage={0}
        readinessDetails={{
          ...defaultReadinessDetails,
          level: "Needs Preparation",
          text: "Significant study is needed across all subjects.",
        }}
      />
    );
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("(0% accuracy)")).toBeInTheDocument();
  });

  it("renders with empty study recommendations", () => {
    render(<ReadinessFeedback {...defaultProps} studyRecommendations={[]} />);
    expect(screen.getByText("Recommended Study Areas:")).toBeInTheDocument();
  });

  it("renders with no study recommendations list items", () => {
    render(<ReadinessFeedback {...defaultProps} studyRecommendations={[]} />);
    // The heading should still be visible, but no list items
    expect(screen.getByText("Recommended Study Areas:")).toBeInTheDocument();
  });

  it("skips subjects with zero total questions", () => {
    const scoresWithEmpty = {
      ...defaultSubjectScores,
      Filipino: { correct: 0, total: 0, answered: 0 },
    };
    render(
      <ReadinessFeedback {...defaultProps} subjectScores={scoresWithEmpty} />
    );
    // Filipino should NOT be rendered since total is 0
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
  });

  // ─── Display State Tests ──────────────────────────────────────────

  it("renders the TANGLAW subtitle banner", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    expect(
      screen.getByText("TANGLAW Scholarship Competency Analyzer")
    ).toBeInTheDocument();
  });

  it("renders restart button with correct text", () => {
    render(<ReadinessFeedback {...defaultProps} />);
    const restartButton = screen.getByText("Start New Assessment Check");
    expect(restartButton).toBeInTheDocument();
  });
});
