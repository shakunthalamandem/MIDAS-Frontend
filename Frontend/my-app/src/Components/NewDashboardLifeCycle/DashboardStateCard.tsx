import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SyncProblemRoundedIcon from "@mui/icons-material/SyncProblemRounded";

type StateVariant = "error" | "empty" | "no-data" | "missing-field";

interface DashboardStateCardProps {
  variant: StateVariant;
  title?: string;
  message?: string;
  /** Context chips shown below the message (e.g. ticker, region, sector) */
  context?: { label: string; value?: string | null }[];
  onRetry?: () => void;
  /** Full-height center layout (default true) */
  fullHeight?: boolean;
}

const CONFIG: Record<
  StateVariant,
  {
    icon: React.ReactNode;
    defaultTitle: string;
    defaultMessage: string;
    color: string;
    bgGradient: string;
    borderColor: string;
  }
> = {
  error: {
    icon: <SyncProblemRoundedIcon sx={{ fontSize: 38, color: "#dc2626" }} />,
    defaultTitle: "Something went wrong",
    defaultMessage:
      "We couldn\u2019t load the data for this section. This may be due to a temporary server issue or a network problem.",
    color: "#dc2626",
    bgGradient:
      "linear-gradient(135deg, rgba(254,226,226,0.6) 0%, rgba(254,242,242,0.4) 100%)",
    borderColor: "rgba(220,38,38,0.2)",
  },
  empty: {
    icon: <SearchOffRoundedIcon sx={{ fontSize: 38, color: "#7c3aed" }} />,
    defaultTitle: "No data found",
    defaultMessage:
      "There is no data available for the current selection. Try a different ticker, region, or sector.",
    color: "#7c3aed",
    bgGradient:
      "linear-gradient(135deg, rgba(237,233,254,0.6) 0%, rgba(245,243,255,0.4) 100%)",
    borderColor: "rgba(124,58,237,0.18)",
  },
  "no-data": {
    icon: <InfoOutlinedIcon sx={{ fontSize: 38, color: "#2563eb" }} />,
    defaultTitle: "Coming soon",
    defaultMessage:
      "Data for this section is not yet available. Please check back later.",
    color: "#2563eb",
    bgGradient:
      "linear-gradient(135deg, rgba(219,234,254,0.6) 0%, rgba(239,246,255,0.4) 100%)",
    borderColor: "rgba(37,99,235,0.18)",
  },
  "missing-field": {
    icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 38, color: "#d97706" }} />,
    defaultTitle: "Missing information",
    defaultMessage:
      "Some required fields are missing for this view. Please ensure the deal has the necessary details.",
    color: "#d97706",
    bgGradient:
      "linear-gradient(135deg, rgba(254,243,199,0.6) 0%, rgba(255,251,235,0.4) 100%)",
    borderColor: "rgba(217,119,6,0.2)",
  },
};

const DashboardStateCard: React.FC<DashboardStateCardProps> = ({
  variant,
  title,
  message,
  context,
  onRetry,
  fullHeight = true,
}) => {
  const cfg = CONFIG[variant];

  const contextChips = (context ?? []).filter(
    (c) => c.value !== undefined && c.value !== null && c.value !== ""
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${cfg.borderColor}`,
        background: cfg.bgGradient,
        overflow: "hidden",
        ...(fullHeight && {
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }),
      }}
    >
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 5 },
          textAlign: "center",
          maxWidth: 520,
          mx: "auto",
        }}
      >
        {/* Icon circle */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2.5,
            backgroundColor: alpha(cfg.color, 0.08),
            border: `1.5px solid ${alpha(cfg.color, 0.15)}`,
          }}
        >
          {cfg.icon}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "#0f172a",
            mb: 1,
            lineHeight: 1.3,
          }}
        >
          {title ?? cfg.defaultTitle}
        </Typography>

        {/* Message */}
        <Typography
          variant="body2"
          sx={{
            color: "#475569",
            lineHeight: 1.65,
            fontWeight: 500,
            maxWidth: 440,
            mx: "auto",
          }}
        >
          {message ?? cfg.defaultMessage}
        </Typography>

        {/* Context chips */}
        {contextChips.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mt: 2 }}
          >
            {contextChips.map((c) => (
              <Chip
                key={c.label}
                label={`${c.label}: ${c.value}`}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: alpha(cfg.color, 0.3),
                  color: cfg.color,
                  backgroundColor: alpha(cfg.color, 0.06),
                  mb: 0.5,
                }}
              />
            ))}
          </Stack>
        )}

        {/* Retry button */}
        {onRetry && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={onRetry}
            sx={{
              mt: 2.5,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              borderColor: alpha(cfg.color, 0.4),
              color: cfg.color,
              "&:hover": {
                borderColor: cfg.color,
                backgroundColor: alpha(cfg.color, 0.06),
              },
            }}
          >
            Retry
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default DashboardStateCard;
