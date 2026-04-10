import React from "react";
import { Box, Typography, Button, Chip, Collapse } from "@mui/material";
import { motion } from "framer-motion";
import KeyIcon from "@mui/icons-material/Key";
import { ColumnInfo } from "../types";
import { TYPE_COLORS } from "../constants";

const MotionChip = motion(Chip);

interface ColumnPickerPanelProps {
  open: boolean;
  columns: ColumnInfo[];
  selectedColumns: string[];
  onToggle: (colName: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const ColumnPickerPanel: React.FC<ColumnPickerPanelProps> = ({
  open,
  columns,
  selectedColumns,
  onToggle,
  onSelectAll,
  onClear,
}) => {
  return (
    <Collapse in={open}>
      <Box sx={{ mt: 2.5, pt: 2.5, borderTop: "1px solid #f1f5f9" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Select Columns
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              onClick={onSelectAll}
              sx={{ fontSize: "0.7rem", textTransform: "none", fontWeight: 600 }}
            >
              Select All
            </Button>
            <Button
              size="small"
              onClick={onClear}
              sx={{ fontSize: "0.7rem", textTransform: "none", fontWeight: 600 }}
            >
              Clear
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
          {columns.map((col, i) => {
            const isSelected = selectedColumns.includes(col.name);
            const typeColor = TYPE_COLORS[col.type] || "#64748b";
            return (
              <MotionChip
                key={col.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.01 }}
                whileHover={{ y: -2 }}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {col.is_primary_key && (
                      <KeyIcon sx={{ fontSize: 11, color: "#d97706" }} />
                    )}
                    <span>{col.name}</span>
                    <Typography
                      component="span"
                      sx={{ fontSize: "0.55rem", color: typeColor, ml: 0.3 }}
                    >
                      {col.type}
                    </Typography>
                  </Box>
                }
                size="small"
                onClick={() => onToggle(col.name)}
                sx={{
                  height: 28,
                  fontSize: "0.72rem",
                  fontWeight: isSelected ? 700 : 500,
                  bgcolor: isSelected ? "#eff6ff" : "#f8fafc",
                  color: isSelected ? "#1d4ed8" : "#64748b",
                  border: `1px solid ${isSelected ? "#93c5fd" : "#e2e8f0"}`,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { borderColor: "#3b82f6", bgcolor: "#eff6ff" },
                }}
              />
            );
          })}
        </Box>
      </Box>
    </Collapse>
  );
};

export default ColumnPickerPanel;
