import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Stack,
  TextField,
  Typography,
  Radio,
  Divider,
  Chip,
  Alert,
  IconButton,
  Collapse,
  Grid,
} from "@mui/material";
import { CheckCircle, Cancel, Edit, Save } from "@mui/icons-material";
import { SectionCard } from "./SectionCard";

// ─── Types ──────────────────────────────────────────────────────────────────
type IOILevel = "low" | "average" | "high" | "custom";

interface IOIOption {
  level: IOILevel;
  label: string;
  percentage: number;
  description: string;
}

interface IOIComponentProps {
  deal_size: number;
  ioi_dollar_value?: number;
  onSave?: (amount: number) => Promise<void> | void;
  onCancel?: () => void;
  saving?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const IOI_OPTIONS: IOIOption[] = [
  {
    level: "low",
    label: "Low",
    percentage: 5,
    description: "5% of deal size",
  },
  {
    level: "average",
    label: "Average",
    percentage: 10,
    description: "10% of deal size",
  },
  {
    level: "high",
    label: "High",
    percentage: 25,
    description: "25% of deal size",
  },
];

// ─── Utility Functions ───────────────────────────────────────────────────────
/**
 * Formats number as currency (millions)
 */
function formatCurrency(value: number): string {
  return `$${(value / 1_000_000)}M`;
}

/**
 * Calculates IOI amount based on deal size and percentage
 */
function calculateIOIAmount(dealSize: number, percentage: number): number {
  return (dealSize * percentage) / 100;
}

/**
 * Calculates percentage of custom amount relative to deal size
 */
function calculatePercentageOfDeal(customAmount: number, dealSize: number): number {
  if (dealSize === 0) return 0;
  return (customAmount * 1_000_000 / dealSize) * 100;
}

/**
 * Validates custom amount input
 */
function isValidCustomAmount(value: string, dealSize: number): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num <= dealSize;
}

// ─── IOIOptionCard Component (VERTICAL SPLIT) ────────────────────────────────
interface IOIOptionCardProps {
  option: IOIOption;
  amount: number;
  isSelected: boolean;
  onSelect: () => void;
  isEditMode: boolean;
}

function IOIOptionCard({
  option,
  amount,
  isSelected,
  onSelect,
  isEditMode,
}: IOIOptionCardProps) {
  return (
    <Card
      onClick={isEditMode ? onSelect : undefined}
      sx={{
        position: "relative",
        overflow: "hidden",
        cursor: isEditMode ? "pointer" : "default",
        p: 1.5,
        borderRadius: 1.25,
        border: isSelected ? "2px solid #2563eb" : "1px solid #e5e7ef",
        background: isSelected
          ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
          : "#ffffff",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isSelected
          ? "0 4px 12px rgba(37, 99, 235, 0.15)"
          : "0 1px 3px rgba(0, 0, 0, 0.03)",
        opacity: isEditMode ? 1 : 0.7,
        height: "75%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "&:hover": isEditMode
          ? {
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
              borderColor: "#2563eb",
            }
          : {},
      }}
    >
      {/* Top accent line */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: isSelected
            ? "linear-gradient(90deg, #2563eb, #3b82f6)"
            : "transparent",
          transition: "all 0.3s ease",
        }}
      />

      {/* Content */}
        <Stack spacing={0.85} sx={{ mt: 0.3 }}>
        {/* Header with label */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            {isEditMode && (
              <Radio
                checked={isSelected}
                onChange={onSelect}
                sx={{
                  ml: -1,
                  p: 0.5,
                  "& .MuiSvgIcon-root": {
                    fontSize: 18,
                  },
                }}
              />
            )}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: isSelected ? "#1e40af" : "#1d2b5a",
                fontSize: "0.95rem",
              }}
            >
              {option.label}
            </Typography>
          </Box>
          <Chip
            label={`${option.percentage}%`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              background: isSelected ? "#2563eb" : "#f3f4f6",
              color: isSelected ? "#ffffff" : "#4b5563",
              borderRadius: 1,
            }}
          />
        </Box>

        {/* Amount */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: isSelected ? "#2563eb" : "#1d2b5a",
              fontSize: "1.1rem",
              transition: "all 0.3s ease",
            }}
          >
            {formatCurrency(amount)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#6b7280",
              fontWeight: 600,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: 0.2,
              mt: 0.5,
              display: "block",
            }}
          >
            {option.description}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

