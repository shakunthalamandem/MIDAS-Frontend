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
      <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 3, p: 3 }}>
        <Typography sx={{ fontSize: 15, color: "#334155", lineHeight: 1.7 }}>
          {data}
        </Typography>
      </Box>
    );
  }

  let rules: any[] =
    Array.isArray(data)
      ? data
      : extractRows(
          data.rules ||
            data.items ||
            data.rows ||
            data.scorecard ||
            data.disciplines ||
            data.checks ||
            data.metrics ||
            data.compliance
        );

  const overallScore = data.overall_discipline_score;
  const overallRationale = data.overall_discipline_rationale;

  const assessment = overallScore
    ? overallRationale
      ? `${overallScore} — ${overallRationale}`
      : overallScore
    : data.assessment ||
      data.summary ||
      data.overall_assessment ||
      data.overall_discipline_assessment;

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

  const dynamicKeys =
    rules.length > 0
      ? Object.keys(rules[0]).filter((k) => !SKIP_META.includes(k))
      : [];

  const statusKey = dynamicKeys.find(
    (k) =>
      k.toLowerCase().includes("status") ||
      k.toLowerCase().includes("compliance")
  );

  const nameKey =
    dynamicKeys.find((k) =>
      ["rule", "name", "metric", "label", "check", "discipline"].includes(
        k.toLowerCase()
      )
    ) || dynamicKeys[0];

  const formatHeader = (k: string) =>
    k
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Box>
      {rules.length > 0 && dynamicKeys.length > 0 && (
        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: "#ffffff",
            boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
            border: "1px solid #e2e8f0",
            mb: 4,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${dynamicKeys.length}, 1fr)`,
              backgroundColor: "#f1f5f9",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {dynamicKeys.map((h) => (
              <Typography
                key={h}
                sx={{
                  px: 3,
                  py: 2,
                  fontSize: 13,
                  fontWeight: 600,
                color: "#053b89",
                }}
              >
                {formatHeader(h)}
              </Typography>
            ))}
          </Box>

          {/* Rows */}
          {rules.map((row: any, i: number) => {
            const statusVal = statusKey ? row[statusKey] : undefined;
            const sty = statusVal
              ? getStatusStyle(String(statusVal))
              : undefined;

            return (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${dynamicKeys.length}, 1fr)`,
                  borderBottom:
                    i < rules.length - 1
                      ? "1px solid #f1f5f9"
                      : "none",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                {dynamicKeys.map((k) => {
                  const val = row[k];
                  const displayVal =
                    val === null || val === undefined
                      ? "—"
                      : typeof val === "object"
                      ? JSON.stringify(val)
                      : String(val);

                  const isName = k === nameKey;
                  const isStatus = k === statusKey;

                  if (isStatus && sty) {
                    return (
                      <Box key={k} sx={{ px: 3, py: 2 }}>
                        <Chip
                          label={displayVal.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: sty.bg,
                            color: sty.color,
                            border: `1px solid ${sty.border}`,
                            fontWeight: 600,
                            fontSize: 11,
                            borderRadius: "999px",
                            px: 1,
                          }}
                        />
                      </Box>
                    );
                  }

                  return (
                    <Typography
                      key={k}
                      sx={{
                        px: 3,
                        py: 2,
                        fontSize: 14,
                        fontWeight: isName ? 600 : 400,
                        color: isName ? "#0f172a" : "#334155",
                        lineHeight: 1.6,
                      }}
                    >
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
        <Box
          sx={{
            background: "linear-gradient(135deg, #fef2f2, #fff1f2)",
            border: "1px solid #fecaca",
            borderRadius: 3,
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 15,
              color: "#b91c1c",
              mb: 1,
            }}
          >
            Discipline Assessment
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              color: "#000000",
              lineHeight: 1.7,
            }}
          >
            {typeof assessment === "string"
              ? assessment
              : assessment.content ||
                assessment.description ||
                assessment.text}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DisciplineScorecard;