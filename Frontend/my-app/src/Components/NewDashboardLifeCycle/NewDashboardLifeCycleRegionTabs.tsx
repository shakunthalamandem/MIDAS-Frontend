import React from "react";
import { Paper, Stack, Typography } from "@mui/material";

type RegionTab = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type RegionTabsProps = {
  tabs: ReadonlyArray<RegionTab>;
  selectedRegion: string;
  onSelect: (value: string) => void;
  compact?: boolean;
  hoverColor?: string;
  selectedColor?: string;
};

const RegionTabs: React.FC<RegionTabsProps> = ({
  tabs,
  selectedRegion,
  onSelect,
  compact = false,
  hoverColor = "#22c55e",
  selectedColor,
}) => (
  <Stack
    direction="row"
    spacing={compact ? 0.75 : 1}
    flexWrap="wrap"
    justifyContent="center"
  >
    {tabs.map((item) => {
      const isSelected = selectedRegion === item.value;
      const activeColor = selectedColor ?? hoverColor;
      return (
        <Paper
          key={item.value}
          onClick={() => onSelect(item.value)}
          sx={{
            px: compact ? 1.4 : 2,
            py: compact ? 0.35 : 0.6,
            borderRadius: 999,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: compact ? "0.7rem" : "0.8rem",
            border: "none",
            backgroundColor: isSelected ? activeColor : "transparent",
            color: isSelected ? "#ffffff" : "#1f2a44",
            boxShadow: "none",
            transition: "all 0.2s ease",
            display: "inline-flex",
            alignItems: "center",
            "&:hover": {
              backgroundColor: activeColor,
              color: "#ffffff",
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={compact ? 0.5 : 0.75}>
            {/* {item.icon} */}
            <Typography
              fontWeight={600}
              color="inherit"
              sx={{ fontSize: compact ? "0.7rem" : "0.8rem" }}
            >
              {item.label}
            </Typography>
          </Stack>
        </Paper>
      );
    })}
  </Stack>
);

export default RegionTabs;
