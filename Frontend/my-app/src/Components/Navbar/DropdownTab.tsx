import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"; // Import the dropdown arrow icon

export interface DropdownMenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface DropdownTabProps {
  label: string;
  menuItems: DropdownMenuItem[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  rich?: boolean;
}

const DropdownTab: React.FC<DropdownTabProps> = ({
  label,
  menuItems,
  selectedTab,
  setSelectedTab,
  rich,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const isRichMenu = rich ?? menuItems.some((item) => item.icon);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setSelectedTab(label);
    localStorage.setItem("selectedTab", label);
  };

  const navigateAndRefresh = (path: string) => {
    navigate(path);
    // Force a full reload so the tab always pulls fresh data
    setTimeout(() => window.location.reload(), 0);
  };

  const handleMenuItemClick = (path: string) => {
    setAnchorEl(null);
    navigateAndRefresh(path);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />} // <-- Add the arrow here
        sx={{
          color: "#005166",
          fontWeight: "bold",
          fontSize: "0.725rem",
          mx: 1,
          borderBottom: selectedTab === label ? "3px solid #005166" : "3px solid transparent",
          borderRadius: 0,
          "&:hover": {
            borderBottom: "3px solid #005166",
            backgroundColor: "transparent",
          },
        }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{
          elevation: isRichMenu ? 6 : 3,
          sx: isRichMenu
            ? {
                mt: 1.5,
                overflow: "visible",
                borderRadius: 2,
                minWidth: 260,
                boxShadow: "0px 18px 45px rgba(0, 0, 0, 0.2)",
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: -8,
                  left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 16,
                  height: 16,
                  bgcolor: "#FFFFFF",
                  boxShadow: "-1px -1px 1px rgba(0, 0, 0, 0.05)",
                  zIndex: 0,
                },
              }
            : { mt: 0.5 },
        }}
        MenuListProps={isRichMenu ? { sx: { py: 1 } } : undefined}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => handleMenuItemClick(item.path)}
            sx={
              isRichMenu
                ? {
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    py: 1.25,
                    px: 1.5,
                    borderRadius: 1.5,
                    transition:
                      "background-color 150ms ease, transform 150ms ease",
                    "&:hover": {
                      backgroundColor: "#f3f6ff",
                      transform: "translateY(-1px)",
                    },
                  }
                : { color: "#005166", fontSize: "0.8rem" }
            }
          >
            {item.icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "12px",
                  backgroundColor: "#eef2ff",
                  display: "grid",
                  placeItems: "center",
                  color: "#002060",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: isRichMenu ? "#0b1844" : "#005166",
                  fontSize: isRichMenu ? "0.9rem" : "0.8rem",
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DropdownTab;
