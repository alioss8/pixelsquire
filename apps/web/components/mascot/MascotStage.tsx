"use client";

import { useId } from "react";

export type KnightState = "idle" | "happy" | "sad" | "talk" | "walk";

const SCENES: Record<"forest" | "castle" | "camp", string> = {
  forest: "scene-forest.png",
  castle: "scene-castle.png",
  camp: "scene-camp.png",
};

const SPRITES: Record<KnightState, { file: string; frames: number }> = {
  idle: { file: "idle.png", frames: 9 },
  happy: { file: "happy.png", frames: 9 },
  sad: { file: "sad.png", frames: 9 },
  talk: { file: "talking.png", frames: 9 },
  walk: { file: "walking.png", frames: 8 },
};

const SPEED: Record<KnightState, number> = {
  idle: 1.2,
  happy: 1.0,
  sad: 1.4,
  talk: 1.0,
  walk: 0.8,
};

export function MascotStage({
  scene = "forest",
  state = "idle",
  assetsBase = "/sprites/",
  size = 140,
  frame = true,
}: {
  scene?: "forest" | "castle" | "camp";
  state?: KnightState;
  assetsBase?: string;
  size?: number;
  frame?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const sprite = SPRITES[state];
  const spriteSize = frame ? size * 0.68 : size;
  const stageStyle: React.CSSProperties = frame
    ? {
        position: "relative",
        width: size,
        height: size,
        border: "3px solid #000",
        boxShadow: "var(--shadow-popup)",
        backgroundImage: `url(${assetsBase}${SCENES[scene]})`,
        backgroundSize: "auto 100%",
        backgroundRepeat: "repeat-x",
        imageRendering: "pixelated",
        overflow: "hidden",
      }
    : { position: "relative", width: size, height: size };

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <style>{`@keyframes cycle_${id}{from{background-position:0 0;}to{background-position:-${sprite.frames * spriteSize}px 0;}}`}</style>
      <div style={stageStyle}>
        <div
          style={{
            position: "absolute",
            bottom: frame ? "4%" : 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: spriteSize,
            height: spriteSize,
            backgroundImage: `url(${assetsBase}${sprite.file})`,
            backgroundSize: `${sprite.frames * spriteSize}px ${spriteSize}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            animation: `cycle_${id} ${SPEED[state]}s steps(${sprite.frames}) infinite`,
          }}
        />
      </div>
    </div>
  );
}
