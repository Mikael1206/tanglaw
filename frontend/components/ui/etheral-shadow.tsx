'use client';

import React, { useRef, useId, useState, useEffect, CSSProperties, ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface ResponsiveImage { src: string; alt?: string; srcSet?: string; }
interface AnimationConfig { preview?: boolean; scale: number; speed: number; }
interface NoiseConfig { opacity: number; scale: number; }
interface ShadowOverlayProps {
    type?: 'preset' | 'custom';
    presetIndex?: number;
    customImage?: ResponsiveImage;
    sizing?: 'fill' | 'stretch' | 'cover';
    darkColor?: string;
    lightColor?: string;
    animation?: AnimationConfig;
    noise?: NoiseConfig;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
}

function mapRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
    if (fromLow === fromHigh) return toLow;
    return toLow + ((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow);
}

const useInstanceId = (): string => {
    const id = useId();
    return `shadowoverlay-${id.replace(/:/g, "")}`;
};

export function EtheralShadow({
    sizing = 'fill',
    darkColor = 'rgba(30, 58, 95, 0.92)',
    lightColor = 'rgba(200, 230, 175, 0.85)',
    animation,
    noise,
    style,
    className,
    children
}: ShadowOverlayProps) {
    const id = useInstanceId();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const containerRef = useRef<HTMLDivElement>(null);

    // ─── Visibility-based pause and RAF-throttled filter updates ───────────
    const [animationPlayState, setAnimationPlayState] = useState<'running' | 'paused'>('running');
    const hueRef = useRef(0);
    const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setAnimationPlayState(entry.isIntersecting ? 'running' : 'paused');
            },
            { threshold: 0.01 }
        );
        observer.observe(container);

        // Manual RAF loop for hue rotation to avoid browser compositing rate SVG <animate>
        let rafId: number;
        let frameCount = 0;
        const animateHue = () => {
            if (animationPlayState === 'running' && !document.hidden) {
                frameCount++;
                if (frameCount % 3 === 0) { // Update every 3rd frame (~20fps)
                    hueRef.current = (hueRef.current + 1.2) % 360;
                    if (feColorMatrixRef.current) {
                        feColorMatrixRef.current.setAttribute('values', String(hueRef.current));
                    }
                }
            }
            rafId = requestAnimationFrame(animateHue);
        };
        rafId = requestAnimationFrame(animateHue);

        const handleVisibility = () => {
            setAnimationPlayState(document.hidden ? 'paused' : 'running');
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(rafId);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [animationPlayState]);
    
    // Dynamically set the shadow color based on the active theme
    const activeColor = isDark ? darkColor : lightColor;

    const animationEnabled = animation && animation.scale > 0;

    const displacementScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
    const animationDuration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;

    return (
        <div ref={containerRef} className={`fixed inset-0 pointer-events-none ${className || ''}`} style={{ overflow: "hidden", zIndex: 0, willChange: "filter", transform: "translateZ(0)", ...style }}>
            
            
            <div style={{ position: "absolute", inset: -displacementScale, filter: animationEnabled ? `url(#${id}) blur(4px)` : "none" }}>
                {animationEnabled && (
                    <svg style={{ position: "absolute", width: 0, height: 0 }}>
                        <defs>
                            <filter id={id}>
                                <feTurbulence result="undulation" numOctaves="1" baseFrequency={`${mapRange(animation.scale, 0, 100, 0.001, 0.0005)},${mapRange(animation.scale, 0, 100, 0.004, 0.002)}`} seed="0" type="turbulence" />
                                <feColorMatrix 
                                    ref={feColorMatrixRef}
                                    in="undulation" 
                                    type="hueRotate" 
                                    values="0" 
                                />
                                <feColorMatrix in="undulation" result="circulation" type="matrix" values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0" />
                                <feDisplacementMap in="SourceGraphic" in2="circulation" scale={displacementScale} result="dist" />
                                <feDisplacementMap in="dist" in2="undulation" scale={displacementScale} result="output" />
                            </filter>
                        </defs>
                    </svg>
                )}
                <div style={{ 
                    backgroundColor: activeColor, 
                    transition: "background-color 1s ease-in-out, mask-image 1s ease-in-out", 
                    maskImage: `url('/assets/etheral-mask.webp')`, 
                    maskSize: sizing === "stretch" ? "100% 100%" : "cover", 
                    maskRepeat: "no-repeat", maskPosition: "center", width: "100%", height: "100%" 
                }} />
            </div>

            
            {noise && noise.opacity > 0 && (
                <div style={{ 
                    position: "absolute", inset: 0, 
                    backgroundImage: `url('/assets/etheral-noise.webp')`, 
                    backgroundSize: noise.scale * 200, backgroundRepeat: "repeat", 
                    opacity: isDark ? noise.opacity : noise.opacity * 0.3, 
                    transition: "opacity 1s ease-in-out", 
                    pointerEvents: "none", zIndex: 1 
                }} />
            )}

            
            <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%", pointerEvents: children ? "auto" : "none" }}>
                {children}
            </div>

        </div>
    );
}
