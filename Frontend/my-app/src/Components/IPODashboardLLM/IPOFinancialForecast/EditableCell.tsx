import React from "react";
import { TextField, TableCell } from "@mui/material";

interface EditableCellProps {
  isEditable: boolean;
  value: any;
  onChange: (val: string) => void;
  isEvenRow: boolean;
  isHighlightColumn: boolean;
  renderAsPercent: boolean;
  formatter: (val: any) => string;
}

const EditableCell: React.FC<EditableCellProps> = ({
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
        border: "1px solid #000000",
        fontStyle: isEvenRow ? "normal" : "italic",
        fontSize:isEvenRow ? "1.3rem": "1.1rem",
        backgroundColor: isHighlightColumn
          ? "rgba(248, 247, 245, 1)"
          : isEvenRow
            ? ""
            : "#ebebeb",
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

export default EditableCell;
