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
import { getRandomBgColor } from "../Utils/colorUtils";
import ReactMarkdown from "react-markdown";

const GENATableBlock: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      my: 2,
      bgcolor: getRandomBgColor(),
      overflowX: "auto"
    }}
  >
    <Typography variant="h6" gutterBottom>
      Data Table
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          {headers.map((h, i) => (
            <TableCell key={i} sx={{ fontWeight: "bold" }}>
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
              <TableCell key={j}>
                <ReactMarkdown>{cell}</ReactMarkdown>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

export default GENATableBlock;
