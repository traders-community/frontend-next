"use client";

import React, { useMemo } from "react";

interface WaveLayer {
  fillPath: string;
  colorDark: string;
  colorLight: string;
  opacityDark: number;
  opacityLight: number;
  duration: number;
  yOffset: number;
}

const WIDTH = 1200;
const HEIGHT = 400;
const STEPS = 300;

/**
 * Exact harmonic wave generator from the original React app (TradingBackground.jsx).
 * Uses the exact pseudorandom seeds, harmonics [1, 2, 3, 4, 5], and amplitude scaling
 * to recreate the authentic parabolic trading chart peaks.
 *
 * One full period across WIDTH guarantees that y(0) === y(WIDTH) and slope(0) === slope(WIDTH),
 * creating a 100% gap-free, infinite animation across all viewport widths.
 */
function generateOriginalGraphData(seedOffset: number, heightScale: number): string {
  const stepX = WIDTH / STEPS;
  const startY = HEIGHT * 0.52;

  const harmonics = [1, 2, 3, 4, 5];
  const waves = harmonics.map((freq, i) => {
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const r1 = random(seedOffset + i);
    const r2 = random(seedOffset + i + 100);

    return {
      freq,
      amp: (r1 * 0.5 + 0.5) * (heightScale / Math.sqrt(freq)),
      phase: r2 * 2 * Math.PI,
    };
  });

  const points: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const xPct = i / STEPS;
    const theta = xPct * 2 * Math.PI;

    let yOffset = 0;
    waves.forEach((w) => {
      yOffset += w.amp * Math.sin(w.freq * theta + w.phase);
    });

    points.push(startY + yOffset);
  }

  let pathD = `M 0,${points[0]}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${i * stepX},${points[i]}`;
  }

  // Pure fill to bottom, NO stroke lines / borders
  return `${pathD} L ${WIDTH},${HEIGHT} L 0,${HEIGHT} Z`;
}

export function TradingBackground() {
  const layers: WaveLayer[] = useMemo(() => {
    return [
      // Layer 0: Deep background layer (seed 0, heightScale 60, slower)
      {
        fillPath: generateOriginalGraphData(0, 60),
        colorDark: "#0d6e42",
        colorLight: "#00a843",
        opacityDark: 0.35,
        opacityLight: 0.12,
        duration: 48,
        yOffset: 20,
      },
      // Layer 1: Middle layer (seed 100, heightScale 70)
      {
        fillPath: generateOriginalGraphData(100, 70),
        colorDark: "#118452",
        colorLight: "#00b84c",
        opacityDark: 0.40,
        opacityLight: 0.16,
        duration: 36,
        yOffset: 10,
      },
      // Layer 2: Foreground layer (seed 200, heightScale 80, balanced with others, NO harsh glow)
      {
        fillPath: generateOriginalGraphData(200, 80),
        colorDark: "#159c60",
        colorLight: "#00c950",
        opacityDark: 0.45,
        opacityLight: 0.20,
        duration: 26,
        yOffset: -10,
      },
    ];
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden bg-transparent select-none z-0"
    >
      {/* SVG Definitions for Gradients (Smooth top-to-bottom fill fade) */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {layers.map((layer, idx) => (
            <React.Fragment key={idx}>
              {/* Dark Mode: Darker, desaturated, softer emerald */}
              <linearGradient id={`chart-grad-dark-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={layer.colorDark} stopOpacity="0.8" />
                <stop offset="60%" stopColor={layer.colorDark} stopOpacity="0.3" />
                <stop offset="100%" stopColor={layer.colorDark} stopOpacity="0.0" />
              </linearGradient>

              {/* Light Mode: Clean, fresh, visible emerald on #f4f4f4 */}
              <linearGradient id={`chart-grad-light-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={layer.colorLight} stopOpacity="0.75" />
                <stop offset="60%" stopColor={layer.colorLight} stopOpacity="0.25" />
                <stop offset="100%" stopColor={layer.colorLight} stopOpacity="0.0" />
              </linearGradient>
            </React.Fragment>
          ))}
        </defs>
      </svg>

      {/* Waves Container positioned at bottom of viewport */}
      <div className="absolute bottom-0 left-0 right-0 h-[50vh] sm:h-[60vh] md:h-[68vh] overflow-hidden pointer-events-none">
        {layers.map((layer, idx) => (
          <div
            key={idx}
            className="absolute inset-0 flex items-end overflow-hidden pointer-events-none"
            style={{
              bottom: `${layer.yOffset}px`,
            }}
          >
            {/* Viewport Track: 200vw guarantees zero screen edge gaps on all resolutions */}
            <div
              className="flex h-full will-change-transform"
              style={{
                width: "200vw",
                minWidth: "200vw",
                animation: `wave-scroll ${layer.duration}s linear infinite`,
              }}
            >
              {/* Segment 1: Exactly 100vw spanning full screen width */}
              <div
                className="h-full shrink-0"
                style={{ width: "100vw", minWidth: "100vw" }}
              >
                <svg
                  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  {/* Dark Mode Wave */}
                  <path
                    d={layer.fillPath}
                    fill={`url(#chart-grad-dark-${idx})`}
                    className="hidden dark:block"
                    style={{ opacity: layer.opacityDark }}
                  />
                  {/* Light Mode Wave */}
                  <path
                    d={layer.fillPath}
                    fill={`url(#chart-grad-light-${idx})`}
                    className="dark:hidden"
                    style={{ opacity: layer.opacityLight }}
                  />
                </svg>
              </div>

              {/* Segment 2: Exact identical clone seamlessly following Segment 1 */}
              <div
                className="h-full shrink-0"
                style={{ width: "100vw", minWidth: "100vw" }}
                aria-hidden="true"
              >
                <svg
                  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  {/* Dark Mode Wave */}
                  <path
                    d={layer.fillPath}
                    fill={`url(#chart-grad-dark-${idx})`}
                    className="hidden dark:block"
                    style={{ opacity: layer.opacityDark }}
                  />
                  {/* Light Mode Wave */}
                  <path
                    d={layer.fillPath}
                    fill={`url(#chart-grad-light-${idx})`}
                    className="dark:hidden"
                    style={{ opacity: layer.opacityLight }}
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TradingBackground;
