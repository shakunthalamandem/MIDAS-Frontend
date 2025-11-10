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
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        PaperProps={{
          style: {
            padding: "1.5rem",
            borderRadius: 24,
            background: "linear-gradient(135deg, #0f172a 0%, #1e40af 60%, #2dd4bf 120%)",
            color: "#f8fafc",
            boxShadow: "0 20px 45px rgba(2, 6, 23, 0.45)",
          },
        }}
        BackdropProps={{
          style: {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(15, 23, 42, 0.55)",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
          <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
            Session Ended
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body1" sx={{ color: "#e0f2fe", mt: 1, mb: 2 }}>
            Your session has timed out for security reasons. Please log in again to continue.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleDialogClose}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 999,
              backgroundColor: "#f97316",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { backgroundColor: "#ea580c" },
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
      {children}
    </>
  );
};

export default AuthGuard;
