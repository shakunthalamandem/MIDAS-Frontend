import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

// const API_LOGOUT = "http://localhost:8000/auth/logout/";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;


  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      // If no refresh token, just navigate to login page
      navigate("/login");
      return;
    }

    setLoading(true);
    
    try {
      await axios.post(`${apiUrl}/api/logout/`, { refresh_token: refreshToken });
      
      // Clear tokens from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      setLoading(false);
      navigate("/login");  // Redirect to login after logout
    } catch (error) {
      setLoading(false);
      console.error("Logout failed:", error);
      // Show an error dialog or message
    }
  };

  return (
    <>
      {loading && <CircularProgress style={{ display: "block", margin: "auto", marginTop: "20%" }} />}
      <Dialog open={openDialog} onClose={() => navigate("/")}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Logging out...
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            You are about to log out. Do you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleLogout} disabled={loading}>
            {loading ? "Logging Out..." : "Yes, Log Out"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/")}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Logout;
