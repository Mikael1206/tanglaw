"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const NatureCanvas = dynamic(() => import("@/components/nature-canvas"), { ssr: false });
const MobileParticles = dynamic(() => import("@/components/mobile-particles"), { ssr: false });

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export function DynamicNatureCanvas() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return isMobile ? <MobileParticles /> : <NatureCanvas />;
}
