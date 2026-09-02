import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScholarshipPagination from "../components/scholarship-pagination";

describe("ScholarshipPagination", () => {
  it("renders current page and total pages", () => {
    render(
      <ScholarshipPagination
        currentPage={3}
        totalPages={10}
        onPageChange={() => {}}
      />
    );

    const pageText = screen.getByText(/Page.*of/);
    expect(pageText).toBeInTheDocument();
  });

  it("disables Previous button on first page", () => {
    render(
      <ScholarshipPagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText("Previous")).toBeDisabled();
  });

  it("disables Next button on last page", () => {
    render(
      <ScholarshipPagination
        currentPage={5}
        totalPages={5}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText("Next")).toBeDisabled();
  });

  it("enables both buttons on middle page", () => {
    render(
      <ScholarshipPagination
        currentPage={3}
        totalPages={5}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText("Previous")).not.toBeDisabled();
    expect(screen.getByText("Next")).not.toBeDisabled();
  });
});
