import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScholarshipCard from "../components/scholarship-card";
import type { ScholarshipOpportunity } from "@/data/scholarships-data";

const mockScholarship: ScholarshipOpportunity = {
  name: "DOST-SEI Undergraduate Scholarship",
  provider: "Department of Science and Technology",
  coverageType: "Full Coverage",
  classification: "National Government",
  strand: "STEM",
  overview: "The DOST-SEI Undergraduate Scholarship is a national government scholarship program.",
  coverageDetails: "Full Tuition & school fees coverage up to ₱40,000/yr",
  eligibility: {
    nationality: "Natural-born Filipino citizen",
    minimumGPA: "GWA of 85% or higher",
  },
  priorityPrograms: ["BS Computer Science", "BS Information Technology", "BS Engineering"],
  requirements: ["Natural-born Filipino citizen", "GWA of 85% or higher", "Must pass the DOST-SEI exam"],
  examInformation: { type: "Examination" },
  deadline: "Subject to the annual DOST-SEI application cycle",
  links: ["https://www.sei.dost.gov.ph"],
};

describe("ScholarshipCard", () => {
  it("renders scholarship name and provider", () => {
    render(
      <ScholarshipCard
        scholarship={mockScholarship}
        isExpanded={false}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText("DOST-SEI Undergraduate Scholarship")).toBeInTheDocument();
    expect(screen.getByText(/Department of Science and Technology/)).toBeInTheDocument();
  });

  it("shows overview text", () => {
    render(
      <ScholarshipCard
        scholarship={mockScholarship}
        isExpanded={false}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText(/The DOST-SEI Undergraduate Scholarship is a national government scholarship program/)).toBeInTheDocument();
  });

  it("does not show expanded details when collapsed", () => {
    render(
      <ScholarshipCard
        scholarship={mockScholarship}
        isExpanded={false}
        onToggle={() => {}}
      />
    );

    expect(screen.queryByText("Benefits & Coverage")).not.toBeInTheDocument();
    expect(screen.getByText("View Full Details")).toBeInTheDocument();
  });

  it("shows expanded details when isExpanded is true", () => {
    render(
      <ScholarshipCard
        scholarship={mockScholarship}
        isExpanded={true}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText("Benefits & Coverage")).toBeInTheDocument();
    expect(screen.getByText("Eligibility Criteria")).toBeInTheDocument();
    expect(screen.getByText("Hide Details")).toBeInTheDocument();
  });

  it("calls onToggle when toggle button is clicked", async () => {
    const handleToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <ScholarshipCard
        scholarship={mockScholarship}
        isExpanded={false}
        onToggle={handleToggle}
      />
    );

    await user.click(screen.getByText("View Full Details"));
    expect(handleToggle).toHaveBeenCalledWith("DOST-SEI Undergraduate Scholarship");
  });

  it("shows eligibility details in expanded view", () => {
    render(
      <ScholarshipCard
        scholarship={mockScholarship}
        isExpanded={true}
        onToggle={() => {}}
      />
    );

    const elements = screen.getAllByText(/Natural-born Filipino citizen/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
    const gpaElements = screen.getAllByText(/GWA of 85% or higher/);
    expect(gpaElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders priority programs as badges", () => {
    render(
      <ScholarshipCard
        scholarship={mockScholarship}
        isExpanded={true}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText("BS Computer Science")).toBeInTheDocument();
    expect(screen.getByText("BS Information Technology")).toBeInTheDocument();
    expect(screen.getByText("BS Engineering")).toBeInTheDocument();
  });

  it("renders classification tag correctly for government scholarship", () => {
    render(
      <ScholarshipCard
        scholarship={mockScholarship}
        isExpanded={false}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText("National Government")).toBeInTheDocument();
  });
});
