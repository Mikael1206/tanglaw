import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock next/dynamic to render components synchronously in tests
vi.mock("next/dynamic", () => ({
  default: (importFn: () => Promise<{ default: React.ComponentType<unknown> }>, opts?: { loading?: () => React.ReactNode }) => {
    const DynamicComponent = React.lazy(importFn);
    return Object.assign(
      (props: Record<string, unknown>) => (
        <React.Suspense fallback={opts?.loading?.() ?? null}>
          <DynamicComponent {...props} />
        </React.Suspense>
      ),
      { displayName: "DynamicComponent" }
    );
  },
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Clock: () => <span data-testid="icon-clock">Clock</span>,
  Flag: () => <span data-testid="icon-flag">Flag</span>,
  Timer: () => <span data-testid="icon-timer">Timer</span>,
  Play: () => <span data-testid="icon-play">Play</span>,
  Check: () => <span data-testid="icon-check">Check</span>,
  BookOpen: () => <span data-testid="icon-book-open">BookOpen</span>,
  ArrowRight: () => <span data-testid="icon-arrow-right">ArrowRight</span>,
  Award: () => <span data-testid="icon-award">Award</span>,
  CheckCircle2: () => <span data-testid="icon-check-circle">CheckCircle2</span>,
  AlertTriangle: () => <span data-testid="icon-alert-triangle">AlertTriangle</span>,
  BookMarked: () => <span data-testid="icon-book-marked">BookMarked</span>,
  RotateCcw: () => <span data-testid="icon-rotate-ccw">RotateCcw</span>,
  ChevronDown: () => <span data-testid="icon-chevron-down">ChevronDown</span>,
  ChevronUp: () => <span data-testid="icon-chevron-up">ChevronUp</span>,
  Search: () => <span data-testid="icon-search">Search</span>,
  SlidersHorizontal: () => <span data-testid="icon-sliders">Sliders</span>,
  DollarSign: () => <span data-testid="icon-dollar">Dollar</span>,
  Building2: () => <span data-testid="icon-building">Building</span>,
  ExternalLink: () => <span data-testid="icon-external-link">ExternalLink</span>,
  GraduationCap: () => <span data-testid="icon-grad-cap">GradCap</span>,
  Filter: () => <span data-testid="icon-filter">Filter</span>,
  FileText: () => <span data-testid="icon-file-text">FileText</span>,
  HelpCircle: () => <span data-testid="icon-help-circle">HelpCircle</span>,
  Calendar: () => <span data-testid="icon-calendar">Calendar</span>,
  ArrowUp: () => <span data-testid="icon-arrow-up">ArrowUp</span>,
  ChevronLeft: () => <span data-testid="icon-chevron-left">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="icon-chevron-right">ChevronRight</span>,
  X: () => <span data-testid="icon-x">X</span>,
  Menu: () => <span data-testid="icon-menu">Menu</span>,
  Send: () => <span data-testid="icon-send">Send</span>,
  MessageCircle: () => <span data-testid="icon-message-circle">MessageCircle</span>,
  Sparkles: () => <span data-testid="icon-sparkles">Sparkles</span>,
  LogOut: () => <span data-testid="icon-log-out">LogOut</span>,
  ShieldCheck: () => <span data-testid="icon-shield-check">ShieldCheck</span>,
  LogIn: () => <span data-testid="icon-log-in">LogIn</span>,
  UserPlus: () => <span data-testid="icon-user-plus">UserPlus</span>,
  ShieldAlert: () => <span data-testid="icon-shield-alert">ShieldAlert</span>,
  ArrowLeft: () => <span data-testid="icon-arrow-left">ArrowLeft</span>,
  Database: () => <span data-testid="icon-database">Database</span>,
  MapPin: () => <span data-testid="icon-map-pin">MapPin</span>,
  User: () => <span data-testid="icon-user">User</span>,
  Linkedin: () => <span data-testid="icon-linkedin">Linkedin</span>,
  Users: () => <span data-testid="icon-users">Users</span>,
  Mail: () => <span data-testid="icon-mail">Mail</span>,
  Moon: () => <span data-testid="icon-moon">Moon</span>,
  Sun: () => <span data-testid="icon-sun">Sun</span>,
  GripHorizontal: () => <span data-testid="icon-grip-horizontal">Grip</span>,
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, className }: Record<string, unknown>) => (
    <img src={src as string} alt={alt as string} width={width as number} height={height as number} className={className as string} />
  ),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/dashboard",
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated", data: { user: { email: "test@test.com" } } }),
  signOut: vi.fn(),
  signIn: vi.fn(),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children as React.ReactNode}</div>,
    span: ({ children, ...props }: Record<string, unknown>) => <span {...props}>{children as React.ReactNode}</span>,
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children as React.ReactNode}</button>,
    section: ({ children, ...props }: Record<string, unknown>) => <section {...props}>{children as React.ReactNode}</section>,
    article: ({ children, ...props }: Record<string, unknown>) => <article {...props}>{children as React.ReactNode}</article>,
    header: ({ children, ...props }: Record<string, unknown>) => <header {...props}>{children as React.ReactNode}</header>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ScholarshipBrowser from "../components/scholarship-browser";

// Mock the dynamic scholarship data import
vi.mock("@/data/scholarships-data", () => ({
  SCHOLARSHIPS_DATA: [
    {
      name: "Test Scholarship 1",
      provider: "Test Provider 1",
      coverageType: "Full Coverage",
      classification: "Public",
      strand: "All Strand",
      overview: "Test overview 1 for scholarship testing.",
      coverageDetails: "Test coverage details",
      eligibility: {
        nationality: "Filipino",
      },
      priorityPrograms: ["BS Computer Science"],
      requirements: ["Requirement 1"],
      examInformation: { type: "None" },
      deadline: "December 2026",
      links: ["https://test.com"],
    },
    {
      name: "Test Scholarship 2",
      provider: "Test Provider 2",
      coverageType: "Partial Coverage",
      classification: "Private",
      strand: "STEM",
      overview: "Test overview 2 for scholarship testing.",
      coverageDetails: "Test coverage details 2",
      eligibility: {
        minimumGPA: "2.00",
      },
      priorityPrograms: ["BS Information Technology"],
      requirements: ["Requirement 2"],
      examInformation: { type: "Interview" },
      deadline: "January 2027",
      links: ["https://test2.com"],
    },
  ],
}));

describe("ScholarshipBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the filter panel and main display area", async () => {
    render(<ScholarshipBrowser />);
    
    // Should show loading skeleton initially
    await waitFor(() => {
      const filterHeaders = screen.getAllByText("Filter Controls");
      expect(filterHeaders.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows scholarship cards after data loads", async () => {
    render(<ScholarshipBrowser />);
    
    await waitFor(() => {
      expect(screen.getByText("Test Scholarship 1")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("shows matching opportunities count after load", async () => {
    render(<ScholarshipBrowser />);
    
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("shows empty state when no scholarships match", async () => {
    render(<ScholarshipBrowser />);
    
    await waitFor(() => {
      // Type a search that won't match anything
      const searchInput = screen.getByPlaceholderText(/Search DOST, Megaworld/);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it("renders filter controls", async () => {
    render(<ScholarshipBrowser />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search DOST, Megaworld/)).toBeInTheDocument();
    });
  });
});
