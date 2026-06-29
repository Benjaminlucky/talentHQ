// src/app/api/og/job/[id]/route.js
// Dynamic Open Graph image for individual job pages.
// Served at /api/og/job/:id — referenced in generateMetadata of findjob/[id]/page.jsx.
import { ImageResponse } from "next/og";

export const runtime = "edge";

const API =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://talenthq-production.up.railway.app";

// ── Theme palette — variant picked from last 2 hex chars of job ID ────────────
const THEMES = [
  { bg: "#010f07", bg2: "#021a0b", accent: "#84cc16", accentDim: "#3d6c0a" },
  { bg: "#010f07", bg2: "#051a0a", accent: "#a3e635", accentDim: "#4a7012" },
  { bg: "#020e08", bg2: "#041808", accent: "#86efac", accentDim: "#1d5c33" },
  { bg: "#010d07", bg2: "#041505", accent: "#bef264", accentDim: "#557a16" },
  { bg: "#020f09", bg2: "#061c0b", accent: "#4ade80", accentDim: "#166534" },
  { bg: "#010e07", bg2: "#031608", accent: "#d9f99d", accentDim: "#4d7c0f" },
];

function pickTheme(id = "") {
  const n = parseInt(id.slice(-2), 16) || 0;
  return THEMES[n % THEMES.length];
}

// ── Font loader — falls back silently if CDN is unreachable ──────────────────
async function loadInterFont(weight) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; TalentHQBot/1.0)" } },
    ).then((r) => r.text());
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.woff2)\)/);
    if (!match) return undefined;
    return fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return undefined;
  }
}

// ── Job data fetcher ──────────────────────────────────────────────────────────
async function fetchJob(id) {
  try {
    const res = await fetch(`${API}/api/jobs/${id}`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.job || (data?._id ? data : null);
  } catch {
    return null;
  }
}

// ── Salary display helper ─────────────────────────────────────────────────────
function formatSalary(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s || s === "0" || s.toLowerCase() === "negotiable") return "";
  if (/[₦$€£]/.test(s) || /[a-zA-Z]/.test(s)) return s;
  const n = Number(s.replace(/,/g, ""));
  if (!isNaN(n)) return `₦${n.toLocaleString("en-NG")}`;
  return s;
}

// ── Clamp title font size to stay within 2 lines on 900px max-width ──────────
function titleFontSize(len) {
  if (len > 55) return 52;
  if (len > 40) return 60;
  if (len > 28) return 68;
  return 78;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  const { id } = await params;

  const [job, fontBlack, fontBold, fontMedium] = await Promise.all([
    fetchJob(id),
    loadInterFont(900),
    loadInterFont(700),
    loadInterFont(500),
  ]);

  const theme = pickTheme(id);

  const title   = job?.title    || "Job Opportunity";
  const company = job?.company?.companyName || job?.company?.fullName || "";
  const salary  = formatSalary(job?.salary);
  const jobType = job?.type     || "";
  const location = job?.location || "";

  const tsz = titleFontSize(title.length);

  const fonts = [
    fontBlack  && { name: "Inter", data: fontBlack,  weight: 900, style: "normal" },
    fontBold   && { name: "Inter", data: fontBold,   weight: 700, style: "normal" },
    fontMedium && { name: "Inter", data: fontMedium, weight: 500, style: "normal" },
  ].filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: theme.bg,
          fontFamily: fonts.length ? "Inter, sans-serif" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Background gradient ────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bg2} 60%, ${theme.bg} 100%)`,
            display: "flex",
          }}
        />

        {/* ── Decorative circles — top right ──────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            right: "-160px",
            top: "-160px",
            width: "580px",
            height: "580px",
            borderRadius: "50%",
            border: `1.5px solid ${theme.accent}`,
            opacity: 0.09,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-80px",
            top: "-80px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: theme.accentDim,
            opacity: 0.28,
            display: "flex",
          }}
        />

        {/* ── Decorative glow — bottom left ───────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: "-80px",
            bottom: "-120px",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            background: theme.accent,
            opacity: 0.05,
            display: "flex",
          }}
        />

        {/* ── Left accent bar ──────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: "7px",
            height: "100%",
            background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.accentDim} 100%)`,
            display: "flex",
          }}
        />

        {/* ══════════ HEADER ══════════════════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "30px 54px 0 62px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Logo mark + wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "15px",
                  height: "15px",
                  borderRadius: "50%",
                  background: theme.bg,
                  display: "flex",
                }}
              />
            </div>
            <span
              style={{
                color: "white",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.6px",
              }}
            >
              TalentHQ
            </span>
          </div>

          <div style={{ flex: "1", display: "flex" }} />

          {/* Domain pill — top right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: `rgba(255,255,255,0.06)`,
              border: `1px solid rgba(255,255,255,0.12)`,
              borderRadius: "100px",
              padding: "8px 20px",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: theme.accent,
                display: "flex",
              }}
            />
            <span
              style={{
                color: theme.accent,
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "0.3px",
              }}
            >
              talenthq.buzz
            </span>
          </div>
        </div>

        {/* ══════════ MAIN CONTENT ════════════════════════════════════════════ */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 60px 0 62px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* VACANCY label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                color: theme.accent,
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "8px",
                textTransform: "uppercase",
              }}
            >
              VACANCY
            </span>
            {/* thin accent rule after the word */}
            <div
              style={{
                flex: "1",
                height: "2px",
                background: `linear-gradient(90deg, ${theme.accentDim} 0%, transparent 100%)`,
                maxWidth: "300px",
                display: "flex",
                borderRadius: "1px",
              }}
            />
          </div>

          {/* Job title — main hero */}
          <div
            style={{
              color: "white",
              fontSize: `${tsz}px`,
              fontWeight: 900,
              lineHeight: "1.06",
              letterSpacing: "-2px",
              maxWidth: "960px",
              marginBottom: salary ? "32px" : "0",
            }}
          >
            {title}
          </div>

          {/* Salary — big, bold, prominent */}
          {salary && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* vertical rule */}
              <div
                style={{
                  width: "5px",
                  height: "52px",
                  background: theme.accent,
                  borderRadius: "3px",
                  display: "flex",
                  flexShrink: "0",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  SALARY
                </span>
                <span
                  style={{
                    color: theme.accent,
                    fontSize: "44px",
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    lineHeight: "1",
                  }}
                >
                  {salary}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ══════════ FOOTER ══════════════════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 54px 20px 62px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(0,0,0,0.3)",
            position: "relative",
            zIndex: 2,
            gap: "12px",
          }}
        >
          {/* Company info */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1" }}>
            {company ? (
              <>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", fontWeight: 500 }}>
                  Posted by
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.88)",
                    fontSize: "17px",
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                  }}
                >
                  {company}
                </span>
              </>
            ) : (
              <div style={{ display: "flex" }} />
            )}
          </div>

          {/* Type + location badges */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {jobType && (
              <div
                style={{
                  background: theme.accent,
                  color: "#010d04",
                  padding: "5px 14px",
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {jobType}
              </div>
            )}
            {location && (
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.65)",
                  padding: "5px 14px",
                  borderRadius: "100px",
                  fontSize: "13px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "11px" }}>📍</span>
                {location}
              </div>
            )}
          </div>

          {/* Apply CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: theme.accent,
              padding: "8px 20px",
              borderRadius: "100px",
              marginLeft: "8px",
            }}
          >
            <span
              style={{
                color: "#010d04",
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: "0.2px",
              }}
            >
              Apply at talenthq.buzz
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length ? fonts : undefined,
    },
  );
}
