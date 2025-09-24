// src/Components/Main/HomePage/Authentication/Login.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Container,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ForgotPassword from "./ForgotPassword";

interface LoginResponse {
  access_token: string;
  user: {
    is_superuser: boolean;
    username?: string;
  };
  message?: string;
}

const CAPTCHA_LEN = 4;
const REQUEST_TIMEOUT_MS = 10000;

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // forgot password dialog

  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  // ---- Captcha state ----
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const apiUrl = useMemo(() => process.env.REACT_APP_API_URL, []);

  // Axios instance with timeout
  const http = useMemo(() => {
    return axios.create({ baseURL: apiUrl, timeout: REQUEST_TIMEOUT_MS });
  }, [apiUrl]);

  const generateCaptchaText = () => {
    const chars = "0123456789";
    let text = "";
    for (let i = 0; i < CAPTCHA_LEN; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f4f6f8";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = `rgba(${60 + Math.random() * 120}, ${60 + Math.random() * 120}, ${
        60 + Math.random() * 120
      }, 0.7)`;
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        2 + Math.random() * 4,
        2 + Math.random() * 4
      );
    }

    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#1a1a1a";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const startX = width / 2 - ((text.length - 1) * 22) / 2;
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(startX + i * 22, height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.35);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const t = generateCaptchaText();
    setCaptchaText(t);
    drawCaptcha(t);
    setUserInput("");
  };

  useEffect(() => {
    refreshCaptcha();
    const id = setInterval(refreshCaptcha, 60000); // refresh every 60s
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);

  const canSubmit =
    username.trim().length > 0 &&
    password.length > 0 &&
    userInput.trim().length === CAPTCHA_LEN &&
    userInput === captchaText &&
    !loading;

  // Submit
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSubmit) {
      if (userInput !== captchaText) setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await http.post<LoginResponse>("/api/login/", {
        username,
        password,
      });

      // Store only the access token + a tiny user snapshot
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem(
        "is_superuser",
        res.data.user?.is_superuser ? "true" : "false"
      );
      localStorage.setItem("user", res.data.user?.username || username);

      const to = location.state?.from || "/";
      navigate(to, { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong. Please try again.";
      setErrorMsg(message);
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box textAlign="center" mb={2}>
          <Typography
            variant="h5"
            fontWeight={600}
            color="primary"
            gutterBottom
          >
            Welcome to MIDAS!
          </Typography>
          <Typography variant="body2">Please log in to continue.</Typography>
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} noValidate>
          <TextField
            fullWidth
            label="Username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <Box position="relative" width="100%" sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Password"
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <IconButton
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              onClick={togglePasswordVisibility}
              edge="end"
              sx={{ position: "absolute", top: 6, right: 8 }}
            >
              {passwordVisible ? <BsEye /> : <BsEyeSlash />}
            </IconButton>
          </Box>

          {/* CAPTCHA */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1.5}
            sx={{ mb: 2 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <canvas
                ref={canvasRef}
                width={120}
                height={40}
                aria-label="CAPTCHA"
                role="img"
                style={{
                  border: "1px solid #d3d3d3",
                  backgroundColor: "#fafafa",
                  borderRadius: 6,
                }}
              />
              <IconButton
                aria-label="Refresh CAPTCHA"
                onClick={refreshCaptcha}
                size="small"
              >
                <Refresh />
              </IconButton>
            </Box>

            <TextField
              label={`Enter ${CAPTCHA_LEN}-digit Captcha`}
              placeholder=""
              inputMode="numeric"
              value={userInput}
              onChange={(e) => {
                const v = e.target.value
                  .replace(/\D+/g, "")
                  .slice(0, CAPTCHA_LEN);
                setUserInput(v);
              }}
              onFocus={() => setSnackbarOpen(false)}
              sx={{ width: 160 }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!canSubmit}
            sx={{
              py: 1.25,
              borderRadius: 2,
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Log In"
            )}
          </Button>
        </Box>

        <Grid
          container
          justifyContent="center"
          alignItems="center"
          spacing={1}
          mt={3}
        >
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?
            </Typography>
          </Grid>
          <Grid item>
            <Link to="/summarypopup" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                Sign Up
              </Typography>
            </Link>
          </Grid>
        </Grid>

        <Grid container justifyContent="center" alignItems="center" mt={2}>
          <Typography
            onClick={() => setOpen(true)}
            variant="body2"
            color="error"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Forgot Password?
          </Typography>
          <ForgotPassword open={open} onClose={() => setOpen(false)} />
        </Grid>
      </Paper>

      {/* Wrong captcha snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2400}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          Incorrect CAPTCHA. Please try again.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
