import type { ReactNode } from "react";

const layerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center bottom",
  backgroundRepeat: "no-repeat",
  imageRendering: "pixelated",
};

export function Scene({ children }: { children: ReactNode }) {
  return (
    <div style={{ flex: 1, minHeight: "100%", position: "relative", background: "var(--wood-950)" }}>
      <div style={{ ...layerStyle, backgroundImage: "url(/scenes/layer-gradient-transition.png)" }} />
      <div style={{ ...layerStyle, backgroundImage: "url(/scenes/layer-clouds.png)" }} />
      <div style={{ ...layerStyle, backgroundImage: "url(/scenes/layer-main-castle.png)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(28,19,12,0.5) 0%,rgba(28,19,12,0.05) 30%,rgba(28,19,12,0.05) 70%,rgba(28,19,12,0.65) 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, minHeight: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
