import React, { useState } from "react";
import {
  Box,
  Chip,
  Typography,
  Collapse,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { NormalizedData, normalizeJson } from "./normalizeJson";

interface ScorecardViewProps {
  normalized?: NormalizedData;
  data?: any;
}

const signalStyle = (signal: string) => {
  const map: Record<string, { color: string; bg: string; barColor: string }> = {
    positive:             { color: "#059669", bg: "#F0FDF4", barColor: "#10B981" },
    strong_positive:      { color: "#047857", bg: "#ECFDF5", barColor: "#059669" },
    moderate:             { color: "#D97706", bg: "#FFFBEB", barColor: "#F59E0B" },
    neutral:              { color: "#64748B", bg: "#F1F5F9", barColor: "#94A3B8" },
    neutral_to_negative:  { color: "#EA580C", bg: "#FFF7ED", barColor: "#F97316" },
    caution:              { color: "#EA580C", bg: "#FFF7ED", barColor: "#F97316" },
    negative:             { color: "#DC2626", bg: "#FEF2F2", barColor: "#EF4444" },
  };
  return map[signal] || map.neutral;
};

const ALL_TABS = ["Key Criteria", "Strengths", "Concerns"] as const;
type TabName = typeof ALL_TABS[number];

const TAB_COLORS: Record<TabName, { active: string; light: string }> = {
  "Key Criteria": { active: "#0891b2", light: "#ecfeff" },
  "Strengths":    { active: "#059669", light: "#f0fdf4" },
  "Concerns":     { active: "#DC2626", light: "#fef2f2" },
};

const ScorecardView: React.FC<ScorecardViewProps> = ({ normalized, data }) => {
  // Hooks must be called unconditionally before any early return
  const [tab, setTab] = useState<TabName>("Key Criteria");

  const n = normalized || (data ? normalizeJson(data) : null);
  if (!n) return null;

  const finalVerdict: string = n.raw?.analysis?.final_verdict || "";

  const availableTabs = ALL_TABS.filter((t) => {
    if (t === "Key Criteria") return n.dimensions.length > 0;
    if (t === "Strengths")    return n.strengths.length > 0;
    if (t === "Concerns")     return n.concerns.length > 0;
    return true;
  });

  return (
    <Box>
      {/* Final Verdict */}
      {finalVerdict && (
        <Box sx={{ mb: 2.5, px: 2, py: 1.5, bgcolor: "#e9f0f7", borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.7,fontWeight: 500 }}>
            {finalVerdict}
          </Typography>
        </Box>
      )}

      {/* Tab bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
        {availableTabs.map((t) => {
          const tc = TAB_COLORS[t];
          const isActive = tab === t;
          return (
            <Box
              key={t}
              onClick={() => setTab(t)}
              sx={{
                px: 2.2, py: 0.75, cursor: "pointer", fontSize: "0.78rem",
                fontWeight: isActive ? 800 : 600, color: isActive ? tc.active : "#64748b",
                borderRadius: 5, bgcolor: isActive ? tc.light : "transparent",
                border: isActive ? `1.5px solid ${tc.active}40` : "1.5px solid transparent",
                transition: "all 0.18s", letterSpacing: 0.2,
                "&:hover": { color: tc.active, bgcolor: tc.light },
              }}
            >
              {t}{t === "Key Criteria" && ` (${n.dimensions.length})`}
            </Box>
          );
        })}
      </Box>

      {/* Tab content */}
      {tab === "Key Criteria" && <DimensionsGrid dims={n.dimensions} />}
      {tab === "Strengths"    && <StrengthsList items={n.strengths} />}
      {tab === "Concerns"     && <ConcernsList items={n.concerns} />}

      {/* Disclaimer / Methodology */}
      {(n.disclaimer || n.methodology) && (
        <Box sx={{ mt: 2.5, pt: 1.5, borderTop: "1px solid #e2e8f0" }}>
          {n.methodology && (
            <Typography sx={{ fontSize: "0.8rem", color: "#1a1a1a", lineHeight: 1.6, mb: 0.5 }}>
              <strong>Methodology:</strong> {n.methodology}
            </Typography>
          )}
          {n.disclaimer && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
              <InfoOutlinedIcon sx={{ fontSize: 13, color: "#5a5a5a", mt: 0.2 }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#5a5a5a", lineHeight: 1.6, fontStyle: "italic" }}>
                {n.disclaimer}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

/* ═══ Key Criteria (Dimensions) Grid ═══ */
const DimensionsGrid: React.FC<{ dims: any[] }> = ({ dims }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
      {dims.map((dim: any) => {
        const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
        const s = signalStyle(dim.signal);
        const isExpanded = expandedId === dim.id;

        return (
          <Box
            key={dim.id}
            sx={{
              bgcolor: s.bg,
              borderRadius: 2.5,
              border: `1.5px solid ${s.color}30`,
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: `0 4px 16px ${s.color}20`,
                borderColor: `${s.color}60`,
              },
            }}
          >
            {/* Header - Always Visible */}
            <Box
              onClick={() => setExpandedId(isExpanded ? null : dim.id)}
              sx={{
                p: 2.5,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#1E293B",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    lineHeight: 1.3,
                    mb: 1,
                  }}
                >
                  {dim.label}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>
                    Score
                  </Typography>
                  <Typography sx={{ fontSize: "0.88rem", fontWeight: 900, color: s.color }}>
                    {dim.score}/{dim.max_score}
                  </Typography>
                </Box>
                <Box sx={{ width: "100%", height: 6, bgcolor: `${s.color}20`, borderRadius: 4, overflow: "hidden", mt: 0.8 }}>
                  <Box sx={{ width: `${pct}%`, height: "100%", borderRadius: 4, bgcolor: s.barColor, transition: "width 0.6s ease-out" }} />
                </Box>
              </Box>

              {/* Expand Icon */}
              <IconButton
                size="small"
                sx={{
                  color: s.color,
                  opacity: 0.6,
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  "&:hover": { opacity: 1, bgcolor: `${s.color}10` },
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Expanded Content */}
            <Collapse in={isExpanded} timeout={300}>
              <Box
                sx={{
                  px: 2.5,
                  pb: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Chip
                  label={dim.signal?.replace(/_/g, " ")}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.6rem",
                    height: 22,
                    width: "fit-content",
                    bgcolor: "#fff",
                    color: s.color,
                    border: `1px solid ${s.color}60`,
                    textTransform: "capitalize",
                  }}
                />

                {dim.data_point && (
                  <Typography sx={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.55 }}>
                    {dim.data_point}
                  </Typography>
                )}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
};

/* ═══ Strengths ═══ */
const StrengthsList: React.FC<{ items: string[] }> = ({ items }) => (
  <Box sx={{ bgcolor: "#F0FDF4", borderRadius: 2.5, border: "1.5px solid #BBF7D0", p: 2.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <CheckCircleOutlineIcon sx={{ color: "#059669", fontSize: 20 }} />
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#065F46", textTransform: "uppercase", letterSpacing: 0.8 }}>
        Strengths ({items.length})
      </Typography>
    </Box>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {items.map((s, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start", width: { xs: "100%", sm: "calc(50% - 6px)" } }}>
          <Typography sx={{ color: "#059669", fontWeight: 800, fontSize: "0.75rem", lineHeight: 1.6, flexShrink: 0 }}>+</Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#1E293B", lineHeight: 1.6 }}>{s}</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

/* ═══ Concerns ═══ */
const ConcernsList: React.FC<{ items: string[] }> = ({ items }) => (
  <Box sx={{ bgcolor: "#FEF2F2", borderRadius: 2.5, border: "1.5px solid #FECACA", p: 2.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 20 }} />
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#991B1B", textTransform: "uppercase", letterSpacing: 0.8 }}>
        Concerns ({items.length})
      </Typography>
    </Box>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {items.map((c, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start", width: { xs: "100%", sm: "calc(50% - 6px)" } }}>
          <Typography sx={{ color: "#DC2626", fontWeight: 800, fontSize: "0.75rem", lineHeight: 1.6, flexShrink: 0 }}>!</Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#1E293B", lineHeight: 1.6 }}>{c}</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

export default ScorecardView;
