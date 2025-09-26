import React from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface SectionEditorProps {
  sentence: string;
  index: number;
  isEditing: boolean;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  sentence,
  index,
  isEditing,
  onChange,
  onAdd,
  onRemove,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      {isEditing ? (
        <>
          <TextField
            fullWidth
            value={sentence}
            onChange={(e) => onChange(index, e.target.value)}
            size="small"
          />
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              onClick={onAdd}
              sx={{
                bgcolor: "#e0f7fa",
                "&:hover": { bgcolor: "#b2ebf2" },
                width: 32,
                height: 32,
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onRemove(index)}
              sx={{
                bgcolor: "#ffebee",
                "&:hover": { bgcolor: "#ffcdd2" },
                width: 32,
                height: 32,
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Box>
        </>
      ) : (
        <Typography sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
          • {sentence || "—"}
        </Typography>
      )}
    </Box>
  );
};

export default SectionEditor;
