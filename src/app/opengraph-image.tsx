import { ImageResponse } from "next/og";

export const alt = "Madras Cloth Emporium — Sarees, suits & fine fabrics since 1970, Chas, Bokaro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#4a0f1c", color: "#fbf7f0", fontFamily: "Georgia, serif", position: "relative" }}>
        <div style={{ position: "absolute", inset: 28, border: "2px solid #b08a43", borderRadius: 24, display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 96px", width: "100%" }}>
          <div style={{ fontSize: 26, letterSpacing: 8, color: "#d9c08a", textTransform: "uppercase" }}>Est. 1970 · Chas, Bokaro</div>
          <div style={{ fontSize: 92, marginTop: 24, lineHeight: 1.05 }}>Madras Cloth Emporium</div>
          <div style={{ fontSize: 38, marginTop: 28, color: "#efe2c2", fontStyle: "italic" }}>Sarees · Suits · Kurtis · Shirting · Suiting</div>
          <div style={{ display: "flex", marginTop: 48 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ width: 0, height: 0, borderLeft: "13px solid transparent", borderRight: "13px solid transparent", borderBottom: "22px solid #b08a43" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
