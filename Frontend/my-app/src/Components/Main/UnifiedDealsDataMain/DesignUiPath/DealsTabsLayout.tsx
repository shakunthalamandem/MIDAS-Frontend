import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DealsDropdown from "./DealsDropdown";

const DealsTabsLayout: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, padding: 2 }}>
      <DealsDropdown />
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DealsTabsLayout;
