import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CarouselSection from "@/components/carousel-section";

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

describe("Embla Carousel & Card Components", () => {
  it("renders carousel items and cards correctly", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <Card>
              <CardContent>
                <CardTitle>Slide 1</CardTitle>
              </CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card>
              <CardContent>
                <CardTitle>Slide 2</CardTitle>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );

    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeInTheDocument();
  });

  it("renders the 5 pillars of TANGLAW in CarouselSection", () => {
    render(<CarouselSection />);

    expect(screen.getByText(/the five pillars of tanglaw/i)).toBeInTheDocument();
    expect(screen.getByText("Guided Scholarship Matching")).toBeInTheDocument();
    expect(screen.getByText("Adaptive Readiness Check")).toBeInTheDocument();
    expect(screen.getByText("AI Navigation Companion")).toBeInTheDocument();
    expect(screen.getByText("Smart Scholarship Directory")).toBeInTheDocument();
    expect(screen.getByText("Review Engine & Analytics")).toBeInTheDocument();

    // Check slide indicator text
    expect(screen.getByText(/slide \d+ of \d+/i)).toBeInTheDocument();
  });
});
