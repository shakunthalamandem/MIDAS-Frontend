// src/routes/AuthGuard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography
} from "@mui/material";

type JWTPayload = { exp?: number; [k: string]: any };

const ACCESS = "access_token";
const REQUEST_TIMEOUT_MS = 10000; // 10s

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = useMemo(() => process.env.REACT_APP_API_URL, []);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const http = useMemo(() => {
    const inst = axios.create({ baseURL: apiUrl, timeout: REQUEST_TIMEOUT_MS });
    inst.interceptors.request.use((config) => {
      const token = localStorage.getItem(ACCESS);
      if (!config.headers) config.headers = {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    // On ANY 401 → hard logout (no refresh)
    const id = inst.interceptors.response.use(
      (r) => r,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem(ACCESS);
          setOpenDialog(true);
        }
        return Promise.reject(error);
      }
    );
    // Eject in case Guard unmounts
    (inst as any).__eject = () => inst.interceptors.response.eject(id);
    return inst;
  }, [apiUrl]);

  // Helper: is access token still valid?
  const tokenIsValid = (token: string | null) => {
    if (!token) return false;
    try {
      const { exp } = jwtDecode<JWTPayload>(token);
      if (!exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return exp > now;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const secure = async () => {
      const access = localStorage.getItem(ACCESS);
      // No token or expired → logout immediately
      if (!tokenIsValid(access)) {
        if (!cancelled) {
          setOpenDialog(true);
          setLoading(false);
        }
        return;
      }

      // Token looks fine → render app
      if (!cancelled) setLoading(false);
    };

    secure();
    return () => {
      // cleanup interceptor if present
      (http as any).__eject?.();
      cancelled = true;
    };
  }, [http, location.pathname]);

  const handleDialogClose = () => {
    localStorage.removeItem(ACCESS);
    navigate("/login", { replace: true, state: { from: location.pathname } });
  };

  if (loading) {
    return (
      <CircularProgress style={{ display: "block", margin: "auto", marginTop: "20%" }} />
    );
  }

  return (
    <>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Session Ended
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Your session has ended. Please log in again to continue.
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
