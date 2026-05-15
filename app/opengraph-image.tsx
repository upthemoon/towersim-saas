import { ImageResponse } from "next/og";

export const alt = "TowerSim — 建設業の原価・交渉シミュレーター";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F4EDDC",
          backgroundImage:
            "linear-gradient(to right, rgba(43,63,102,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,63,102,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width="72"
            height="72"
            fill="#1A2B4A"
          >
            <path d="M32 4 L24 14 L40 14 Z" />
            <rect x="14" y="14" width="36" height="2.5" />
            <rect x="13" y="16.5" width="3" height="6" />
            <rect x="48" y="16.5" width="3" height="6" />
            <rect x="10" y="24" width="44" height="2.5" />
            <rect x="9" y="26.5" width="3" height="6" />
            <rect x="52" y="26.5" width="3" height="6" />
            <path d="M24 14 L20 56 L44 56 L40 14 L37 14 L41 56 L23 56 L27 14 Z" />
            <path d="M25 20 L39 32 L25 44 L25 42 L37 32 L25 22 Z" />
            <path d="M39 20 L25 32 L39 44 L39 42 L27 32 L39 22 Z" />
            <rect x="14" y="56" width="36" height="2.5" />
            <rect x="14" y="60" width="36" height="2.5" />
          </svg>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#1A1A1A",
            }}
          >
            TowerSim
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 32,
              color: "#B23F38",
              border: "2px solid #B23F38",
              padding: "6px 18px",
              borderRadius: 4,
              alignSelf: "flex-start",
              letterSpacing: "0.08em",
            }}
          >
            建設業・運送業向け SaaS
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#1A1A1A",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>原価と交渉、</span>
            <span style={{ display: "flex" }}>
              <span style={{ color: "#B23F38" }}>紙の感覚</span>
              <span>でデジタルに。</span>
            </span>
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#5C5C5C",
              lineHeight: 1.5,
              marginTop: 8,
            }}
          >
            総額提示案件・単価交渉・受注可否判断を 1 つの画面で
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#5C5C5C",
            letterSpacing: "0.05em",
          }}
        >
          <div>towersim.upthemoon.co.jp</div>
          <div>7 日間無料・クレカ登録不要</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
