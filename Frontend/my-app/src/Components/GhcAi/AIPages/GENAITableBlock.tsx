import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

const COLOR_THEMES = [
  {
    bg: "#F3F9F9",
    headerColor: "#0E6251",
    rowHover: "rgba(14, 98, 81, 0.08)",
  },
  {
    bg: "#FEF9E7",
    headerColor: "#9A7D0A",
    rowHover: "rgba(154, 125, 10, 0.08)",
  },
  {
    bg: "#FDEDEC",
    headerColor: "#922B21",
    rowHover: "rgba(146, 43, 33, 0.08)",
  },
  {
    bg: "#F4ECF7",
    headerColor: "#76448A",
    rowHover: "rgba(118, 68, 138, 0.08)",
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
    >
      <Card
        elevation={6}
        sx={{
          my: 3,
          borderRadius: 3,
          bgcolor: theme.bg,
          maxWidth: "100%",
          mx: "auto",
          overflowX: "auto",
        }}
      >
        {title && (
          <CardHeader
            title={<Typography variant="h6" sx={{ color: theme.headerColor }}>{title}</Typography>}
            sx={{ pb: 0 }}
          />
        )}
        <CardContent sx={{ pt: title ? 1 : 2 }}>
          <TableContainer>
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
          </TableContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GENATableBlock;
