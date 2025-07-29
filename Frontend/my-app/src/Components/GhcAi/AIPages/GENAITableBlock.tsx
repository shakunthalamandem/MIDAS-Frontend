import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import ReactMarkdown from "react-markdown";

const GENATableBlock: React.FC<{ headers: string[]; rows: string[][] }> = ({
  headers,
  rows
}) => {
  // Calculate width per column in %
  const colWidth = headers.length > 0 ? `${100 / headers.length}%` : "auto";

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1.5,           // Reduced padding
        my: 1.5,          // Reduced vertical margin
        bgcolor: "#ffffff",
        borderRadius: 2,
        boxShadow: 3,
        overflowX: "auto",
        maxWidth: 800,     // Limit max width (adjust as needed)
        mx: "auto",       // Center horizontally
      }}
    >
      <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
        <TableHead>
          <TableRow>
            {headers.map((h, i) => (
              <TableCell
                key={i}
                sx={{
                  fontWeight: "bold",
                  width: colWidth,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#002060",
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
              sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.03)" } }}
            >
              {row.map((cell, j) => (
                <TableCell
                  key={j}
                  sx={{
                    width: colWidth,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <ReactMarkdown>{cell}</ReactMarkdown>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default GENATableBlock;
