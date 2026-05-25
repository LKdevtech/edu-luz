import { ImageResponse } from "next/og";

// Dynamiczny obrazek OG (1200x630) — używany w meta tagach OpenGraph/Twitter.
export const runtime = "edge";
export const alt = "EDU LUZ — Korepetycje bez stresu w Tomaszowie Mazowieckim";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #151827 0%, #1C2035 60%, #232840 100%)",
          color: "#F0EDE6",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 28,
              background: "#3B8FF0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 68,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: -4,
            }}
          >
            Ez
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 900,
              letterSpacing: -3,
            }}
          >
            <span>EDU&nbsp;</span>
            <span style={{ color: "#3B8FF0" }}>LUZ</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 1000,
          }}
        >
          <span>
            Korepetycje{" "}
            <span style={{ color: "#3B8FF0" }}>bez stresu</span>, efekty na serio
          </span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 28,
            fontWeight: 500,
            color: "#9B97AF",
          }}
        >
          Centrum korepetycji · Tomaszów Mazowiecki
        </div>
      </div>
    ),
    { ...size },
  );
}
