import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface RefreshResponse {
  access_token: string;
}

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const verifyAuth = async () => {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!accessToken) {
        redirectToLogin();
        return;
      }

      try {
        await axios.get(`${apiUrl}/auth/verify-token/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setOpenDialog(false);
        setLoading(false);
      } catch (err: unknown) {
        const error = err as any; // 🔹 Explicitly casting 'error'  
        if (error?.response?.status === 401 && refreshToken) {
          refreshAccessToken(refreshToken);
        } else {
          redirectToLogin();
        }
      }
    };

    const refreshAccessToken = async (refreshToken: string) => {
      try {
        const response = await axios.post<RefreshResponse>(`${apiUrl}/auth/refresh-token/`, { refresh_token: refreshToken });
        localStorage.setItem("access_token", response.data.access_token);
        setOpenDialog(false);
        setLoading(false);
      } catch (error) {
        redirectToLogin();
        navigate("/error");  

      }
    };

    const redirectToLogin = () => {
    setLoading(false);
      setOpenDialog(true);
    };

    verifyAuth();
  }, [navigate]);

  const handleDialogClose = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (loading) return <CircularProgress style={{ display: "block", margin: "auto", marginTop: "20%" }} />;

  return (
    <>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Session Expired
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Your session has expired. Please log in again to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleDialogClose}>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
      {children}
    </>
  );
};

export default AuthGuard;
