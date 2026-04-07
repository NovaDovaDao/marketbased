import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Market Base — Ancient Market of Sanctuary"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Background pattern — subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 80% 20%, rgba(140,0,0,0.18) 0%, transparent 55%), radial-gradient(ellipse at 10% 85%, rgba(247,189,72,0.08) 0%, transparent 50%)",
          }}
        />

        {/* Top rule */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 96,
            right: 96,
            height: 1,
            background: "rgba(247,189,72,0.25)",
          }}
        />

        {/* Eyebrow */}
        <p
          style={{
            fontSize: 18,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(247,189,72,0.7)",
            marginBottom: 24,
            fontStyle: "normal",
          }}
        >
          The Ancient Market of Sanctuary
        </p>

        {/* Headline */}
        <h1
          style={{
            fontSize: 96,
            fontWeight: 800,
            fontStyle: "italic",
            color: "#f7bd48",
            lineHeight: 0.9,
            marginBottom: 36,
            textShadow: "0 0 60px rgba(247,189,72,0.35)",
          }}
        >
          Market Base
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.65)",
            maxWidth: 680,
            lineHeight: 1.5,
            marginBottom: 0,
          }}
        >
          Buy, sell, and trade Diablo&nbsp;II runes and items peer-to-peer.
        </p>

        {/* Bottom rule */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 96,
            right: 96,
            height: 1,
            background: "rgba(247,189,72,0.25)",
          }}
        />

        {/* Domain */}
        <p
          style={{
            position: "absolute",
            bottom: 56,
            right: 96,
            fontSize: 16,
            letterSpacing: "0.1em",
            color: "rgba(247,189,72,0.45)",
          }}
        >
          marketbased.vercel.app
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
