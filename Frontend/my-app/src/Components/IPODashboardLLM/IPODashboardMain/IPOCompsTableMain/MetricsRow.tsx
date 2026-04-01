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
  showActions?: boolean;
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
  showActions = true,
}) => {
  const normalize = (s: string) => s.replace(/-/g, " ").trim().toLowerCase();
  const isFirstRow =
    idx === 0 &&
    (normalize(row.ticker) === normalize(row.competitor) ||
      normalize(row.competitor).startsWith(normalize(row.ticker)));
  const bodyCellSx = {
    fontSize: "0.75rem",
    padding: "6px 8px",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  };

  const formatCompetitorText = (text: string) => {
    if (!text) return text;

    // apply ONLY for single word
    if (!text.includes(" ") && text.length > 7) {
      return (
        <>
          {text.slice(0, 7)}
          <br />
          {text.slice(7)}
        </>
      );
    }

    return text;
  };

  return (
    <TableRow sx={{ backgroundColor: isFirstRow ? "#f2e1d9ff" : "inherit" }}>
      {columns.map((col) => (
        <TableCell
          key={col.key}
          align="center"
          sx={
            col.key === "competitor"
              ? {
                ...bodyCellSx,
                whiteSpace: "normal",
              }
              : bodyCellSx
          }
        >
          {isFirstRow && editIndex === idx && col.key !== "competitor" ? (
            <TextField
              size="small"
              value={row[col.key] ?? ""}
              onChange={(e) => onChangeCell(idx, col.key, e.target.value)}
              inputProps={{
                style: { fontSize: "0.75rem", padding: "6px 8px" },
              }}
            />
          ) : (
            col.key === "competitor"
              ? formatCompetitorText(row[col.key])
              : formatValue(col.key, row[col.key])
          )}
        </TableCell>
      ))}

      {showActions && (
        <TableCell align="center" sx={bodyCellSx}>
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
      )}
    </TableRow>
  );
};

export default MetricsRow;
