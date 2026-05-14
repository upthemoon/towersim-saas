import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F4EDDC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          width="148"
          height="148"
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
      </div>
    ),
    { ...size }
  );
}
