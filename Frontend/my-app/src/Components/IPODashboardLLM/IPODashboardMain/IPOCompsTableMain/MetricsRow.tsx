import React from "react";
import { TableRow, TableCell, TextField, IconButton } from "@mui/material";
import { Edit, Save, Delete } from "@mui/icons-material";

interface MetricsRowProps {
  row: any;
  idx: number;
  editIndex: number | null;
  setEditIndex: (idx: number | null) => void;
  onSave: (idx: number) => void;
  onDelete: (row: any, idx: number) => void;
  onChangeCell: (rowIndex: number, key: string, value: string) => void; 
  columns: { key: string; label: string; minWidth?: number }[];
  formatValue: (key: string, value: any) => string | number;
}

const MetricsRow: React.FC<MetricsRowProps> = ({
  row,
  idx,
  editIndex,
  setEditIndex,
  onSave,
  onDelete,
  onChangeCell,
  columns,
  formatValue,
}) => {
  const isFirstRow =
    idx === 0 &&
    (row.ticker === row.competitor || row.competitor.startsWith(row.ticker));

  return (
    <TableRow sx={{ backgroundColor: isFirstRow ? "#f2e1d9ff" : "inherit" }}>
      {columns.map((col) => (
        <TableCell key={col.key} align="center">
          {isFirstRow && editIndex === idx && col.key !== "competitor" ? (
            <TextField
              size="small"
              value={row[col.key] ?? ""}
              onChange={(e) => onChangeCell(idx, col.key, e.target.value)}
            />
          ) : (
            formatValue(col.key, row[col.key])
          )}
        </TableCell>
      ))}

      <TableCell align="center">
        {isFirstRow ? (
          editIndex === idx ? (
            <IconButton onClick={() => onSave(idx)} sx={{ color: "#002060" }}>
              <Save fontSize="small" />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => setEditIndex(idx)}
              sx={{ color: "#002060" }}
            >
              <Edit fontSize="small" />
            </IconButton>
          )
        ) : (
          <IconButton onClick={() => onDelete(row, idx)} sx={{ color: "red" }}>
            <Delete fontSize="small" />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};

export default MetricsRow;
