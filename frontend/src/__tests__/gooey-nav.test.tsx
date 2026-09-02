import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GooeyNav, { type GooeyNavItem } from "@/components/ui/GooeyNav";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

describe("GooeyNav Component", () => {
  const sampleItems: GooeyNavItem[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  it("renders all navigation items", () => {
    render(<GooeyNav items={sampleItems} />);

    expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
    expect(screen.getByRole("link", { name: "About" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Contact" })).toBeDefined();
  });

  it("marks initial active index as active", () => {
    const { container } = render(<GooeyNav items={sampleItems} initialActiveIndex={1} />);

    const listItems = container.querySelectorAll("li");
    expect(listItems[1].classList.contains("active")).toBe(true);
    expect(listItems[0].classList.contains("active")).toBe(false);
  });

  it("updates active item and triggers onItemClick on item click", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <GooeyNav items={sampleItems} initialActiveIndex={0} onItemClick={onItemClick} />
    );

    const aboutLink = screen.getByRole("link", { name: "About" });
    fireEvent.click(aboutLink);

    const listItems = container.querySelectorAll("li");
    expect(listItems[1].classList.contains("active")).toBe(true);
    expect(listItems[0].classList.contains("active")).toBe(false);
    expect(onItemClick).toHaveBeenCalledWith(sampleItems[1], 1, expect.any(Object));
  });

  it("handles keyboard navigation via Enter key", () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <GooeyNav items={sampleItems} initialActiveIndex={0} onItemClick={onItemClick} />
    );

    const contactLink = screen.getByRole("link", { name: "Contact" });
    fireEvent.keyDown(contactLink, { key: "Enter" });

    const listItems = container.querySelectorAll("li");
    expect(listItems[2].classList.contains("active")).toBe(true);
    expect(onItemClick).toHaveBeenCalledWith(sampleItems[2], 2, expect.any(Object));
  });

  it("syncs active item with activeHref prop", () => {
    const { container, rerender } = render(
      <GooeyNav items={sampleItems} activeHref="/" />
    );

    let listItems = container.querySelectorAll("li");
    expect(listItems[0].classList.contains("active")).toBe(true);

    rerender(<GooeyNav items={sampleItems} activeHref="/contact" />);

    listItems = container.querySelectorAll("li");
    expect(listItems[2].classList.contains("active")).toBe(true);
  });

  it("renders SVG filter in the document for gooey effect", () => {
    const { container } = render(<GooeyNav items={sampleItems} />);

    const svgFilter = container.querySelector("#gooey-nav-filter");
    expect(svgFilter).not.toBeNull();
  });

  it("renders external links with target=_blank and rel attributes", () => {
    const itemsWithExternal: GooeyNavItem[] = [
      { label: "Internal", href: "/internal" },
      { label: "PUP", href: "https://pup.edu.ph" },
    ];

    render(<GooeyNav items={itemsWithExternal} />);

    const externalLink = screen.getByRole("link", { name: "PUP" });
    expect(externalLink.getAttribute("target")).toBe("_blank");
    expect(externalLink.getAttribute("rel")).toContain("noopener");
  });
});
