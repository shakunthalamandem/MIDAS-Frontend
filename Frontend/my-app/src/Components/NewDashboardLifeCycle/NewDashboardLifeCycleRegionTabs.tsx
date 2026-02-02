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
};

const RegionTabs: React.FC<RegionTabsProps> = ({
  tabs,
  selectedRegion,
  onSelect,
  compact = false,
}) => (
  <Stack
    direction="row"
    spacing={compact ? 0.75 : 1}
    flexWrap="wrap"
    justifyContent="center"
  >
    {tabs.map((item) => {
      const isSelected = selectedRegion === item.value;
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
            border: isSelected ? "1px solid #2b146f" : "1px solid #d7ddea",
            backgroundColor: isSelected ? "#2b146f" : "#ffffff",
            color: isSelected ? "#ffffff" : "#1f2a44",
            boxShadow: isSelected ? "0 8px 18px rgba(43,20,111,0.18)" : "none",
            transition: "all 0.2s ease",
            display: "inline-flex",
            alignItems: "center",
            "&:hover": {
              backgroundColor: isSelected ? "#24105f" : "#f6f8fc",
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
