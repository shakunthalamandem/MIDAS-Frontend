import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Collapse,
} from "@mui/material";
import { motion, AnimatePresence as FramerAnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyIcon from "@mui/icons-material/Key";
import { ColumnInfo, FilterRule } from "../types";
import { OPERATORS, TYPE_COLORS } from "../constants";

// Framer Motion v11 + React 18 type workaround
const AnimatePresence = FramerAnimatePresence as React.FC<{
  children?: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
  initial?: boolean;
}>;
const MotionBox = motion(Box);

interface FilterPanelProps {
  open: boolean;
  columns: ColumnInfo[];
  filters: FilterRule[];
  onUpdate: (id: string, field: keyof FilterRule, value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  open,
  columns,
  filters,
  onUpdate,
  onRemove,
  onAdd,
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
            Filter Conditions
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{ fontSize: "0.7rem", textTransform: "none", fontWeight: 600 }}
            >
              Add Filter
            </Button>
            {filters.length > 0 && (
              <Button
                size="small"
                color="error"
                onClick={onClear}
                sx={{ fontSize: "0.7rem", textTransform: "none", fontWeight: 600 }}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>
        <AnimatePresence>
          {filters.map((f, idx) => (
            <MotionBox
              key={f.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.25 }}
              sx={{ display: "flex", gap: 1.5, mb: 1, alignItems: "center" }}
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel sx={{ fontSize: "0.75rem" }}>Column</InputLabel>
                <Select
                  value={f.column}
                  onChange={(e) => onUpdate(f.id, "column", e.target.value)}
                  label="Column"
                  sx={{ fontSize: "0.78rem" }}
                >
                  {columns.map((col) => (
                    <MenuItem
                      key={col.name}
                      value={col.name}
                      sx={{ fontSize: "0.78rem" }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {col.is_primary_key && (
                          <KeyIcon sx={{ fontSize: 12, color: "#d97706" }} />
                        )}
                        {col.name}
                        <Typography
                          sx={{
                            fontSize: "0.6rem",
                            color: TYPE_COLORS[col.type] || "#94a3b8",
                          }}
                        >
                          {col.type}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel sx={{ fontSize: "0.75rem" }}>Operator</InputLabel>
                <Select
                  value={f.operator}
                  onChange={(e) => onUpdate(f.id, "operator", e.target.value)}
                  label="Operator"
                  sx={{ fontSize: "0.78rem" }}
                >
                  {OPERATORS.map((op) => (
                    <MenuItem
                      key={op.value}
                      value={op.value}
                      sx={{ fontSize: "0.78rem" }}
                    >
                      {op.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {!["IS NULL", "IS NOT NULL"].includes(f.operator) && (
                <TextField
                  size="small"
                  placeholder="Value..."
                  value={f.value}
                  onChange={(e) => onUpdate(f.id, "value", e.target.value)}
                  sx={{ minWidth: 200, "& input": { fontSize: "0.78rem" } }}
                />
              )}
              <IconButton
                size="small"
                onClick={() => onRemove(f.id)}
                sx={{
                  color: "#ef4444",
                  transition: "transform 0.15s",
                  "&:hover": { transform: "scale(1.15)" },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </MotionBox>
          ))}
        </AnimatePresence>
      </Box>
    </Collapse>
  );
};

export default FilterPanel;
