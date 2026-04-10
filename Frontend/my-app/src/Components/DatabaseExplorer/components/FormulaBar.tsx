import React from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Paper,
} from "@mui/material";
import { motion, AnimatePresence as FramerAnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import CalculateIcon from "@mui/icons-material/Calculate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ColumnInfo, ComputedField, FormulaType } from "../types";
import { FORMULA_FUNCTIONS, NUMERIC_PG_TYPES } from "../constants";
import { computeFormula } from "../utils";

// Framer Motion v11 + React 18 type workaround
const AnimatePresence = FramerAnimatePresence as React.FC<{
  children?: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
  initial?: boolean;
}>;
const MotionBox = motion(Box);

interface FormulaBarProps {
  columns: ColumnInfo[];
  rows: any[];
  computedFields: ComputedField[];
  setComputedFields: React.Dispatch<React.SetStateAction<ComputedField[]>>;
  pageSize: number;
}

const FormulaBar: React.FC<FormulaBarProps> = ({
  columns,
  rows,
  computedFields,
  setComputedFields,
  pageSize,
}) => {
  const numericColumns = columns.filter((c) => NUMERIC_PG_TYPES.has(c.type));

  const addFormula = () => {
    setComputedFields((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: "",
        formula: "SUM",
        column: "",
        result: null,
      },
    ]);
  };

  const updateFormula = (
    id: string,
    field: "formula" | "column",
    value: string
  ) => {
    setComputedFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, [field]: value, result: null } : f
      )
    );
  };

  const calculateFormula = (id: string) => {
    setComputedFields((prev) =>
      prev.map((f) => {
        if (f.id !== id || !f.column) return f;
        const values = rows.map((r) => {
          const v = r[f.column];
          return v !== null && v !== undefined ? parseFloat(v) : null;
        });
        const result = computeFormula(f.formula, values);
        return {
          ...f,
          result,
          label: `${f.formula}(${f.column})`,
        };
      })
    );
  };

  const removeFormula = (id: string) => {
    setComputedFields((prev) => prev.filter((f) => f.id !== id));
  };

  if (numericColumns.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        mb: 2.5,
        background: "linear-gradient(135deg, #faf5ff 0%, #f5f3ff 50%, #ede9fe 100%)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: computedFields.length > 0 ? 2 : 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalculateIcon sx={{ fontSize: 18, color: "#7c3aed" }} />
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#5b21b6",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Formula Builder
          </Typography>
          <Chip
            icon={<InfoOutlinedIcon sx={{ fontSize: 12, color: "#8b5cf6 !important" }} />}
            label={`Computed on current page (${Math.min(rows.length, pageSize)} rows)`}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.6rem",
              bgcolor: "rgba(139,92,246,0.1)",
              color: "#7c3aed",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          />
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={addFormula}
          sx={{
            fontSize: "0.72rem",
            textTransform: "none",
            fontWeight: 600,
            color: "#7c3aed",
            "&:hover": { bgcolor: "rgba(139,92,246,0.08)" },
          }}
        >
          Add Formula
        </Button>
      </Box>

      <AnimatePresence>
        {computedFields.map((cf, idx) => (
          <MotionBox
            key={cf.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              mb: 1,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ fontSize: "0.75rem" }}>Function</InputLabel>
              <Select
                value={cf.formula}
                onChange={(e) =>
                  updateFormula(cf.id, "formula", e.target.value as string)
                }
                label="Function"
                sx={{ fontSize: "0.78rem", bgcolor: "#fff" }}
              >
                {FORMULA_FUNCTIONS.map((fn) => (
                  <MenuItem key={fn} value={fn} sx={{ fontSize: "0.78rem" }}>
                    {fn}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontSize: "0.75rem" }}>
                Numeric Column
              </InputLabel>
              <Select
                value={cf.column}
                onChange={(e) =>
                  updateFormula(cf.id, "column", e.target.value as string)
                }
                label="Numeric Column"
                sx={{ fontSize: "0.78rem", bgcolor: "#fff" }}
              >
                {numericColumns.map((col) => (
                  <MenuItem
                    key={col.name}
                    value={col.name}
                    sx={{ fontSize: "0.78rem" }}
                  >
                    {col.name}
                    <Typography
                      component="span"
                      sx={{ fontSize: "0.6rem", color: "#7c3aed", ml: 1 }}
                    >
                      {col.type}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              size="small"
              variant="contained"
              onClick={() => calculateFormula(cf.id)}
              disabled={!cf.column}
              sx={{
                bgcolor: "#7c3aed",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: 2,
                minWidth: 90,
                "&:hover": { bgcolor: "#6d28d9" },
                "&:disabled": { bgcolor: "#ddd6fe" },
              }}
            >
              Calculate
            </Button>
            {cf.result !== null && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Chip
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography
                        component="span"
                        sx={{ fontSize: "0.68rem", color: "#7c3aed", fontWeight: 600 }}
                      >
                        {cf.label}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#1e293b" }}
                      >
                        ={" "}
                        {typeof cf.result === "number"
                          ? cf.result.toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })
                          : cf.result}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    height: 30,
                    bgcolor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                />
              </MotionBox>
            )}
            <IconButton
              size="small"
              onClick={() => removeFormula(cf.id)}
              sx={{
                color: "#ef4444",
                "&:hover": { transform: "scale(1.15)" },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </MotionBox>
        ))}
      </AnimatePresence>
    </Paper>
  );
};

export default FormulaBar;
