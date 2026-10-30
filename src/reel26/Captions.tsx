import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../brand";
import { useLayout } from "../fx";
import { CAPTION_BAND, FPS } from "./timeline";
import { VOICE } from "./voice";

/**
 * Burned-in captions for the narrated cut (most social video plays muted).
 * Shows the current line with the spoken word highlighted, in the bottom band
 * that every scene keeps free (above the TikTok/Reels buttons on 9:16).
 */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useLayout();
  const t = frame / FPS;
  const line = VOICE.find((l) => t >= l.at - 0.1 && t <= l.at + l.dur + 0.35);
  if (!line) return null;
  const local = t - line.at;
  const fadeIn = Math.min(1, (t - (line.at - 0.1)) / 0.15);
  const fadeOut = Math.min(1, (line.at + line.dur + 0.35 - t) / 0.2);
  return (
    <div
      style={{
        position: "absolute",
        left: 60 * u,
        right: 60 * u,
        bottom: (portrait ? CAPTION_BAND.portrait : CAPTION_BAND.other) * u,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: portrait ? 940 * u : 1500 * u,
          padding: `${14 * u}px ${28 * u}px`,
          borderRadius: 20 * u,
          background: "rgba(10,8,6,0.62)",
          backdropFilter: "blur(10px)",
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: (portrait ? 46 : 40) * u,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          textAlign: "center",
          color: `${C.ink}99`,
          opacity: Math.max(0, Math.min(fadeIn, fadeOut)),
        }}
      >
        {line.words.map((w, i) => {
          const spoken = local >= w.t;
          return (
            <span
              key={i}
              style={{
                color: spoken ? C.ink : undefined,
                marginRight: "0.28em",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
