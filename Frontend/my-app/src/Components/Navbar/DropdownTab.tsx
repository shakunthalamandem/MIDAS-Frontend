import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"; // Import the dropdown arrow icon

interface DropdownTabProps {
  label: string;
  menuItems: { label: string; path: string }[];
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const DropdownTab: React.FC<DropdownTabProps> = ({ label, menuItems, selectedTab, setSelectedTab }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setSelectedTab(label);
    localStorage.setItem("selectedTab", label);
  };

  const handleMenuItemClick = (path: string) => {
    setAnchorEl(null);
    navigate(path);
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
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {menuItems.map((item) => (
          <MenuItem key={item.label} onClick={() => handleMenuItemClick(item.path)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DropdownTab;
