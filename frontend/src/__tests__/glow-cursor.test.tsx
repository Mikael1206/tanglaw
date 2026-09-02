import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GlowCursor from "@/components/ui/GlowCursor";
import GlowCursorLayer from "@/components/glow-cursor-layer";

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("pointer: fine") ? true : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

describe("GlowCursor Component", () => {
  it("renders container and canvas with aria-hidden", () => {
    const { container } = render(
      <GlowCursor
        color="#67E8F9"
        secondaryColor="#A78BFA"
        trailLength={40}
        trailWidth={8}
      />
    );

    const cursorContainer = container.querySelector(".glow-cursor");
    expect(cursorContainer).toBeInTheDocument();

    const canvas = container.querySelector("canvas.glow-cursor__canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("renders children content inside .glow-cursor__content", () => {
    render(
      <GlowCursor>
        <div data-testid="test-child">Child Content</div>
      </GlowCursor>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("applies custom className, style, and blendMode", () => {
    const { container } = render(
      <GlowCursor
        className="custom-cursor-class"
        style={{ opacity: 0.8 }}
        blendMode="screen"
      />
    );

    const cursorContainer = container.querySelector(".glow-cursor");
    expect(cursorContainer).toHaveClass("custom-cursor-class");

    const canvas = container.querySelector("canvas.glow-cursor__canvas");
    expect(canvas).toHaveStyle({ mixBlendMode: "screen" });
  });

  it("renders GlowCursorLayer component cleanly on desktop fine pointer", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { container } = render(<GlowCursorLayer />);
    expect(container).toBeDefined();
  });
});
