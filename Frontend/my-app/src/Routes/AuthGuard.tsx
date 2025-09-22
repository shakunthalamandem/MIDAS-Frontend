// src/routes/AuthGuard.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

type JWTPayload = { exp?: number; [k: string]: any };
interface RefreshResponse { access_token: string; }

const ACCESS = "access_token";
const REFRESH = "refresh_token";
const REFRESH_AHEAD_SEC = 120; // refresh if exp < 2min
const REQUEST_TIMEOUT_MS = 10000; // 10s

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = useMemo(() => process.env.REACT_APP_API_URL, []);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  // axios instance with timeout
  const http = useMemo(() => {
    const inst = axios.create({ baseURL: apiUrl, timeout: REQUEST_TIMEOUT_MS });
    inst.interceptors.request.use((config) => {
      const token = localStorage.getItem(ACCESS);
      if (!config.headers) config.headers = {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return inst;
  }, [apiUrl]);

  // simple single-flight refresh
  let refreshing = false;
  let pending: Array<() => void> = [];

  const refreshAccessToken = async (): Promise<boolean> => {
    if (refreshing) {
      await new Promise<void>((res) => pending.push(res));
      return !!localStorage.getItem(ACCESS);
    }
    refreshing = true;
    try {
      const rt = localStorage.getItem(REFRESH);
      if (!rt) throw new Error("No refresh token");
      const resp = await http.post<RefreshResponse>("/auth/refresh-token/", { refresh_token: rt });
      localStorage.setItem(ACCESS, resp.data.access_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = false;
      pending.forEach((fn) => fn());
      pending = [];
    }
  };

  // 401 interceptor with replay
  useEffect(() => {
    const id = http.interceptors.response.use(
      (r) => r,
      async (error) => {
        const original = error.config;
        if (!original || original._retry) return Promise.reject(error);
        if (error?.response?.status === 401) {
          original._retry = true;
          const ok = await refreshAccessToken();
          if (ok) {
            original.headers.Authorization = `Bearer ${localStorage.getItem(ACCESS)}`;
            return http.request(original);
          } else {
            // hard logout
            localStorage.removeItem(ACCESS);
            localStorage.removeItem(REFRESH);
            setOpenDialog(true);
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => http.interceptors.response.eject(id);
  }, [http]);

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

  const tokenNeedsRefreshSoon = (token: string | null) => {
    if (!token) return true;
    try {
      const { exp } = jwtDecode<JWTPayload>(token);
      if (!exp) return true;
      const now = Math.floor(Date.now() / 1000);
      return exp - now < REFRESH_AHEAD_SEC;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const secure = async () => {
      const access = localStorage.getItem(ACCESS);
      const refresh = localStorage.getItem(REFRESH);

      // 1) no tokens → go login
      if (!access || !refresh) {
        if (!cancelled) {
          setOpenDialog(true);
          setLoading(false);
        }
        return;
      }

      // 2) if access valid and not near expiry → proceed without verify call
      if (tokenIsValid(access) && !tokenNeedsRefreshSoon(access)) {
        if (!cancelled) setLoading(false);
        return;
      }

      // 3) try refresh (proactive or because exp near)
      const ok = await refreshAccessToken();
      if (!ok) {
        if (!cancelled) {
          setOpenDialog(true);
          setLoading(false);
        }
        return;
      }

      // 4) optional: ping a fast health/verify (with timeout) if you still want a server check
      try {
        await http.get("/auth/verify-token/"); // fast path server should answer quickly
      } catch {
        // If verify fails but refresh succeeded, still allow app to render; API calls will 401 later and interceptor will handle.
      }

      if (!cancelled) setLoading(false);
    };

    secure();
    return () => { cancelled = true; };
  }, [http, location.pathname]);

  const handleDialogClose = () => {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
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
