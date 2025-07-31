import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

const COLOR_THEMES = [
  {
    headerColor: "#1E3A8A",
    rowHover: "rgba(30, 58, 138, 0.08)",
  },
  {
    headerColor: "#B91C1C",
    rowHover: "rgba(185, 28, 28, 0.08)",
  },
  {
    headerColor: "#0F766E",
    rowHover: "rgba(15, 118, 110, 0.08)",
  },
  {
    headerColor: "#6D28D9",
    rowHover: "rgba(109, 40, 217, 0.08)",
  },
];

const getRandomTheme = () =>
  COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)];

const GENATableBlock: React.FC<{
  headers: string[];
  rows: string[][];
  title?: string;
}> = ({ headers, rows, title }) => {
  const theme = React.useMemo(() => getRandomTheme(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      <Card
        elevation={4}
        sx={{
          borderRadius: 3,
          bgcolor: "#f9fafa",
          width: "100%",        // ✅ Responsive width
          boxSizing: "border-box",
        }}
      >
        {title && (
          <CardHeader
            title={
              <Typography variant="h6" sx={{ color: theme.headerColor }}>
                {title}
              </Typography>
            }
            sx={{ pb: 0 }}
          />
        )}
        <CardContent sx={{ pt: title ? 1 : 2 }}>
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
                <TableRow sx={{ backgroundColor: `${theme.headerColor}20` }}>
                  {headers.map((h, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        fontWeight: "bold",
                        color: theme.headerColor,
                        fontSize: "0.95rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <ReactMarkdown>{h}</ReactMarkdown>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow
                    key={i}
                    sx={{
                      "&:hover": {
                        backgroundColor: theme.rowHover,
                        transition: "background-color 0.3s ease",
                      },
                    }}
                  >
                    {row.map((cell, j) => (
                      <TableCell
                        key={j}
                        sx={{
                          fontSize: "0.875rem",
                          verticalAlign: "top",
                          wordBreak: "break-word",
                        }}
                      >
                        <ReactMarkdown>{cell}</ReactMarkdown>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GENATableBlock;
