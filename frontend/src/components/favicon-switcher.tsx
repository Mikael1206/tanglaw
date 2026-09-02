"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const LIGHT_ICON = "/assets/owel-head.svg";
const DARK_ICON = "/assets/owel-head-dark.svg";

export default function FaviconSwitcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const activeTheme = resolvedTheme || "light";
    const iconHref = activeTheme === "dark" ? DARK_ICON : LIGHT_ICON;

    // Update the primary SVG favicon link
    const link = document.querySelector('link[rel="icon"][type="image/svg+xml"]') as HTMLLinkElement | null;
    if (link && link.href) {
      // Only update if the href actually changed to avoid unnecessary DOM writes
      const current = new URL(link.href, window.location.href).pathname;
      if (current !== iconHref) {
        link.href = iconHref;
      }
    }
  }, [resolvedTheme]);

  return null;
}
