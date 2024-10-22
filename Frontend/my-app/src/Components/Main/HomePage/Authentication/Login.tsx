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
    <Container maxWidth="sm">
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 3,
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          marginTop: 5,
        }}
      >
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Sign In
        </Typography>

        {/* Email Input */}
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          type="email"
          sx={{ marginBottom: 2 }}
        />

        {/* Password Input */}
        <Box position="relative" width="100%">
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            type={passwordVisible ? "text" : "password"}
            sx={{ marginBottom: 2 }}
          />
          <IconButton
            onClick={togglePasswordVisibility}
            sx={{ position: "absolute", top: "30%", right: 10 }}
          >
            {passwordVisible ? <BsEyeSlash /> : <BsEye />}
          </IconButton>
        </Box>

        {/* Forget Password Link */}
        <Link to="/forgot-password" style={{ textDecoration: "none", alignSelf: "flex-end" }}>
          <Typography variant="body2" color="primary">
            Forget Password?
          </Typography>
        </Link>

        {/* Login Button */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
        >
          Login
        </Button>

        <Grid container justifyContent="center" alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant="body1">
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

        <Divider sx={{ width: "100%", my: 2 }}>or</Divider>

        {/* Social Login Buttons */}
        <Button
          fullWidth
          startIcon={<FaFacebook />}
          variant="contained"
          sx={{ backgroundColor: "#4267b2", color: "white", marginBottom: 1 }}
        >
          Login with Facebook
        </Button>
        <Button
          fullWidth
          startIcon={<FcGoogle />}
          variant="outlined"
          sx={{ marginBottom: 2 }}
        >
          Login with Google
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
