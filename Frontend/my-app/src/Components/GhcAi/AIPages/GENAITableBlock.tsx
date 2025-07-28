import React from "react";
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { getRandomBgColor } from "../Utils/colorUtils";

const GENATableBlock: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
  <Paper elevation={3} sx={{ p: 2, my: 2, bgcolor: getRandomBgColor() }}>
    <Typography variant="h6" gutterBottom>Data Table</Typography>
    <Table>
      <TableHead>
        <TableRow>{headers.map((h, i) => <TableCell key={i}><strong>{h}</strong></TableCell>)}</TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

export default GENATableBlock;
