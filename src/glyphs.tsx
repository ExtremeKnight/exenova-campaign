import React from "react";
import { Circle, Polygon, Rect, Star, Triangle } from "@remotion/shapes";
import type { ServiceKey } from "./brand";

/** One geometric mark per service — the motif repeated across videos and posters. */
export const ServiceGlyph: React.FC<{ kind: ServiceKey; size: number; color: string; filled?: boolean; strokeWidth?: number }> = ({
  kind,
  size,
  color,
  filled = true,
  strokeWidth = 4,
}) => {
  const paint = filled ? { fill: color } : { fill: "none", stroke: color, strokeWidth };
  const r = size / 2;
  switch (kind) {
    case "brand":
      return <Star points={4} innerRadius={r * 0.32} outerRadius={r} cornerRadius={r * 0.08} {...paint} />;
    case "web":
      return <Rect width={size} height={size * 0.78} cornerRadius={size * 0.16} {...paint} />;
    case "film":
      return <Circle radius={r} {...paint} />;
    case "interactive":
      return <Triangle length={size} direction="right" cornerRadius={size * 0.08} {...paint} />;
    case "uiux":
      return <Polygon points={6} radius={r} cornerRadius={r * 0.12} {...paint} />;
  }
};
