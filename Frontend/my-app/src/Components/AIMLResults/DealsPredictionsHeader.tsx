// DealsPredictionsHeader.tsx
import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import { DealTypeFilter } from "./types";

interface DealsPredictionsHeaderProps {
  dealTypeFilter: DealTypeFilter;
  onDealTypeChange: (t: DealTypeFilter) => void;

  search: string;
  onSearchChange: (v: string) => void;

  startDate: string;
  onStartDateChange: (v: string) => void;

  endDate: string;
  onEndDateChange: (v: string) => void;
}

const DealsPredictionsHeader: React.FC<DealsPredictionsHeaderProps> = ({
  dealTypeFilter,
  onDealTypeChange,
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) => {
  return (
    <Box
      mb={2}
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      gap={1.5}
      sx={(theme) => ({
        position: "sticky",
        top: 0,
        zIndex: 5,
        paddingBottom: theme.spacing(1),
        background: `linear-gradient(
          180deg,
          ${theme.palette.background.default} 70%,
          ${alpha(theme.palette.background.default, 0)} 100%
        )`,
      })}
    >
      <Box display="flex" justifyContent="center" width="100%">
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {/* IPO / FO segmented control */}
          <Box
            sx={(theme) => ({
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              padding: 0.3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.background.paper,
            })}
          >
            {(["IPO", "FO"] as DealTypeFilter[]).map((type) => {
              const active = dealTypeFilter === type;
              return (
                <Box
                  key={type}
                  onClick={() => onDealTypeChange(type)}
                  sx={(theme) => ({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.6,
                    px: 1.6,
                    py: 0.45,
                    borderRadius: 999,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: active
                      ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                      : "transparent",
                    color: active
                      ? theme.palette.common.white
                      : theme.palette.text.secondary,
                  })}
                >
                  {type === "IPO" ? (
                    <RocketLaunchOutlinedIcon
                      sx={{ fontSize: 16, opacity: active ? 1 : 0.7 }}
                    />
                  ) : (
                    <AttachMoneyOutlinedIcon
                      sx={{ fontSize: 16, opacity: active ? 1 : 0.7 }}
                    />
                  )}
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, letterSpacing: 0.6 }}
                  >
                    {type}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Search */}
          <TextField
            size="small"
            label="Search by ticker or issuer"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ minWidth: 230 }}
          />

          <TextField
            size="small"
            type="date"
            label="Start date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />

          <TextField
            size="small"
            type="date"
            label="End date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DealsPredictionsHeader;
