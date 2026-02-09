import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { FinancialHighlights } from "../types/FOWriteUpData";

interface FOWriteUpMetaDataFinancialHighlightsProps {
  ticker: string;
  pricing_date?: string;
  unique_deal_id?: string;
  data?: FinancialHighlights;
  onUpdate?: () => void;
}

const financialFields: {
  label: string;
  currentKey: keyof FinancialHighlights;
  previousKey: keyof FinancialHighlights;
  changeKey: keyof FinancialHighlights;
}[] = [
  {
    label: "Total Revenue",
    currentKey: "total_revenue_current_year",
    previousKey: "total_revenue_previous_year",
    changeKey: "total_revenue_yoy_change",
  },
  {
    label: "Gross Profit",
    currentKey: "gross_profit_current_year",
    previousKey: "gross_profit_previous_year",
    changeKey: "gross_profit_yoy_change",
  },
  {
    label: "Operating Income",
    currentKey: "operating_income_current_year",
    previousKey: "operating_income_previous_year",
    changeKey: "operating_income_yoy_change",
  },
  {
    label: "Net Income",
    currentKey: "net_income_current_year",
    previousKey: "net_income_previous_year",
    changeKey: "net_income_yoy_change",
  },
];

const formatValue = (value: number | undefined) => {
  if (value === undefined || value === null) return "N/A";
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const formatPercentage = (value: number | undefined) => {
  if (value === undefined || value === null) return "N/A";
  return `${Number(value).toFixed(2)}%`;
};

const FOWriteUpMetaDataFinancialHighlights: React.FC<FOWriteUpMetaDataFinancialHighlightsProps> = ({
  ticker,
  pricing_date,
  unique_deal_id,
  data: initialData,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<FinancialHighlights>(initialData ?? {});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(initialData ?? {});
  }, [initialData]);

  const handleChange = (key: keyof FinancialHighlights, value: string) => {
    const parsed = parseFloat(value);
    setFormData({ ...formData, [key]: isNaN(parsed) ? undefined : parsed });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload: Record<string, any> = {
        ticker,
        unique_deal_id,
        pricing_date,
        financial_highlights: formData,
      };

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setEditMode(false);
        onUpdate?.();
      } else {
        console.error("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        borderRadius: 16,
        background: "linear-gradient(#f0f5ff)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        padding: "20px",
        position: "relative",
      }}
    >
      <IconButton
        onClick={() => (editMode ? handleSave() : setEditMode(true))}
        disabled={saving}
        sx={{ position: "absolute", top: 12, right: 12, color: "#002060" }}
      >
        {saving ? <CircularProgress size={20} /> : editMode ? <SaveIcon /> : <EditIcon />}
      </IconButton>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#026269", mb: 3 }}>
        Financial Highlights
      </Typography>

      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            "& th, & td": {
              padding: "12px 16px",
              textAlign: "left",
              borderBottom: "1px solid #e0e0e0",
            },
            "& th": {
              fontWeight: 600,
              color: "#124180",
              backgroundColor: "#f5f8ff",
            },
            "& td": {
              color: "#333333",
            },
          }}
        >
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current Year</th>
              <th>Previous Year</th>
              <th>YoY Change</th>
            </tr>
          </thead>
          <tbody>
            {financialFields.map((field) => (
              <tr key={field.label}>
                <td style={{ fontWeight: 600 }}>{field.label}</td>
                <td>
                  {editMode ? (
                    <TextField
                      size="small"
                      type="number"
                      value={formData[field.currentKey] ?? ""}
                      onChange={(e) => handleChange(field.currentKey, e.target.value)}
                      sx={{ width: "120px" }}
                    />
                  ) : (
                    formatValue(formData[field.currentKey])
                  )}
                </td>
                <td>
                  {editMode ? (
                    <TextField
                      size="small"
                      type="number"
                      value={formData[field.previousKey] ?? ""}
                      onChange={(e) => handleChange(field.previousKey, e.target.value)}
                      sx={{ width: "120px" }}
                    />
                  ) : (
                    formatValue(formData[field.previousKey])
                  )}
                </td>
                <td>
                  {editMode ? (
                    <TextField
                      size="small"
                      type="number"
                      value={formData[field.changeKey] ?? ""}
                      onChange={(e) => handleChange(field.changeKey, e.target.value)}
                      sx={{ width: "100px" }}
                    />
                  ) : (
                    <Typography
                      component="span"
                      sx={{
                        color:
                          formData[field.changeKey] !== undefined
                            ? formData[field.changeKey]! > 0
                              ? "#2e7d32"
                              : formData[field.changeKey]! < 0
                              ? "#d32f2f"
                              : "#333333"
                            : "#333333",
                        fontWeight: 500,
                      }}
                    >
                      {formatPercentage(formData[field.changeKey])}
                    </Typography>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </motion.div>
  );
};

export default FOWriteUpMetaDataFinancialHighlights;
