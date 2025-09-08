import React, { useState } from "react";
import {
  Button,
  Container,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const DealsDropdown: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <>
    <Container>
      <Button
        variant="contained"
        onClick={handleOpen}
        endIcon={<ArrowDropDown />}
        sx={{
          backgroundColor: "#002060",
          "&:hover": { backgroundColor: "#001040" },
          borderRadius: 2,
        }}
      >
        Deals
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 200 },
        }}
      >
        <MenuItem onClick={() => handleNavigate("/download_deals_data")}>
          <Typography sx={{ color: "#002060", textDecoration: "underline" }}>
            Download Deals
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => handleNavigate("/deal_data_upload")}>
          <Typography sx={{ color: "#002060", textDecoration: "underline" }}>
            Upload Deals
          </Typography>
        </MenuItem>
      </Menu>
          </Container>

    </>
  );
};

export default DealsDropdown;
