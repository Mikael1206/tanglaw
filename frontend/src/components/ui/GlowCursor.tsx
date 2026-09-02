"use client";

import React, { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./GlowCursor.css";

const MAX_POINTS = 64;

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

#define MAX_POINTS 64

uniform vec2 uResolution;
uniform vec2 uPoints[MAX_POINTS];
uniform float uPointCount;
uniform vec3 uColor;
uniform vec3 uSecondaryColor;
uniform float uTrailWidth;
uniform float uTaper;
uniform float uGlowIntensity;
uniform float uGlowSpread;
uniform float uHotspot;
uniform float uBrightness;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uNoiseStrength;
uniform float uNormalBlend;
uniform float uTime;
uniform float uFade;

varying vec2 vUv;

float sRGB(float x) {
  if (x <= 0.00031308) return 12.92 * x;
  return 1.055 * pow(x, 1.0 / 2.4) - 0.055;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float filmGrain(vec2 p, float time) {
  float frame = time * 18.0;
  float frameIndex = mod(floor(frame), 256.0);
  float nextFrameIndex = mod(frameIndex + 1.0, 256.0);
  float blend = fract(frame);
  blend = blend * blend * (3.0 - 2.0 * blend);
  vec2 pixel = floor(p);
  float current = hash(pixel + vec2(frameIndex * 17.0, frameIndex * 31.0));
  float next = hash(pixel + vec2(nextFrameIndex * 17.0, nextFrameIndex * 31.0));
  return mix(current, next, blend) * 2.0 - 1.0;
}

void main() {
  vec2 pixel = vUv * uResolution;
  float denominator = max(uPointCount - 1.0, 1.0);
  float strongest = 0.0;
  float strongestCore = 0.0;
  float colorWeight = 0.0;
  vec3 colorSum = vec3(0.0);

  for (int i = 0; i < MAX_POINTS - 1; i++) {
    float index = float(i);
    float active = 1.0 - step(uPointCount - 1.0, index);
    vec2 start = uPoints[i];
    vec2 end = uPoints[i + 1];
    vec2 toPixel = pixel - start;
    vec2 segment = end - start;
    float along = clamp(dot(toPixel, segment) / max(dot(segment, segment), 0.0001), 0.0, 1.0);
    float progress = clamp((index + along) / denominator, 0.0, 1.0);
    float life = pow(max(1.0 - progress, 0.0), mix(0.55, 1.25, uTaper));
    float width = uTrailWidth * mix(1.0, 0.25, pow(progress, mix(0.55, 1.6, uTaper)));
    float distanceToTrail = length(toPixel - segment * along);
    float falloff = max(width * (0.8 + uGlowSpread * 1.4), 0.5);
    float beam = min(1.0, (falloff * falloff) / (distanceToTrail * distanceToTrail + falloff * falloff));
    float core = exp(-pow(distanceToTrail / max(width, 0.5), 2.0) * 2.5);
    float pulseAmount = min(abs(uPulseSpeed), 1.0);
    float pulse = 1.0 + sin(uTime * uPulseSpeed * 3.0 - progress * 11.0) * 0.16 * pulseAmount;
    float intensity = (core + beam * uGlowIntensity * 0.55) * life * pulse * active;
    vec3 segmentColor = mix(uColor, uSecondaryColor, progress);

    strongest = max(strongest, intensity);
    strongestCore = max(strongestCore, core * life * active);
    colorSum += segmentColor * intensity;
    colorWeight += intensity;
  }

  float grain = filmGrain(pixel, uTime);
  float noiseAmount = (1.0 - exp(-uNoiseStrength * 2.2)) * 0.4;
  float alpha = clamp(strongest * uOpacity * uFade, 0.0, 1.0);
  if (alpha < 0.0005) discard;

  vec3 color = colorSum / max(colorWeight, 0.0001);
  color = mix(color, vec3(1.0), smoothstep(0.25, 0.95, strongestCore) * uHotspot);
  float luminance = sRGB(clamp(strongest * uBrightness, 0.0, 1.0));
  luminance *= 1.0 + grain * noiseAmount;
  vec3 additiveColor = color * luminance;
  float normalAlpha = clamp(strongest * uBrightness * uOpacity * uFade, 0.0, 1.0);
  vec3 normalColor = mix(color, vec3(1.0), smoothstep(0.45, 1.0, strongestCore) * uHotspot * 0.35);
  gl_FragColor = vec4(mix(additiveColor, normalColor, uNormalBlend), mix(alpha, normalAlpha, uNormalBlend));
}
`;

const hexToRgb = (hex: string): [number, number, number] => {
  let value = (hex || "").replace("#", "").trim();
  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const parsed = Number.parseInt(value || "000000", 16);
  return [
    ((parsed >> 16) & 255) / 255,
    ((parsed >> 8) & 255) / 255,
    (parsed & 255) / 255,
  ];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface GlowCursorProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  secondaryColor?: string;
  trailLength?: number;
  trailWidth?: number;
  trailTaper?: number;
  followSpeed?: number;
  glowIntensity?: number;
  glowSpread?: number;
  hotspot?: number;
  brightness?: number;
  opacity?: number;
  pulseSpeed?: number;
  noiseStrength?: number;
  idleFade?: boolean;
  idleTimeout?: number;
  fadeDuration?: number;
  blendMode?: "normal" | "screen" | "plus-lighter";
  maxDevicePixelRatio?: number;
  enabled?: boolean;
  useWindowPointer?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const GlowCursor: React.FC<GlowCursorProps> = ({
  color = "#67E8F9",
  secondaryColor = "#A78BFA",
  trailLength = 40,
  trailWidth = 8,
  trailTaper = 0.8,
  followSpeed = 0.16,
  glowIntensity = 1.9,
  glowSpread = 1.2,
  hotspot = 0.65,
  brightness = 1.25,
  opacity = 1,
  pulseSpeed = 1.1,
  noiseStrength = 0.035,
  idleFade = true,
  idleTimeout = 700,
  fadeDuration = 900,
  blendMode = "screen",
  maxDevicePixelRatio = 1.5,
  enabled = true,
  useWindowPointer = false,
  children,
  className = "",
  style,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({
    color,
    secondaryColor,
    trailLength,
    trailWidth,
    trailTaper,
    followSpeed,
    glowIntensity,
    glowSpread,
    hotspot,
    brightness,
    opacity,
    pulseSpeed,
    noiseStrength,
    idleFade,
    idleTimeout,
    fadeDuration,
    maxDevicePixelRatio,
    blendMode,
    enabled,
    useWindowPointer,
  });

  useEffect(() => {
    propsRef.current = {
      color,
      secondaryColor,
      trailLength,
      trailWidth,
      trailTaper,
      followSpeed,
      glowIntensity,
      glowSpread,
      hotspot,
      brightness,
      opacity,
      pulseSpeed,
      noiseStrength,
      idleFade,
      idleTimeout,
      fadeDuration,
      maxDevicePixelRatio,
      blendMode,
      enabled,
      useWindowPointer,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const initialConfig = propsRef.current;
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        canvas,
        alpha: true,
        dpr: Math.min(
          window.devicePixelRatio || 1,
          initialConfig.maxDevicePixelRatio
        ),
      });
    } catch {
      // Fallback gracefully if WebGL context creation fails
      return;
    }

    const gl = renderer.gl;
    if (!gl) return;

    gl.clearColor(0, 0, 0, 0);

    const pointData = Array(MAX_POINTS * 2).fill(0);
    const points = Array.from({ length: MAX_POINTS }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };

    let program: Program;
    let mesh: Mesh;

    try {
      program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uResolution: { value: [1, 1] },
          uPoints: { value: pointData },
          uPointCount: { value: initialConfig.trailLength },
          uColor: { value: hexToRgb(initialConfig.color) },
          uSecondaryColor: { value: hexToRgb(initialConfig.secondaryColor) },
          uTrailWidth: { value: initialConfig.trailWidth },
          uTaper: { value: initialConfig.trailTaper },
          uGlowIntensity: { value: initialConfig.glowIntensity },
          uGlowSpread: { value: initialConfig.glowSpread },
          uHotspot: { value: initialConfig.hotspot },
          uBrightness: { value: initialConfig.brightness },
          uOpacity: { value: initialConfig.opacity },
          uPulseSpeed: { value: initialConfig.pulseSpeed },
          uNoiseStrength: { value: initialConfig.noiseStrength },
          uNormalBlend: { value: initialConfig.blendMode === "normal" ? 1 : 0 },
          uTime: { value: 0 },
          uFade: { value: 0 },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    } catch {
      return;
    }

    let width = 1;
    let height = 1;
    let initialized = false;
    let pointerInside = false;
    let fade = 0;
    let lastInputTime = performance.now();
    let lastFrameTime = performance.now();
    let raf = 0;
    let destroyed = false;

    const resize = () => {
      width = Math.max(container.clientWidth, 1);
      height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      if (program.uniforms.uResolution) {
        program.uniforms.uResolution.value = [width, height];
      }
    };

    const initializeTrail = (x: number, y: number) => {
      target.x = x;
      target.y = y;
      head.x = x;
      head.y = y;
      for (const point of points) {
        point.x = x;
        point.y = y;
      }
      initialized = true;
      fade = 1;
    };

    const updatePointer = (event: MouseEvent | PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = clamp(event.clientX - rect.left, 0, rect.width);
      const y = clamp(rect.height - (event.clientY - rect.top), 0, rect.height);
      if (!initialized) initializeTrail(x, y);
      target.x = x;
      target.y = y;
      pointerInside = true;
      lastInputTime = performance.now();
    };

    const onPointerLeave = () => {
      pointerInside = false;
      lastInputTime = performance.now();
    };

    const render = (now: number) => {
      if (destroyed) return;
      const config = propsRef.current;
      const delta = Math.min((now - lastFrameTime) / 16.667, 3);
      lastFrameTime = now;

      if (initialized) {
        const headEase =
          1 - Math.pow(1 - clamp(config.followSpeed, 0.01, 0.99), delta);
        const chainBase = clamp(0.28 + config.followSpeed * 0.35, 0.08, 0.92);
        const chainEase = 1 - Math.pow(1 - chainBase, delta);
        head.x += (target.x - head.x) * headEase;
        head.y += (target.y - head.y) * headEase;
        points[0].x = head.x;
        points[0].y = head.y;

        for (let i = 1; i < MAX_POINTS; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * chainEase;
          points[i].y += (points[i - 1].y - points[i].y) * chainEase;
        }

        for (let i = 0; i < MAX_POINTS; i++) {
          pointData[i * 2] = points[i].x;
          pointData[i * 2 + 1] = points[i].y;
        }
      }

      const idleFor = now - lastInputTime;
      const shouldFade =
        config.idleFade && (!pointerInside || idleFor > config.idleTimeout);
      const fadeStep = (16.667 * delta) / Math.max(config.fadeDuration, 16);
      const fadeTarget = initialized && config.enabled && !shouldFade ? 1 : 0;
      fade += (fadeTarget - fade) * Math.min(1, fadeStep * 7);

      if (program.uniforms.uPointCount) {
        program.uniforms.uPointCount.value = clamp(
          Math.round(config.trailLength),
          2,
          MAX_POINTS
        );
      }
      if (program.uniforms.uColor) {
        program.uniforms.uColor.value = hexToRgb(config.color);
      }
      if (program.uniforms.uSecondaryColor) {
        program.uniforms.uSecondaryColor.value = hexToRgb(config.secondaryColor);
      }
      if (program.uniforms.uTrailWidth) {
        program.uniforms.uTrailWidth.value = Math.max(config.trailWidth, 0.1);
      }
      if (program.uniforms.uTaper) {
        program.uniforms.uTaper.value = clamp(config.trailTaper, 0, 1);
      }
      if (program.uniforms.uGlowIntensity) {
        program.uniforms.uGlowIntensity.value = Math.max(
          config.glowIntensity,
          0
        );
      }
      if (program.uniforms.uGlowSpread) {
        program.uniforms.uGlowSpread.value = Math.max(config.glowSpread, 0);
      }
      if (program.uniforms.uHotspot) {
        program.uniforms.uHotspot.value = clamp(config.hotspot, 0, 1);
      }
      if (program.uniforms.uBrightness) {
        program.uniforms.uBrightness.value = Math.max(config.brightness, 0);
      }
      if (program.uniforms.uOpacity) {
        program.uniforms.uOpacity.value = clamp(config.opacity, 0, 1);
      }
      if (program.uniforms.uPulseSpeed) {
        program.uniforms.uPulseSpeed.value = config.pulseSpeed;
      }
      if (program.uniforms.uNoiseStrength) {
        program.uniforms.uNoiseStrength.value = clamp(
          config.noiseStrength,
          0,
          1
        );
      }
      if (program.uniforms.uNormalBlend) {
        program.uniforms.uNormalBlend.value =
          config.blendMode === "normal" ? 1 : 0;
      }
      if (program.uniforms.uTime) {
        program.uniforms.uTime.value = now * 0.001;
      }
      if (program.uniforms.uFade) {
        program.uniforms.uFade.value = fade;
      }

      renderer.render({ scene: mesh });
      if (!destroyed) raf = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const pointerTarget = initialConfig.useWindowPointer ? window : container;
    pointerTarget.addEventListener(
      "pointermove",
      updatePointer as EventListener
    );
    pointerTarget.addEventListener(
      "pointerenter",
      updatePointer as EventListener
    );
    pointerTarget.addEventListener("pointerleave", onPointerLeave);

    resize();
    raf = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      pointerTarget.removeEventListener(
        "pointermove",
        updatePointer as EventListener
      );
      pointerTarget.removeEventListener(
        "pointerenter",
        updatePointer as EventListener
      );
      pointerTarget.removeEventListener("pointerleave", onPointerLeave);
      try {
        mesh?.geometry?.remove();
        program?.remove();
      } catch {
        // ignore cleanup errors on unmount
      }
    };
  }, [maxDevicePixelRatio]);

  return (
    <div
      ref={containerRef}
      className={`glow-cursor${className ? ` ${className}` : ""}`}
      style={style}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className="glow-cursor__canvas"
        style={{ mixBlendMode: blendMode }}
        aria-hidden="true"
      />
      {children && <div className="glow-cursor__content">{children}</div>}
    </div>
  );
};

export default GlowCursor;
