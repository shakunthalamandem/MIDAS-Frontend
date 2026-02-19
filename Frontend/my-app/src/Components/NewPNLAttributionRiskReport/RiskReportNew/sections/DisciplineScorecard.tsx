import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface Props {
  data: any;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  fail: { bg: "#fef2f2", color: "#dc2626" },
  breach: { bg: "#fff7ed", color: "#ea580c" },
  warning: { bg: "#fffbeb", color: "#d97706" },
  pass: { bg: "#ecfdf5", color: "#059669" },
  unverifiable: { bg: "#f1f5f9", color: "#64748b" },
};

const getStatusStyle = (status: string) => {
  const key = status?.toLowerCase() || "";
  return statusColors[key] || statusColors.warning;
};

const DisciplineScorecard: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const rules: any[] = Array.isArray(data) ? data : data.rules || data.items || [];
  const assessment = data.assessment;

  const headers = ["RULE", "MODEL LIMIT", "ACTUAL", "DEVIATION", "STATUS"];

  return (
    <Box>
      {/* Table */}
      {rules.length > 0 && (
        <Box
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            overflow: "hidden",
            mb: 3,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1.3fr 1.3fr 0.8fr",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {headers.map((h) => (
              <Typography
                key={h}
                sx={{
                  px: 2,
                  py: 1.2,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#475569",
                }}
              >
                {h}
              </Typography>
            ))}
          </Box>

          {/* Rows */}
          {rules.map((row: any, i: number) => {
            const sty = getStatusStyle(row.status);
            return (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1.3fr 1.3fr 0.8fr",
                  borderBottom: i < rules.length - 1 ? "1px solid #f1f5f9" : "none",
                  alignItems: "center",
                  "&:hover": { backgroundColor: "#fafbfc" },
                }}
              >
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                >
                  {row.rule}
                </Typography>
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, color: "#64748b", fontFamily: "monospace" }}
                >
                  {row.model_limit}
                </Typography>
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569", fontFamily: "monospace" }}
                >
                  {row.actual}
                </Typography>
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569" }}
                >
                  {row.deviation}
                </Typography>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Chip
                    label={row.status?.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: sty.bg,
                      color: sty.color,
                      fontWeight: 700,
                      fontSize: 10,
                      height: 22,
                      letterSpacing: 0.5,
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Assessment Box */}
      {assessment && (
        <Box
          sx={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 2,
            p: 2.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 14,
              color: "#dc2626",
              mb: 1,
            }}
          >
            {assessment.label || assessment.title || "Discipline Assessment"}
            {assessment.grade && `: ${assessment.grade}`}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
            {assessment.content || assessment.description || assessment.text}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DisciplineScorecard;
