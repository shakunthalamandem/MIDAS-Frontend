import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"; // Import the dropdown arrow icon
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export interface DropdownMenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: DropdownMenuItem[];
  onSelect?: () => void;
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
  const [subAnchorEl, setSubAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuItems, setSubMenuItems] = useState<DropdownMenuItem[]>([]);
  const [subSubAnchorEl, setSubSubAnchorEl] = useState<null | HTMLElement>(null);
  const [subSubMenuItems, setSubSubMenuItems] = useState<DropdownMenuItem[]>([]);
  const open = Boolean(anchorEl);
  const subOpen = Boolean(subAnchorEl);
  const subSubOpen = Boolean(subSubAnchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  const isRichMenu = rich ?? menuItems.some((item) => item.icon);
  const isMenuItemActive = (path: string) =>
    Boolean(matchPath({ path, end: false }, location.pathname));
  const isTabActive =
    selectedTab === label || menuItems.some((item) => isMenuItemActive(item.path));

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

  const handleMenuItemClick = (item: DropdownMenuItem) => {
    item.onSelect?.();
    setAnchorEl(null);
    setSubAnchorEl(null);
    setSubSubAnchorEl(null);
    navigateAndRefresh(item.path);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSubAnchorEl(null);
    setSubSubAnchorEl(null);
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
          borderBottom: isTabActive ? "3px solid #005166" : "3px solid transparent",
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
        {menuItems.map((item) => {
          const isActive = isMenuItemActive(item.path);
          const hasChildren = Boolean(item.children?.length);
          return (
            <MenuItem
              key={item.label}
              onClick={() => {
                if (!hasChildren) {
                  handleMenuItemClick(item);
                }
              }}
              onMouseEnter={(event) => {
                if (hasChildren) {
                  setSubAnchorEl(event.currentTarget);
                  setSubMenuItems(item.children ?? []);
                } else {
                  setSubAnchorEl(null);
                  setSubMenuItems([]);
                  setSubSubAnchorEl(null);
                  setSubSubMenuItems([]);
                }
              }}
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
                      backgroundColor: isActive ? "#e8efff" : "transparent",
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
                    backgroundColor: isActive ? "#dbe7ff" : "#eef2ff",
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
              {hasChildren && (
                <Box sx={{ marginLeft: "auto", color: "#93a0bf" }}>
                  <ArrowRightIcon fontSize="small" />
                </Box>
              )}
            </MenuItem>
          );
        })}
      </Menu>

      <Menu
        anchorEl={subAnchorEl}
        open={subOpen}
        onClose={() => {
          setSubAnchorEl(null);
          setSubSubAnchorEl(null);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          elevation: 6,
          sx: {
            mt: -0.5,
            ml: 1,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: "0px 18px 45px rgba(0, 0, 0, 0.18)",
          },
        }}
      >
        {subMenuItems.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          return (
            <MenuItem
              key={item.label}
              onClick={() => {
                if (!hasChildren) {
                  handleMenuItemClick(item);
                }
              }}
              onMouseEnter={(event) => {
                if (hasChildren) {
                  setSubSubAnchorEl(event.currentTarget);
                  setSubSubMenuItems(item.children ?? []);
                } else {
                  setSubSubAnchorEl(null);
                  setSubSubMenuItems([]);
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                "&:hover": {
                  backgroundColor: "#f3f6ff",
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {item.label}
              </Typography>
              {hasChildren && (
                <Box sx={{ marginLeft: "auto", color: "#93a0bf" }}>
                  <ArrowRightIcon fontSize="small" />
                </Box>
              )}
            </MenuItem>
          );
        })}
      </Menu>

      <Menu
        anchorEl={subSubAnchorEl}
        open={subSubOpen}
        onClose={() => setSubSubAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          elevation: 6,
          sx: {
            mt: -0.5,
            ml: 1,
            borderRadius: 2,
            minWidth: 180,
            boxShadow: "0px 18px 45px rgba(0, 0, 0, 0.16)",
          },
        }}
      >
        {subSubMenuItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => handleMenuItemClick(item)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 1,
              px: 1.5,
              borderRadius: 1.5,
              "&:hover": {
                backgroundColor: "#f3f6ff",
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {item.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DropdownTab;
