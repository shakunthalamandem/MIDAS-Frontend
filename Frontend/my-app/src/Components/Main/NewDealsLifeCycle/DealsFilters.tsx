import React from "react";
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography, Paper } from "@mui/material";

interface DealsFiltersProps {
  selectedOp: string;
  options: { value: string; label: string; helper: string; icon?: React.ReactNode }[];
  onChange: (value: string) => void;
  rightContent?: React.ReactNode;
}

const DealsFilters: React.FC<DealsFiltersProps> = ({
  selectedOp,
  options,
  onChange,
  rightContent,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1, md: 1.5 },
        borderRadius: 3,
        backgroundColor: "#ffffff",
        border: "1px solid #e6ebf5",
        boxShadow: "0 12px 26px rgba(15,23,42,0.06)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <ToggleButtonGroup
          value={selectedOp}
          exclusive
          onChange={(_e, value) => value && onChange(value)}
          sx={{
            flexWrap: "nowrap",
            columnGap: { xs: 1, md: 1.5 },
            rowGap: { xs: 1, md: 1.25 },
            overflowX: "auto",
            maxWidth: "100%",
            flex: 1,
            minWidth: 0,
            "& .MuiToggleButton-root": {
              textTransform: "none",
              borderRadius: 999,
              border: "1px solid transparent",
              backgroundColor: "transparent",
              minWidth: 200,
              height: 72,
              minHeight: 72,
              justifyContent: "flex-start",
              px: 1.75,
              py: 0.75,
              color: "#1f2a44",
              position: "relative",
              overflow: "hidden",
              boxShadow: "none",
              transition: "all 0.2s ease",
            },
            "& .MuiToggleButton-root:hover": {
              backgroundColor: "#f4f6ff",
            },
            "& .Mui-selected": {
              borderColor: "#c7d2fe",
              backgroundColor: "#f1f5ff",
              boxShadow: "0 6px 14px rgba(76,110,245,0.12)",
            },
            "& .MuiToggleButton-root.Mui-selected:after": {
              display: "none",
            },
            "& .deal-icon-box": {
              width: 34,
              height: 34,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              backgroundColor: "#eef2ff",
              color: "#5b6476",
              transition: "all 0.2s ease",
            },
            "& .Mui-selected .deal-icon-box": {
              backgroundColor: "#ece7f8",
              color: "#2b146f",
            },
            "& .deal-label": {
              fontWeight: 700,
              color: "inherit",
            },
            "& .deal-helper": {
              display: "none",
            },
          }}
        >
          {options.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {option.icon && <Box className="deal-icon-box">{option.icon}</Box>}
                <Box>
                  <Typography className="deal-label">{option.label}</Typography>
                  {option.helper && (
                    <Typography className="deal-helper" variant="caption">
                      {option.helper}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {rightContent && (
          <Box
            sx={{
              width: { xs: "100%", md: "auto" },
              alignSelf: { xs: "stretch", md: "center" },
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
              ml: { md: "auto" },
            }}
          >
            {rightContent}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default DealsFilters;
