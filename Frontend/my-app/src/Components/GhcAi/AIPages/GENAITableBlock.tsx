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
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.01em",
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
                      background: "#f1f5f9",
                      borderBottom: "1px solid #e2e8f0",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#000000",
                      py: 1.4,
                      px: 2,
                      whiteSpace: "nowrap",
                      "& p": { margin: 0, fontSize: "0.75rem", fontWeight: 700 },
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
                      fontSize: "0.84rem",
                      color: "#000000",
                      lineHeight: 1.6,
                      "& p": { margin: 0, fontSize: "0.84rem", lineHeight: 1.6 },
                      "& strong": { color: "#000000", fontWeight: 700 },
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
