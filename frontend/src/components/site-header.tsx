"use client";

/**
 * Global site header shown on public pages.
 * Pill-shaped glassmorphism navbar inspired by Landas.
 * Hides itself when the user is inside dashboard routes.
 */
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeChanger from "@/components/theme-changer";
import StaggeredMenu, {
  type StaggeredMenuItem,
  type StaggeredMenuSocialItem,
} from "@/components/ui/StaggeredMenu";
import GooeyNav, { type GooeyNavItem } from "@/components/ui/GooeyNav";
import { getAuthToken } from "@/lib/auth-storage";

function subscribeAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tanglaw-auth-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tanglaw-auth-change", callback);
  };
}

function getAuthSnapshot() {
  return !!getAuthToken();
}

function getAuthServerSnapshot() {
  return false;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isHome = pathname === "/";
  const isAuthenticated = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledAway, setScrolledAway] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setScrolledAway(false);
    setMenuOpen(false);
    setAtTop(true);
  }

  useEffect(() => {
    lastScrollY.current = 0;
  }, [pathname]);

  // Visibility: show at top or on hover; other pages also visible unless scrolled away
  const isVisible = menuOpen || hovered || atTop || (!isHome && !scrolledAway);

  const menuItems: StaggeredMenuItem[] = [
    { label: "Home", ariaLabel: "Go to home page", link: "/" },
    { label: "About", ariaLabel: "Learn about TANGLAW", link: "/about" },
    { label: "Contact", ariaLabel: "Contact us", link: "/contact" },
    ...(isAuthenticated
      ? [{ label: "Dashboard", ariaLabel: "Go to dashboard", link: "/dashboard" }]
      : [
          { label: "Log In", ariaLabel: "Log in to TANGLAW", link: "/login" },
          { label: "Sign Up", ariaLabel: "Create an account", link: "/signup" },
        ]),
  ];

  const desktopNavItems: GooeyNavItem[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    ...(isAuthenticated
      ? [{ label: "Dashboard", href: "/dashboard" }]
      : [{ label: "Log In", href: "/login" }]),
  ];

  const socialItems: StaggeredMenuSocialItem[] = [
    { label: "PUP Manila", link: "https://pup.edu.ph" },
    { label: "About Us", link: "/about" },
  ];

  useEffect(() => {
    if (isDashboard) return;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setAtTop(currentY < 30);
      if (currentY > 60 && currentY > lastScrollY.current) {
        setScrolledAway(true);
      } else if (currentY < lastScrollY.current) {
        if (currentY < 30) setScrolledAway(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  if (isDashboard) {
    return null;
  }

  return (
    <>
      {/* Invisible trigger zone at top — reveals navbar on hover when hidden */}
      {!isVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] h-20"
          onMouseEnter={() => setHovered(true)}
          aria-hidden="true"
        />
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-start justify-center px-4 pt-4 sm:px-6 sm:pt-5 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Desktop layout: logo inside pill nav */}
        <div className="hidden md:flex w-full max-w-4xl items-center justify-center">
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-[color:var(--theme-surface)]/60 px-3 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-700 sm:gap-2 sm:px-5">
            <Link href="/" className="flex items-center gap-2 mr-1" aria-label="Go to home">
              <div className="h-8 w-8 rounded-full border border-white/10 bg-[color:var(--theme-surface)] shadow-lg shadow-black/20 flex items-center justify-center">
                <Image
                  src="/assets/owel-head.webp"
                  alt="Owel Logo"
                  width={26}
                  height={26}
                  className="object-cover"
                />
              </div>
              <span className="font-display text-lg font-black tracking-[0.12em] text-[color:var(--theme-typography-main)]">
                TANGLAW
              </span>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
                Beta
              </span>
            </Link>

            <div className="mx-1 h-4 w-px bg-white/10 sm:mx-2" />

            <GooeyNav
              items={desktopNavItems}
              activeHref={pathname}
              particleCount={15}
              particleDistances={[90, 10]}
              particleR={100}
              animationTime={600}
              timeVariance={300}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            />

            {!isAuthenticated && (
              <Link
                href="/signup"
                className="rounded-full bg-primary/90 px-4 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-white shadow-[0_0_16px_rgba(27,64,121,0.2)] transition-all duration-500 hover:bg-primary hover:shadow-[0_0_20px_rgba(27,64,121,0.3)] ml-1"
              >
                Sign Up
              </Link>
            )}

            <div className="mx-1 h-4 w-px bg-white/10 sm:mx-2" />

            <ThemeChanger />
          </nav>
        </div>

        {/* Mobile layout: logo left, StaggeredMenu right */}
        <div className="md:hidden flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2" aria-label="Go to home">
            <div className="h-9 w-9 rounded-full border border-white/10 bg-[color:var(--theme-surface)] shadow-lg shadow-black/20 flex items-center justify-center">
              <Image
                src="/assets/owel-head.webp"
                alt="Owel Logo"
                width={30}
                height={30}
                className="object-cover"
              />
            </div>
            <span className="font-display text-xl font-black tracking-[0.12em] text-[color:var(--theme-typography-main)]">
              TANGLAW
            </span>
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
              Beta
            </span>
          </Link>

          <div className="flex items-center gap-2 relative z-50">
            <ThemeChanger />

            <StaggeredMenu
              position="right"
              items={menuItems}
              socialItems={socialItems}
              displaySocials={true}
              displayItemNumbering={true}
              colors={["#B8C9E8", "#7F9C96", "#1B4079"]}
              accentColor="var(--theme-primary, #1B4079)"
              menuButtonColor="var(--theme-typography-main, #1B4079)"
              openMenuButtonColor="var(--theme-typography-main, #1B4079)"
              isFixed={true}
              showLogo={false}
              onMenuOpen={() => setMenuOpen(true)}
              onMenuClose={() => setMenuOpen(false)}
            />
          </div>
        </div>
      </header>
    </>
  );
}
