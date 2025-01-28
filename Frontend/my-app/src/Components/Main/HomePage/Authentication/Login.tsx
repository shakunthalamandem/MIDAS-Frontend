import React, { useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Container,
  Grid,
  CircularProgress,
} from "@mui/material";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Define the response type
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  message: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleLogin = async () => {
    setLoading(true);
    setError(""); // Clear any previous error message

    try {
      const response = await axios.post<LoginResponse>(`${apiUrl}/api/login/`, { username, password });
      const { access_token, refresh_token } = response.data;

      // Store tokens (consider using secure cookies or state management for production apps)
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Redirect to a protected route or dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
            sx={{ position: "absolute", top: "10%", right: 10, color: "#6d7f40" }}
          >
            {passwordVisible ? <BsEye /> : <BsEyeSlash />}
          </IconButton>
        </Box>

        {/* Login Button */}
        <Button
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

        <Grid container justifyContent="center" alignItems="center" spacing={1} mt={3}>
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
      </Box>
    </Container>
  );
};

export default Login;
