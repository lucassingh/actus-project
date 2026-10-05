import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Branded social preview (WhatsApp / Twitter / LinkedIn…). Generated as a 1200×630 PNG.
export const runtime = "nodejs";
export const alt = "Actus — El conocimiento de tu planta, siempre disponible";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fetch a Google font as bytes for Satori (text needs an embedded font). Best-effort: if it
// fails, the image still renders with the logo alone, so the build never breaks.
async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      })
    ).text();
    const url = css.match(/src:\s*url\((https:\/\/[^)]+\.(?:woff2|ttf))\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const logoBytes = await readFile(join(process.cwd(), "public/logos/logo-bg-black.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logoBytes.toString("base64")}`;

  const heading = await loadFont("Montserrat", 800);
  const body = await loadFont("Inter", 500);
  const fonts = [
    ...(heading ? [{ name: "Montserrat", data: heading, weight: 800 as const, style: "normal" as const }] : []),
    ...(body ? [{ name: "Inter", data: body, weight: 500 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0E1123",
          backgroundImage:
            "radial-gradient(1000px circle at 50% -10%, rgba(234,88,14,0.20), transparent 55%)",
          padding: "80px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="Actus" width={560} height={160} style={{ objectFit: "contain" }} />

        {body && (
          <div
            style={{
              marginTop: 44,
              fontFamily: "Inter",
              fontSize: 40,
              lineHeight: 1.3,
              color: "#C9CDE0",
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            El conocimiento de tu planta, siempre disponible.
          </div>
        )}

        {heading && (
          <div
            style={{
              marginTop: 48,
              fontFamily: "Montserrat",
              fontSize: 30,
              fontWeight: 800,
              color: "#EA580E",
              letterSpacing: "0.04em",
            }}
          >
            actusagent.io
          </div>
        )}
      </div>
    ),
    { ...size, fonts }
  );
}
