import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ForgotPassword from "./ForgotPassword";

// Define the response type
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    is_superuser: boolean;
  };
}


const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const apiUrl = process.env.REACT_APP_API_URL;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const generateCaptchaText = () => {
    const chars = "0123456789";
    let text = "";
    for (let i = 0; i < 4; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = `rgba(${50 + Math.random() * 100}, ${50 + Math.random() * 100}, ${50 + Math.random() * 100}, 1)`;

      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 10,
        Math.random() * 10
      );
    }

    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(15 + i * 30, 25);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptchaText();
    setCaptchaText(newCaptcha);
    drawCaptcha(newCaptcha);
    setUserInput("");
  };

  const handleLogin = async () => {
    if (userInput !== captchaText) {
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setError(""); // Clear any previous error message
  
    try {
      const response = await axios.post<LoginResponse>(`${apiUrl}/api/login/`, {
        username,
        password,
      });
      const { access_token, refresh_token, user } = response.data;
  
      // Store tokens securely
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", username)
  
      // Store superuser status
      localStorage.setItem("is_superuser", user.is_superuser ? "true" : "false");
  
      // Redirect to the dashboard
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCaptcha();
    }, 60000); // Refresh every 30 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      handleLogin();
    }
  };
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          backgroundColor: "#f8f9fa",
          borderRadius: 4,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          mt: 10,
          mb: 8,
          border: "1px solid #e0e0e0",
          width: "100%",
        }}
      >
        <Typography variant="h4" fontWeight="700" color="#293c3d" gutterBottom>
          Log In
        </Typography>

        {error && (
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
        )}

        {/* Username */}
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{
            marginBottom: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#d3d290",
              },
              "&:hover fieldset": {
                borderColor: "#aab56b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#aab56b",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#d3d290",
              "&.Mui-focused": {
                color: "#6d7f40",
              },
            },
          }}
        />

        {/* Password */}
        <Box position="relative" width="100%">
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#d3d290",
                },
                "&:hover fieldset": {
                  borderColor: "#aab56b",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#aab56b",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#d3d290",
                "&.Mui-focused": {
                  color: "#6d7f40",
                },
              },
            }}
          />
          <IconButton
            onClick={togglePasswordVisibility}
            sx={{
              position: "absolute",
              top: "10%",
              right: 10,
              color: "#6d7f40",
            }}
          >
            {passwordVisible ? <BsEye /> : <BsEyeSlash />}
          </IconButton>
        </Box>

        <Box textAlign="center" p={2} display="flex" alignItems="center">
          {/* CAPTCHA Canvas */}
          <canvas
            ref={canvasRef}
            width={120}
            height={40}
            style={{
              border: "1px solid #d3d290", // Set border color
              backgroundColor: "#f8f9fa", // Light background
              borderRadius: "4px", // Rounded corners
            }}
          />

          <IconButton
            onClick={refreshCaptcha}
            sx={{ ml: 1, height: "40px", width: "40px" }}
          >
            <Refresh />
          </IconButton>
          <TextField
            placeholder="Enter CAPTCHA"
            onKeyDown={handleKeyDown}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#d3d290",
                },
                "&:hover fieldset": {
                  borderColor: "#aab56b",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#aab56b",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#d3d290",
                "&.Mui-focused": {
                  color: "#6d7f40",
                },
              },
            }}
          />
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message="❌ Incorrect CAPTCHA. Try again."
          anchorOrigin={{ vertical: "top", horizontal: "center" }} // Keep this to avoid TS errors
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)", // Center it properly
            "& .MuiSnackbarContent-root": {
              height: "40px",
            },
          }}
        />

        {/* Login Button */}
        <Button
         onKeyDown={handleKeyDown}
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            mt: 2,
            backgroundColor: "#6d7f40",
            "&:hover": {
              backgroundColor: "#54662a",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
        </Button>

        <Grid
          container
          justifyContent="center"
          alignItems="center"
          spacing={1}
          mt={3}
        >
          <Grid item>
            <Typography variant="body1" color="#293c3d">
              Don't have an account?
            </Typography>
          </Grid>
          <Grid item>
            <Link to="/summarypopup" style={{ textDecoration: "none" }}>
              <Typography variant="body1" color="primary">
                Sign Up
              </Typography>
            </Link>
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          spacing={1}
          mt={3}
        >
          <Grid item>
            <Typography
              onClick={() => setOpen(true)}
              variant="body1"
              color="red"
              sx={{
                cursor: "pointer", // Makes it look clickable
                "&:hover": {
                  textDecoration: "underline", // Optional: adds underline on hover
                },
              }}
            >
              Forgot Password ?
            </Typography>
            <ForgotPassword open={open} onClose={() => setOpen(false)} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};


export default Login;
