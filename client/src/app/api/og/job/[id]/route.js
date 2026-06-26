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
  {
    bg: "#001a0d",
    bg2: "#002e18",
    accent: "#7fba00",
    ring: "#003d1e",
  },
  {
    bg: "#002e18",
    bg2: "#004b23",
    accent: "#a3e635",
    ring: "#005c2b",
  },
  {
    bg: "#064e3b",
    bg2: "#065f46",
    accent: "#34d399",
    ring: "#047857",
  },
  {
    bg: "#14532d",
    bg2: "#166534",
    accent: "#86efac",
    ring: "#15803d",
  },
  {
    bg: "#003320",
    bg2: "#00452a",
    accent: "#bef264",
    ring: "#005734",
  },
  {
    bg: "#0f2a18",
    bg2: "#1a3d24",
    accent: "#4ade80",
    ring: "#166534",
  },
];

function pickTheme(id = "") {
  const n = parseInt(id.slice(-2), 16) || 0;
  return THEMES[n % THEMES.length];
}

// ── Font loader — falls back silently if the CDN is unreachable ───────────────
async function loadInterFont(weight) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; TalentHQBot/1.0)",
        },
      },
    ).then((r) => r.text());
    const match = css.match(
      /url\((https:\/\/fonts\.gstatic\.com[^)]+\.woff2)\)/,
    );
    if (!match) return undefined;
    return fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return undefined;
  }
}

// ── Job data fetcher ──────────────────────────────────────────────────────────
async function fetchJob(id) {
  try {
    const res = await fetch(`${API}/api/jobs/${id}`, {
      next: { revalidate: 600 },
    });
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
  // Already has currency symbol or text? Return as-is
  if (/[₦$€£]/.test(s) || /[a-zA-Z]/.test(s)) return s;
  // Pure numeric
  const n = Number(s.replace(/,/g, ""));
  if (!isNaN(n)) return `₦${n.toLocaleString("en-NG")}`;
  return s;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  const { id } = await params;

  const [job, fontBold, fontRegular] = await Promise.all([
    fetchJob(id),
    loadInterFont(700),
    loadInterFont(400),
  ]);

  const theme = pickTheme(id);

  const title = job?.title || "Job Opportunity";
  const jobType = job?.type || "";
  const location = job?.location || "";
  const salary = formatSalary(job?.salary);
  const company =
    job?.company?.companyName || job?.company?.fullName || "";
  const category = job?.category || "";

  // Scale font size based on title length
  const titleSize =
    title.length > 50 ? 52 : title.length > 36 ? 60 : title.length > 24 ? 68 : 76;

  const fonts = [
    fontBold && { name: "Inter", data: fontBold, weight: 700, style: "normal" },
    fontRegular && { name: "Inter", data: fontRegular, weight: 400, style: "normal" },
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
          position: "relative",
          overflow: "hidden",
          fontFamily: fonts.length ? "Inter, sans-serif" : "sans-serif",
        }}
      >
        {/* Gradient wash */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            backgroundImage: `linear-gradient(140deg, ${theme.bg} 0%, ${theme.bg2} 55%, ${theme.bg} 100%)`,
            display: "flex",
          }}
        />

        {/* Decorative ring — top right */}
        <div
          style={{
            position: "absolute",
            right: "-140px",
            top: "-140px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            border: `2px solid ${theme.accent}`,
            opacity: 0.12,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-60px",
            top: "-60px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background: theme.ring,
            opacity: 0.35,
            display: "flex",
          }}
        />

        {/* Decorative ring — bottom left */}
        <div
          style={{
            position: "absolute",
            left: "-100px",
            bottom: "-160px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: theme.accent,
            opacity: 0.06,
            display: "flex",
          }}
        />

        {/* Accent bar — left edge */}
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: "6px",
            height: "100%",
            background: theme.accent,
            display: "flex",
          }}
        />

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "30px 56px 0 62px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
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
                letterSpacing: "-0.5px",
              }}
            >
              TalentHQ
            </span>
          </div>

          <div style={{ flex: "1", display: "flex" }} />

          <span
            style={{
              color: theme.accent,
              fontSize: "15px",
              fontWeight: 600,
              opacity: 0.85,
              letterSpacing: "0.2px",
            }}
          >
            talenthq.buzz
          </span>
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 56px 16px 62px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Badges row */}
          {(jobType || location || category) && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "28px",
                alignItems: "center",
              }}
            >
              {jobType && (
                <div
                  style={{
                    background: theme.accent,
                    color: "#001209",
                    padding: "6px 18px",
                    borderRadius: "100px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.8px",
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
                    border: `1.5px solid rgba(255,255,255,0.2)`,
                    color: "rgba(255,255,255,0.7)",
                    padding: "6px 18px",
                    borderRadius: "100px",
                    fontSize: "13px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    letterSpacing: "0.1px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>📍</span>
                  {location}
                </div>
              )}
              {category && (
                <div
                  style={{
                    border: `1.5px solid rgba(255,255,255,0.12)`,
                    color: "rgba(255,255,255,0.45)",
                    padding: "6px 18px",
                    borderRadius: "100px",
                    fontSize: "13px",
                    fontWeight: 400,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {category}
                </div>
              )}
            </div>
          )}

          {/* Job title */}
          <div
            style={{
              color: "white",
              fontSize: `${titleSize}px`,
              fontWeight: 700,
              lineHeight: "1.08",
              letterSpacing: "-1.5px",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>

          {/* Salary */}
          {salary && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "26px",
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "24px",
                  background: theme.accent,
                  borderRadius: "2px",
                  display: "flex",
                }}
              />
              <span
                style={{
                  color: theme.accent,
                  fontSize: "24px",
                  fontWeight: 600,
                  letterSpacing: "-0.3px",
                }}
              >
                {salary}
              </span>
            </div>
          )}
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "18px 56px 18px 62px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(0,0,0,0.22)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {company ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", fontWeight: 400 }}
              >
                Posted by
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "-0.2px",
                }}
              >
                {company}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}

          <div style={{ flex: "1", display: "flex" }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "8px 18px",
              borderRadius: "100px",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "13px",
                fontWeight: 400,
              }}
            >
              Apply at
            </span>
            <span
              style={{
                color: theme.accent,
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              talenthq.buzz
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
