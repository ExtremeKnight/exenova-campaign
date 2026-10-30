import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { C } from "../brand";
import { Grain } from "../fx";
import { CutFlash, Footage, Punch, ShotCounter, StillCard, WorkLabel } from "./parts";
import { BAR } from "./timeline";

type Shot = {
  kind: string;
  title: string;
  by: string;
  color: string;
  clip?: string;
  /** Second angle, cut in on the half-bar. */
  then?: string;
  still?: string;
  punch?: string;
};

// The work, one shot per bar (2 s). Clips come from the team's uploads on the
// site; stills from public/team/work.
export const MONTAGE: Shot[] = [
  { kind: "Short film", title: "CAIN", by: "Komorebi Films", color: C.amber, clip: "k-red", then: "k-face", punch: "We shoot it." },
  { kind: "Illustration", title: "Piece of Mind", by: "Reinard Gabriel Saddi", color: C.amber, still: "team/work/piece-of-mind.webp", punch: "We draw it." },
  { kind: "Exhibit design", title: "Quasar — DUO", by: "Shan Patrick Cruz", color: C.accent, clip: "q-laptop", then: "q-artwall", punch: "We design it." },
  { kind: "Exhibit", title: "Quasar 2026", by: "Shan Patrick Cruz", color: C.accent, clip: "q-expo", then: "q-smiles" },
  { kind: "3D & motion", title: "Memphis Playground", by: "Justine Mojica", color: C.coral, still: "team/work/memphis-playground.webp" },
  { kind: "Ad film", title: "BRWTL", by: "Shan Patrick Cruz", color: C.coral, clip: "b-cafe", then: "b-mug" },
  { kind: "Character design", title: "Princess Novaria", by: "Reinard Gabriel Saddi", color: C.amber, still: "team/work/princess-novaria.webp" },
  { kind: "Live & music", title: "Quasar Stage", by: "the Exenova team", color: C.moss, clip: "q-stage", then: "q-cheer" },
];

const ShotView: React.FC<{ shot: Shot; n: number }> = ({ shot, n }) => (
  <AbsoluteFill>
    {shot.clip ? (
      <>
        <Sequence durationInFrames={shot.then ? BAR / 2 : BAR} layout="none">
          <Footage clip={shot.clip} dur={BAR} startFrom={6} />
        </Sequence>
        {shot.then && (
          <Sequence from={BAR / 2} durationInFrames={BAR / 2} layout="none">
            <Footage clip={shot.then} dur={BAR / 2} zoom={[1.06, 1.0]} startFrom={10} />
            <CutFlash strength={0.25} />
          </Sequence>
        )}
      </>
    ) : (
      <StillCard src={shot.still!} dur={BAR} tilt={n % 2 ? 2 : -2} />
    )}
    {shot.punch && <Punch text={shot.punch} start={2} />}
    <WorkLabel kind={shot.kind} title={shot.title} by={shot.by} color={shot.color} start={shot.punch ? 22 : 6} />
    <ShotCounter n={n} of={MONTAGE.length} color={shot.color} />
    <CutFlash />
  </AbsoluteFill>
);

export const Montage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {MONTAGE.map((shot, i) => (
      <Sequence key={shot.title} from={i * BAR} durationInFrames={BAR} layout="none">
        <ShotView shot={shot} n={i + 1} />
      </Sequence>
    ))}
    <Grain opacity={0.07} />
  </AbsoluteFill>
);
