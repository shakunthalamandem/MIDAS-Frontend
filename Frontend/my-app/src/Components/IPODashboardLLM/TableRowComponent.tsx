import React from "react";
import { TableCell, TableRow, IconButton } from "@mui/material";
import { Remove } from "@mui/icons-material";

interface Props {
  row: Record<string, any>;
  columns: { key: string; label: string }[];
  onDelete: () => void;
}

const formatValue = (value: any) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "number") return value.toFixed(2);
  if (!isNaN(Number(value)) && value !== "") {
    return Number(value).toFixed(2);
  }
  return String(value);
};

const TableRowComponent: React.FC<Props> = ({ row, columns, onDelete }) => {
  return (
    <TableRow hover>
      {columns.map((col, index) => (
        <TableCell
          key={col.key}
          align="center"
          component={index === 0 ? "th" : "td"} // keep ticker as header
        >
          {formatValue(row[col.key])}
        </TableCell>
      ))}
      <TableCell align="center">
        <IconButton onClick={onDelete} color="error" size="small">
          <Remove />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default TableRowComponent;
