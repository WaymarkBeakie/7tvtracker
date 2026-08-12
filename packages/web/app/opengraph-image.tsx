import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "7TV Emote Tracker";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#0a0a0a",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div style={{ width: 36, height: 80, background: "#34d399", opacity: 0.5, borderRadius: 8 }} />
          <div style={{ width: 36, height: 128, background: "#34d399", opacity: 0.7, borderRadius: 8 }} />
          <div style={{ width: 36, height: 176, background: "#34d399", borderRadius: 8 }} />
          <div style={{ width: 36, height: 104, background: "#34d399", opacity: 0.6, borderRadius: 8 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}