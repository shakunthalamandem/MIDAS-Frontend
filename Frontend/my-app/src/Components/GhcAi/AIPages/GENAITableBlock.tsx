import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

// Header color palette - one color per table
const HEADER_COLORS = [
  { bg: "#eef2ff", color: "#4f46e5", border: "#c7d2fe" },
  { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  { bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc" },
  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
];

const getTableHeaderColor = (title?: string) => {
  const seed = title ? title.charCodeAt(0) : Math.floor(Math.random() * HEADER_COLORS.length);
  return HEADER_COLORS[seed % HEADER_COLORS.length];
};

const GENATableBlock: React.FC<{
  headers: (string | number)[];
  rows: (string | number)[][];
  title?: string;
}> = ({ headers, rows, title }) => {
  const normalizedHeaders = React.useMemo(
    () => headers.map((h) => String(h)),
    [headers]
  );

  const normalizedRows = React.useMemo(
    () => rows.map((row) => row.map((cell) => String(cell))),
    [rows]
  );

  const tableHeaderColor = React.useMemo(
    () => getTableHeaderColor(title),
    [title]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      <Box
        sx={{
          borderRadius: 2.5,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          overflow: "hidden",
          width: "100%",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {title && (
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "#0f172a",
                letterSpacing: "-0.01em",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {title}
            </Typography>
          </Box>
        )}

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table
            size="small"
            sx={{
              width: "100%",
              tableLayout: "auto",
              wordBreak: "break-word",
            }}
          >
            <TableHead>
              <TableRow>
                {normalizedHeaders.map((h, i) => (
                  <TableCell
                    key={i}
                    sx={{
                      background: tableHeaderColor.bg,
                      borderBottom: `2px solid ${tableHeaderColor.border}`,
                      fontWeight: 500,
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: tableHeaderColor.color,
                      py: 1.6,
                      px: 2.5,
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                      fontFamily: "'Inter', sans-serif",
                      "& p": { margin: 0, fontSize: "0.8rem", fontWeight: 500, fontFamily: "'Inter', sans-serif" },
                      "&:hover": {
                        background: tableHeaderColor.border,
                        color: "#ffffff",
                        boxShadow: `inset 0 0 0 1px ${tableHeaderColor.color}`,
                      },
                    }}
                  >
                    <ReactMarkdown>{h}</ReactMarkdown>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {normalizedRows.map((row, i) => (
                <TableRow
                  key={i}
                  sx={{
                    transition: "background-color 0.15s ease",
                    background: i % 2 === 0 ? "transparent" : "#fafbfc",
                    "&:hover": {
                      background: "#f0f4ff",
                    },
                    "& td": {
                      borderBottom: "1px solid #f1f5f9",
                      py: 1.3,
                      px: 2,
                      fontSize: "0.9rem",
                      color: "#374151",
                      lineHeight: 1.7,
                      fontWeight: 300,
                      fontFamily: "'Inter', sans-serif",
                      "& p": { margin: 0, fontSize: "0.9rem", lineHeight: 1.7, fontWeight: 300, fontFamily: "'Inter', sans-serif" },
                      "& strong": { color: "#0f172a", fontWeight: 500, fontFamily: "'Inter', sans-serif" },
                    },
                  }}
                >
                  {row.map((cell, j) => (
                    <TableCell key={j}>
                      <ReactMarkdown>{cell}</ReactMarkdown>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </motion.div>
  );
};

export default GENATableBlock;
