import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  fail: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  breach: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  warning: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  pass: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  unverifiable: { bg: "#e0e7ff", color: "#334155", border: "#c7d2fe" },
};

const getStatusStyle = (status: string) => {
  const key = status?.toLowerCase() || "";
  for (const [k, v] of Object.entries(statusColors)) {
    if (key.includes(k)) return v;
  }
  return statusColors.warning;
};

const SKIP_META = ["badge", "overall", "section_number", "label", "key"];

const extractRows = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.rows && Array.isArray(val.rows)) return val.rows;
  if (val.items && Array.isArray(val.items)) return val.items;
  return [];
};

const DisciplineScorecard: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#f0f7ff", borderRadius: 2.5, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }

  let rules: any[] = Array.isArray(data) ? data : extractRows(data.rules || data.items || data.rows || data.scorecard || data.disciplines || data.checks || data.metrics || data.compliance);

  // Build assessment from overall_discipline_score + overall_discipline_rationale, or fall back to other keys
  const overallScore = data.overall_discipline_score;
  const overallRationale = data.overall_discipline_rationale;
  const assessment = overallScore
    ? (overallRationale ? `${overallScore} — ${overallRationale}` : overallScore)
    : data.assessment || data.summary || data.overall_assessment || data.overall_discipline_assessment;

  // If no rules found via known keys, dynamically find the first array or {rows} object
  if (rules.length === 0 && typeof data === "object" && !Array.isArray(data)) {
    for (const [key, val] of Object.entries(data)) {
      if (SKIP_META.includes(key)) continue;
      if (typeof val === "string" || typeof val === "number") continue;
      const extracted = extractRows(val);
      if (extracted.length > 0 && typeof extracted[0] === "object") {
        rules = extracted;
        break;
      }
    }
  }

  if (rules.length === 0 && !assessment) {
    return <GenericDataRenderer data={data} accentColor="#ec4899" />;
  }

  // Detect columns dynamically from the first row
  const dynamicKeys = rules.length > 0 ? Object.keys(rules[0]).filter((k) => !SKIP_META.includes(k)) : [];
  const statusKey = dynamicKeys.find((k) => k.toLowerCase().includes("status") || k.toLowerCase().includes("compliance"));
  const nameKey = dynamicKeys.find((k) => ["rule", "name", "metric", "label", "check", "discipline"].includes(k.toLowerCase())) || dynamicKeys[0];

  const formatHeader = (k: string) => k.replace(/_/g, " ").toUpperCase();
  const isMonospaceCol = (k: string) => ["limit", "actual", "current", "value", "threshold", "model_limit", "deviation", "delta", "difference"].some((s) => k.toLowerCase().includes(s));

  return (
    <Box>
      {rules.length > 0 && dynamicKeys.length > 0 && (
        <Box sx={{ border: "1px solid #c7d2fe", borderRadius: 2.5, overflow: "hidden", mb: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${dynamicKeys.length}, 1fr)`,
            background: "linear-gradient(135deg, #1e293b, #334155)", borderBottom: "2px solid #1e293b" }}>
            {dynamicKeys.map((h) => (
              <Typography key={h} sx={{ px: 2, py: 1.2, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>{formatHeader(h)}</Typography>
            ))}
          </Box>
          {rules.map((row: any, i: number) => {
            const statusVal = statusKey ? row[statusKey] : undefined;
            const sty = statusVal ? getStatusStyle(String(statusVal)) : undefined;
            return (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: `repeat(${dynamicKeys.length}, 1fr)`,
                borderBottom: i < rules.length - 1 ? "1px solid #e0e7ff" : "none", alignItems: "center", "&:hover": { backgroundColor: "#f5f3ff" } }}>
                {dynamicKeys.map((k) => {
                  const val = row[k];
                  const displayVal = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val);
                  const isName = k === nameKey;
                  const isStatus = k === statusKey;
                  if (isStatus && sty) {
                    return (
                      <Box key={k} sx={{ px: 2, py: 1.5 }}>
                        <Chip label={displayVal.toUpperCase()} size="small"
                          sx={{ backgroundColor: sty.bg, color: sty.color, border: `1px solid ${sty.border}`, fontWeight: 700, fontSize: 10, height: 22, letterSpacing: 0.5 }} />
                      </Box>
                    );
                  }
                  return (
                    <Typography key={k} sx={{ px: 2, py: 1.5, fontSize: 13,
                      fontWeight: isName ? 600 : 400,
                      color: isName ? "#1e293b" : "#334155",
                      fontFamily: isMonospaceCol(k) ? "monospace" : "inherit" }}>
                      {displayVal}
                    </Typography>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      )}
      {assessment && (
        <Box sx={{ background: "linear-gradient(135deg, #fef2f2, #fff1f2)", border: "1px solid #fecaca", borderRadius: 2.5, p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#dc2626", mb: 1 }}>
            {(typeof assessment === "object" ? (assessment.label || assessment.title || "Discipline Assessment") : "Discipline Assessment")}
            {typeof assessment === "object" && assessment.grade ? `: ${assessment.grade}` : ""}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
            {typeof assessment === "string" ? assessment : assessment.content || assessment.description || assessment.text}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DisciplineScorecard;
