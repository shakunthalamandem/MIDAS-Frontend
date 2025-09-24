// src/Components/Main/HomePage/Authentication/Logout.tsx
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Slide,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

interface LogoutProps {
  onConfirm: () => void; // e.g., clear tokens & navigate('/login')
  onCancel: () => void;
  open?: boolean; // optional; defaults to true
}

const REQUEST_TIMEOUT_MS = 8000;

const Logout: React.FC<LogoutProps> = ({
  onConfirm,
  onCancel,
  open = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const apiUrl = useMemo(() => process.env.REACT_APP_API_URL, []);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    setServerMsg(null);

    const access = localStorage.getItem("access_token");

    try {
      // Fire-and-forget style: even if this fails, we still proceed with client logout
      await axios.post(
        `${apiUrl}/api/logout/`,
        {},
        {
          timeout: REQUEST_TIMEOUT_MS,
          headers: access ? { Authorization: `Bearer ${access}` } : {},
        }
      );
      // Optional: setServerMsg('Logged out on server.');
    } catch (err: any) {
      // Don't block logout on client side
      setServerMsg(
        err?.response?.data?.note ||
          err?.response?.data?.error ||
          "Unable to reach server. Logging out locally."
      );
    } finally {
      setLoading(false);
      onConfirm(); // Your parent can clear tokens & navigate('/login')
    }
  };

  const username = localStorage.getItem("user") || "";

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      TransitionComponent={Slide}
      keepMounted
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="logout-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <LogoutIcon color="error" />
            <Typography variant="h6" fontWeight={700}>
              Sign out of MIDAS?
            </Typography>
          </Box>
          <IconButton
            aria-label="Close"
            onClick={onCancel}
            edge="end"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Typography
          id="logout-dialog-description"
          variant="body2"
          color="text.secondary"
        >
          {username ? (
            <>
              You are currently signed in as <b>{username}</b>. You’ll need to
              log in again to continue.
            </>
          ) : (
            <>You’ll need to log in again to continue.</>
          )}
        </Typography>

        {serverMsg && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {serverMsg}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="inherit"
          disabled={loading}
          sx={{
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleLogout}
          variant="contained"
          color="error"
          disableElevation
          disabled={loading}
          startIcon={!loading ? <LogoutIcon /> : undefined}
          sx={{
            borderRadius: 2,
            minWidth: 140,
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Sign Out"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Logout;
