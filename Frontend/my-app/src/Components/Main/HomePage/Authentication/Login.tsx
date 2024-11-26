import React, { useState } from "react";
import { TextField, Button, IconButton, Typography, Box, Container, Divider, Grid } from "@mui/material";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

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
          mt: 2, // Reduce top margin for less gap at the top
          mb: 8, // Increase bottom margin for more gap at the bottom
          border: "1px solid #e0e0e0",
          width: "100%",
        }}
      >
        <Typography variant="h4" fontWeight="700" color="#293c3d" gutterBottom>
          Log In
        </Typography>

        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          type="email"
          sx={{
            marginBottom: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#d3d290", // Default border color
              },
              "&:hover fieldset": {
                borderColor: "#aab56b", // Border color on hover
              },
              "&.Mui-focused fieldset": {
                borderColor: "#aab56b", // Changed focus color
              },
            },
            "& .MuiInputLabel-root": {
              color: "#d3d290", // Default label color
              "&.Mui-focused": {
                color: "#6d7f40", // Focused label color
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
            sx={{
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#d3d290", // Default border color
                },
                "&:hover fieldset": {
                  borderColor: "#aab56b", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#aab56b", // Changed focus color
                },
              },
              "& .MuiInputLabel-root": {
                color: "#d3d290", // Default label color
                "&.Mui-focused": {
                  color: "#6d7f40", // Focused label color
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
          sx={{
            mt: 2,
            backgroundColor: "#6d7f40",
            "&:hover": {
              backgroundColor: "#54662a",
            },
          }}
        >
          Log In
        </Button>

        <Grid container justifyContent="center" alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant="body1" color="#293c3d">
              Don't have an account?
            </Typography>
          </Grid>
          <Grid item>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <Typography variant="body1" color="primary">
                Sign Up
              </Typography>
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ width: "100%", my: 2, color: "#aab56b" }}>or</Divider>

        {/* Social Login Buttons */}
        <Grid container spacing={1} sx={{ width: "100%" }}>
          <Grid item xs={6}>
            <Button
              fullWidth
              startIcon={<FaFacebook />}
              variant="contained"
              sx={{
                backgroundColor: "#4267b2",
                color: "white",
                "&:hover": {
                  backgroundColor: "#3b5998",
                },
                fontSize: "0.875rem",
                py: 1,
              }}
            >
              Facebook
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              startIcon={<FcGoogle />}
              variant="outlined"
              sx={{
                color: "#293c3d",
                borderColor: "#d3d290",
                "&:hover": {
                  borderColor: "#6d7f40",
                  backgroundColor: "#f5f5f5",
                },
                fontSize: "0.875rem",
                py: 1,
              }}
            >
              Google
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Login;
