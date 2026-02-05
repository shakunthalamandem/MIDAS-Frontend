import React, { useEffect, useState } from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const DealsDropdown: React.FC = () => {
  const tabs = [
    { label: "Download Deals", path: "/download_deals_data" },
    { label: "Upload Deals", path: "/deal_data_upload" },
    { label: "Delete Deals", path: "/delete_new_deal_data" },
  ];

  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabForPath = (path: string) => {
    const match = tabs.find((tab) => path.startsWith(tab.path));
    return match ? match.path : tabs[0].path;
  };

  const [activeTab, setActiveTab] = useState<string>(() =>
    getActiveTabForPath(location.pathname)
  );

  useEffect(() => {
    setActiveTab(getActiveTabForPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    if (!newValue) return;
    setActiveTab(newValue);
    navigate(newValue);
  };

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <ToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={handleTabChange}
        sx={{
          backgroundColor: "#f5f7ff",
          borderRadius: 2,
          border: "1px solid #d5d9f0",
          flexWrap: "wrap",
          "& .MuiToggleButton-root": {
            textTransform: "none",
            fontWeight: 500,
            color: "#000000",
            paddingX: 3,
            justifyContent: "center",
            minWidth: 180,
          },
          "& .Mui-selected": {
            backgroundColor: "#002060 !important",
            color: "#fff !important",
          },
        }}
      >
        {tabs.map((tab) => (
          <ToggleButton key={tab.path} value={tab.path}>
            {tab.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default DealsDropdown;
