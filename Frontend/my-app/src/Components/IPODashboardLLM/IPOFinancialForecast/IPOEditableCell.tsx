import React from "react";
import { TextField, TableCell } from "@mui/material";

interface IPOEditableCellProps {
  isEditable: boolean;
  value: any;
  onChange: (val: string) => void;
  isEvenRow: boolean;
  isHighlightColumn: boolean;
  renderAsPercent: boolean;
  formatter: (val: any) => string;
}

const IPOEditableCell: React.FC<IPOEditableCellProps> = ({
  isEditable,
  value,
  onChange,
  isEvenRow,
  isHighlightColumn,
  renderAsPercent,
  formatter,
}) => {
  return (
    <TableCell
      align="center"
      sx={{
        borderBottom: "1px solid #e3e7f3",
        fontStyle: isEvenRow ? "normal" : "italic",
        fontSize: isEvenRow ? "1.3rem" : "1.1rem",
        backgroundColor: isHighlightColumn ? "#f6f7fb" : "transparent",
        color: "#000000",
      }}
    >
      {isEditable ? (
        <TextField
          variant="outlined"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{
            style: {
              fontSize: "1rem",
              textAlign: "center",
              padding: "6px 8px",
            },
          }}
          sx={{
            width: "100%",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": { padding: 0 },
            "& .MuiInputBase-input": { height: "1.5rem" },
          }}
        />
      ) : renderAsPercent ? (
        formatter(value)
      ) : (
        formatter(value)
      )}
    </TableCell>
  );
};

export default IPOEditableCell;
