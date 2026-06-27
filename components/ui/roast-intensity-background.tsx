"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import type { IntensityKey } from "@/app/i18n";
import type { HillColor } from "@/components/ui/glsl-hills";

const GLSLHills = dynamic(
  () => import("@/components/ui/glsl-hills").then((m) => m.GLSLHills),
  { ssr: false },
);

type IntensityTheme = {
  hillColor: HillColor;
  speed: number;
  cameraZ: number;
  opacityScale: number;
  overlay: string;
  glow: string;
  vignette: string;
};

export const INTENSITY_THEMES: Record<IntensityKey, IntensityTheme> = {
  clean: {
    hillColor: [0.2, 0.72, 0.82],
    speed: 0.22,
    cameraZ: 135,
    opacityScale: 0.55,
    overlay: "bg-gradient-to-b from-[#071018]/80 via-[#0a1a24]/55 to-[#030608]/90",
    glow: "bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,189,198,0.22),transparent_65%)]",
    vignette: "bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]",
  },
  gaali_light: {
    hillColor: [1, 0.35, 0.1],
    speed: 0.45,
    cameraZ: 110,
    opacityScale: 0.82,
    overlay: "bg-gradient-to-b from-black/55 via-black/38 to-black/78",
    glow: "bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,69,0,0.28),transparent_62%)]",
    vignette: "bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)]",
  },
  savage: {
    hillColor: [0.92, 0.08, 0.12],
    speed: 0.78,
    cameraZ: 92,
    opacityScale: 1,
    overlay: "bg-gradient-to-b from-[#180404]/75 via-[#0a0000]/50 to-black/92",
    glow: "bg-[radial-gradient(ellipse_at_50%_100%,rgba(220,20,30,0.35),transparent_58%)]",
    vignette: "bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]",
  },
};

export interface RoastIntensityBackgroundProps {
  intensity: IntensityKey;
  className?: string;
}

export function RoastIntensityBackground({ intensity, className }: RoastIntensityBackgroundProps) {
  const theme = INTENSITY_THEMES[intensity];

  return (
    <div className={className} aria-hidden="true">
      <GLSLHills
        width="100%"
        height="100%"
        speed={theme.speed}
        cameraZ={theme.cameraZ}
        hillColor={theme.hillColor}
        opacityScale={theme.opacityScale}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={intensity}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute inset-0 ${theme.overlay}`}
        />
      </AnimatePresence>

      <motion.div
        animate={{ opacity: intensity === "savage" ? 1 : intensity === "gaali_light" ? 0.85 : 0.65 }}
        transition={{ duration: 0.5 }}
        className={`absolute inset-0 ${theme.glow}`}
      />

      <div className={`absolute inset-0 ${theme.vignette}`} />
    </div>
  );
}
