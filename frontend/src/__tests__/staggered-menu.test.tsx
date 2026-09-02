import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StaggeredMenu, {
  type StaggeredMenuItem,
  type StaggeredMenuSocialItem,
} from "@/components/ui/StaggeredMenu";

// Mock gsap to avoid DOM manipulation issues in jsdom
vi.mock("gsap", () => {
  const dummyTween = {
    kill: vi.fn(),
    play: vi.fn(),
  };
  const dummyTimeline = {
    kill: vi.fn(),
    fromTo: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    eventCallback: vi.fn((event, cb) => {
      if (event === "onComplete") cb?.();
      return dummyTimeline;
    }),
    play: vi.fn(),
  };

  return {
    gsap: {
      set: vi.fn(),
      to: vi.fn(() => dummyTween),
      fromTo: vi.fn(() => dummyTween),
      timeline: vi.fn(() => dummyTimeline),
      context: vi.fn((fn) => {
        fn();
        return { revert: vi.fn() };
      }),
    },
  };
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("StaggeredMenu Component", () => {
  const mockItems: StaggeredMenuItem[] = [
    { label: "Home", link: "/" },
    { label: "About", link: "/about" },
    { label: "Contact", link: "/contact" },
  ];

  const mockSocials: StaggeredMenuSocialItem[] = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the toggle button with accessible aria label", () => {
    render(
      <StaggeredMenu
        items={mockItems}
        socialItems={mockSocials}
        displaySocials={true}
      />
    );

    const toggleButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles open state and fires onMenuOpen callback", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();

    render(
      <StaggeredMenu
        items={mockItems}
        socialItems={mockSocials}
        onMenuOpen={onOpen}
        onMenuClose={onClose}
      />
    );

    const toggleButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });

    fireEvent.click(toggleButton);

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: /close navigation menu/i })
    ).toBeInTheDocument();
  });

  it("renders all menu items with correct links and labels", () => {
    render(
      <StaggeredMenu
        items={mockItems}
        socialItems={mockSocials}
        displaySocials={true}
      />
    );

    mockItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("renders socials when displaySocials is true", () => {
    render(
      <StaggeredMenu
        items={mockItems}
        socialItems={mockSocials}
        displaySocials={true}
      />
    );

    expect(screen.getByText("Socials")).toBeInTheDocument();
    expect(screen.getByText("Twitter")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("hides socials when displaySocials is false", () => {
    render(
      <StaggeredMenu
        items={mockItems}
        socialItems={mockSocials}
        displaySocials={false}
      />
    );

    expect(screen.queryByText("Socials")).not.toBeInTheDocument();
  });

  it("closes the menu when clicking a menu item", () => {
    const onClose = vi.fn();
    const itemClick = vi.fn();
    const itemsWithClick = [
      { label: "Home", link: "/", onClick: itemClick },
      { label: "About", link: "/about" },
    ];

    render(
      <StaggeredMenu
        items={itemsWithClick}
        onMenuClose={onClose}
      />
    );

    const toggleButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(toggleButton);

    const homeLink = screen.getByText("Home");
    fireEvent.click(homeLink);

    expect(itemClick).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("renders in fixed embedded mode with portal when showLogo is false and isFixed is true", () => {
    render(
      <StaggeredMenu
        items={mockItems}
        socialItems={mockSocials}
        isFixed={true}
        showLogo={false}
      />
    );

    const toggleButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