// ─── Main IOI Component ──────────────────────────────────────────────────────
export function IOI({
  deal_size,
  ioi_dollar_value,
  onSave,
  onCancel,
  saving = false,
}: IOIComponentProps) {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<IOILevel>("average");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customError, setCustomError] = useState<string>("");

  // Calculate amounts
  const selectedOption = IOI_OPTIONS.find((opt) => opt.level === selectedLevel);
  const selectedAmount =
    selectedLevel === "custom"
      ? parseFloat(customAmount) * 1_000_000 || 0
      : selectedOption
        ? calculateIOIAmount(deal_size, selectedOption.percentage)
        : 0;

  // Calculate percentage for custom amount
  const customPercentage = customAmount 
    ? calculatePercentageOfDeal(parseFloat(customAmount), deal_size)
    : 0;

  // Handle custom amount change
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setCustomError("");

    if (value && !isValidCustomAmount(value, deal_size / 1_000_000)) {
      setCustomError(
        `Amount must be between 0 and ${(deal_size / 1_000_000).toFixed(2)}M`
      );
    }
  };

  // Handle selection change
  const handleLevelChange = (level: IOILevel) => {
    setSelectedLevel(level);
    setCustomAmount("");
    setCustomError("");
  };

  // Handle save
  const handleSave = async () => {
    if (selectedLevel === "custom") {
      if (!customAmount || customError) {
        setCustomError("Please enter a valid custom amount");
        return;
      }
      await onSave?.(parseFloat(customAmount) * 1_000_000);
    } else {
      await onSave?.(selectedAmount);
    }
    setIsEditMode(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditMode(false);
    setCustomAmount("");
    setCustomError("");
    setSelectedLevel("average");
    onCancel?.();
  };

  // Handle edit mode
  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  return (
  <SectionCard title="Indication of Interest">


    <Card
      sx={{
        borderRadius: 2.5,
        border: "1px solid #e5e7ef",
        background: isEditMode
          ? "linear-gradient(135deg, #f5f7fa 0%, #f8f9fb 100%)"
          : "#ffffff",
        transition: "all 0.3s ease",
        boxShadow: isEditMode
          ? "0 8px 24px rgba(72, 100, 170, 0.12)"
          : "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header Section */}
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          
          <Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#2563eb",
                    fontWeight: 600,
                    // textTransform: "uppercase",
                    fontSize: "0.9rem",
                    letterSpacing: 0.5,
                  }}
                >
                  Deal Size:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    color: "#1d2b5a",
                    fontSize: "1rem",
                  }}
                >
                  {formatCurrency(deal_size)}
                </Typography>
              </Box>
              {!isEditMode && ioi_dollar_value !== undefined && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#2563eb",
                    fontSize: "0.95rem",
                  }}
                >
                  Indication of Interest: {formatCurrency(ioi_dollar_value)}
                </Typography>
              )}
            </Box>
          </Box>

        {/* Action buttons */}
        <Stack direction="row" spacing={1}>
          {!isEditMode ? (
            <IconButton
              onClick={handleEnterEditMode}
              size="small"
              sx={{
                background: "#f3f4f6",
                color: "#4b5563",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "#2563eb",
                  color: "#ffffff",
                },
              }}
            >
              <Edit sx={{ fontSize: 18 }} />
            </IconButton>
          ) : (
            <>

              <IconButton
                onClick={handleSave}
                disabled={(selectedLevel === "custom" && !!customError) || saving}
                size="small"
                sx={{
                  // background: "#16a34a",
                  color: "#4947da",
                  // "&:hover": {
                  //   background: "#15803d",
                  // },
                }}
              >
                <Save />
              </IconButton>
                            <IconButton
                onClick={handleCancel}
                size="small"
                sx={{
                  background: "#f3f4f6",
                  color: "#4b5563",
                  // "&:hover": {
                  //   background: "#fee2e2",
                  //   color: "#b91c1c",
                  // },
                }}
              >
                <Cancel />
              </IconButton>
            </>
          )}
        </Stack>
      </Box>

      {/* Edit Mode Content */}
      <Collapse in={isEditMode} timeout="auto">
        <Box sx={{ p: 2.5 }}>
          {/* IOI Options - VERTICAL SPLIT (3 COLUMNS) */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#1d2b5a",
                mb: 2,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Select IOI Amount
            </Typography>

            <Grid container spacing={1.5}>
              {IOI_OPTIONS.map((option) => (
                <Grid item xs={12} sm={6} md={4} key={option.level}>
                  <IOIOptionCard
                    option={option}
                    amount={calculateIOIAmount(deal_size, option.percentage)}
                    isSelected={selectedLevel === option.level}
                    onSelect={() => handleLevelChange(option.level)}
                    isEditMode={isEditMode}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* <Divider sx={{ mb: 3, opacity: 0.5 }} /> */}

          {/* Custom Amount Inline Row */}
          <Box >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              flexWrap="wrap"
            >
              <Radio
                checked={selectedLevel === "custom"}
                onChange={() => handleLevelChange("custom")}
                sx={{
                  ml: -1,
                  p: 0.35,
                  "& .MuiSvgIcon-root": {
                    fontSize: 16,
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color:
                    selectedLevel === "custom" ? "#1e40af" : "#1d2b5a",
                  letterSpacing: 0.3,
                }}
              >
                Custom Amount (Millions)
              </Typography>
              <TextField
                type="number"
                placeholder="Amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                disabled={selectedLevel !== "custom"}
                error={!!customError}
                helperText={customError}
                sx={{
                  width: 140,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    background:
                      selectedLevel === "custom"
                        ? "#ffffff"
                        : "#f3f4f6",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "#ffffff",
                    },
                    "&.Mui-focused": {
                      background: "#ffffff",
                      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                    },
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "#9ca3af",
                    opacity: 0.7,
                  },
                }}
              />
            </Stack>

            {selectedLevel === "custom" && customAmount && !customError && (
              <Typography
                variant="caption"
                sx={{
                  mt: 0.75,
                  display: "block",
                  fontWeight: 600,
                  color: "#15803d",
                }}
              >
                {formatCurrency(parseFloat(customAmount) * 1_000_000)} ·{" "}
                {customPercentage.toFixed(2)}% of deal size
              </Typography>
            )}
          </Box>

        </Box>
      </Collapse>
    </Card>
  </SectionCard>
  );
}

// ─── Exports ────────────────────────────────────────────────────────────────
export { IOI as IOICard };
export { type IOIComponentProps, type IOILevel };
