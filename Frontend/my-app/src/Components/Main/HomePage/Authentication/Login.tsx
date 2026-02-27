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
  // Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { AutorenewRounded } from "@mui/icons-material";
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

interface SendOtpResponse {
  message?: string;
  expires_in_seconds?: number;
}

// const CAPTCHA_LEN = 4;
const OTP_LEN = 6;
const OTP_EXPIRY_SECONDS = 5 * 60;
const REQUEST_TIMEOUT_MS = 60000;

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // forgot password dialog

  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  // Captcha is intentionally disabled on UI; kept as comments only as requested.
  // const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const [captchaText, setCaptchaText] = useState("");
  // const [userInput, setUserInput] = useState("");
  // const [snackbarOpen, setSnackbarOpen] = useState(false);

  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  const apiUrl = useMemo(() => process.env.REACT_APP_API_URL, []);

  // Axios instance with timeout
  const http = useMemo(() => {
    return axios.create({ baseURL: apiUrl, timeout: REQUEST_TIMEOUT_MS });
  }, [apiUrl]);

  /*
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
    const id = setInterval(refreshCaptcha, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  */

  useEffect(() => {
    if (!otpSent) return;
    const id = window.setInterval(() => {
      setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [otpSent]);

  useEffect(() => {
    if (otpSent && otpExpiresIn <= 0) {
      setOtpMessage(null);
    }
  }, [otpExpiresIn, otpSent]);

  const formatOtpTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendOtp = async () => {
    if (!username.trim()) {
      setErrorMsg("Please enter your username before sending OTP.");
      return;
    }

    setSendingOtp(true);
    setErrorMsg(null);
    setOtpMessage(null);

    try {
      const res = await http.post<SendOtpResponse>("/api/login/send-otp/", {
        username: username.trim(),
      });

      setOtpSent(true);
      setOtpInput("");
      setOtpExpiresIn(res.data?.expires_in_seconds ?? OTP_EXPIRY_SECONDS);
      setOtpMessage(
        res.data?.message ||
          "OTP sent to your registered email. It will expire in 5 minutes."
      );
      setTimeout(() => otpInputRef.current?.focus(), 0);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to send OTP. Please try again.";
      setErrorMsg(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);

  const canSubmit =
    username.trim().length > 0 &&
    password.length > 0 &&
    // userInput.trim().length === CAPTCHA_LEN &&
    // userInput === captchaText &&
    otpSent &&
    otpInput.trim().length === OTP_LEN &&
    otpExpiresIn > 0 &&
    !loading &&
    !sendingOtp;

  // Submit
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSubmit) {
      // if (userInput !== captchaText) setSnackbarOpen(true);
      return;
    }
    if (otpExpiresIn <= 0) {
      setErrorMsg("OTP is expired. Please click Resend.");
      setOtpMessage(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await http.post<LoginResponse>("/api/login/", {
        username,
        password,
        otp: otpInput,
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
      // Reload the app after login so every page starts with fresh data
      setTimeout(() => window.location.reload(), 0);
    } catch (err: any) {
      const errorCode = String(err?.response?.data?.code || "").toUpperCase();
      const rawMessage =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";

      const normalized = String(rawMessage).toLowerCase();
      if (
        errorCode === "OTP_EXPIRED" ||
        (normalized.includes("otp") && normalized.includes("expired"))
      ) {
        setErrorMsg("OTP is expired. Please click Resend.");
        setOtpExpiresIn(0);
        setOtpInput("");
        setOtpMessage(null);
      } else if (
        errorCode === "OTP_INVALID" ||
        (normalized.includes("otp") && normalized.includes("invalid"))
      ) {
        setErrorMsg("Invalid OTP. Please enter the correct OTP.");
        setOtpInput("");
        setTimeout(() => otpInputRef.current?.focus(), 0);
      } else {
        setErrorMsg(rawMessage);
      }

      // refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.15rem" },
          backgroundColor: "#002060",
          textAlign: "center",
          py: 1.25,
          borderRadius: 2,
          mt: 1.5,
          mb: 2,
        }}
      >
        Welcome to Monashee Insights & Data Application System! Access powerful
        insights and data with MIDAS.
      </Box>
      <Container maxWidth={false} sx={{ mt: 8, mb: 8, maxWidth: "500px" }}>
        <Paper
          elevation={4}
          sx={{ p: 4, borderRadius: 3, backgroundColor: "#e8f1f9" }}
        >
          <Box textAlign="center" mb={2}>
            <Typography
              variant="h5"
              fontWeight={500}
              color="primary"
              gutterBottom
            >
              Login to Continue
            </Typography>
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
              onChange={(e) => {
                setUsername(e.target.value);
                setOtpSent(false);
                setOtpInput("");
                setOtpExpiresIn(0);
                setOtpMessage(null);
              }}
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

            {/*
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
            */}

            {!otpSent ? (
              <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !username.trim()}
                  sx={{
                    minWidth: 118,
                    height: 44,
                    px: 2.2,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontSize: "0.98rem",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                    color: "#ffffff",
                    background:
                      "linear-gradient(135deg, #17bfae 0%, #2fb3d6 45%, #4f83ff 100%)",
                    boxShadow: "0 8px 20px rgba(30, 126, 199, 0.3)",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease, background 0.28s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 11px 24px rgba(30, 126, 199, 0.38)",
                      background:
                        "linear-gradient(135deg, #12b7a7 0%, #28abd1 45%, #4478f7 100%)",
                    },
                    "&:active": {
                      transform: "translateY(0) scale(0.99)",
                    },
                    "&.Mui-disabled": {
                      color: "#f4f4f4",
                      background:
                        "linear-gradient(135deg, #8db1cb 0%, #94a7c6 100%)",
                      boxShadow: "none",
                    },
                  }}
                >
                  {sendingOtp ? "Sending..." : "Send OTP"}
                </Button>
              </Box>
            ) : (
              <Box display="flex" alignItems="flex-start" gap={1.2} sx={{ mb: 2 }}>
                <TextField
                  inputRef={otpInputRef}
                  fullWidth
                  label={`Enter ${OTP_LEN}-digit OTP`}
                  inputMode="numeric"
                  value={otpInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D+/g, "").slice(0, OTP_LEN);
                    setOtpInput(v);
                  }}
                  helperText={
                    otpExpiresIn > 0
                      ? `OTP expires in ${formatOtpTime(otpExpiresIn)}`
                      : "OTP expired. Click Resend."
                  }
                  InputLabelProps={{ shrink: true }}
                />

                <Button
                  type="button"
                  variant="contained"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !username.trim()}
                  startIcon={
                    <AutorenewRounded
                      sx={{
                        "@keyframes resendIconSpin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                        animation: sendingOtp
                          ? "resendIconSpin 0.9s linear infinite"
                          : "none",
                      }}
                    />
                  }
                  sx={{
                    minWidth: 116,
                    height: 44,
                    px: 1.8,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                    color: "#0d4f7b",
                    border: "1px solid rgba(19, 96, 145, 0.28)",
                    background: "linear-gradient(180deg, #ffffff 0%, #f4fbff 100%)",
                    boxShadow: "0 8px 20px rgba(16, 91, 139, 0.15)",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease, background 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 11px 24px rgba(16, 91, 139, 0.2)",
                      background: "linear-gradient(180deg, #ffffff 0%, #ebf8ff 100%)",
                    },
                    "&:active": {
                      transform: "translateY(0) scale(0.99)",
                    },
                    "&.Mui-disabled": {
                      color: "#8fa7bb",
                      background: "#eef5fb",
                      boxShadow: "none",
                    },
                    "& .MuiButton-startIcon": {
                      mr: 0.6,
                      ml: -0.1,
                    },
                  }}
                >
                  {sendingOtp ? "Sending..." : "Resend"}
                </Button>
              </Box>
            )}

            {otpMessage && otpExpiresIn > 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {otpMessage}
              </Alert>
            )}

            {otpSent && (
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
            )}
          </Box>

          <Grid
            container
            justifyContent="center"
            alignItems="center"
            spacing={1}
            mt={3}
          >
            <Grid item>
              <Typography variant="body2" color="#000000">
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

        {/*
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
        */}
      </Container>
    </Box>
  );
};

export default Login;
