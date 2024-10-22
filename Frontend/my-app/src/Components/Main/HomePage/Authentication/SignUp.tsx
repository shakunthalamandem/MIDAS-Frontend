import React, { useState } from "react";
import { TextField, Button, IconButton, Typography, Box, Container, Divider, Grid } from "@mui/material";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import { Link } from "react-router-dom";

const Signup: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

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
          marginTop: 5
        }}
      >
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Sign Up
        </Typography>

        {/* Full Name */}
        <TextField
          fullWidth
          label="Full Name"
          variant="outlined"
          sx={{ marginBottom: 2 }}
        />

        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          type="email"
          sx={{ marginBottom: 2 }}
        />

        {/* Password */}
        <Box position="relative" width="100%">
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            type={passwordVisible ? "text" : "password"}
          />
          <IconButton
            onClick={togglePasswordVisibility}
            sx={{ position: "absolute", top: "30%", right: 10 }}
          >
            {passwordVisible ? <BsEyeSlash /> : <BsEye />}
          </IconButton>
        </Box>

        {/* Confirm Password */}
        <Box position="relative" width="100%">
          <TextField
            fullWidth
            label="Confirm Password"
            variant="outlined"
            type={confirmPasswordVisible ? "text" : "password"}
            sx={{ marginTop: 2 }}
          />
          <IconButton
            onClick={toggleConfirmPasswordVisibility}
            sx={{ position: "absolute", top: "30%", right: 10 }}
          >
            {confirmPasswordVisible ? <BsEyeSlash /> : <BsEye />}
          </IconButton>
        </Box>

        {/* Sign Up Button */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
        >
          Sign Up
        </Button>

        <Grid container justifyContent="center" alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant="body1">
              Already have an account?
            </Typography>
          </Grid>
          <Grid item>
            <Link to="/signin" style={{ textDecoration: "none" }}>
              <Typography variant="body1" color="primary">
                Sign In
              </Typography>
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ width: "100%", my: 2 }}>or</Divider>

        {/* Social Sign Up Buttons */}
        <Button
          fullWidth
          startIcon={<FaFacebook />}
          variant="contained"
          sx={{ backgroundColor: "#4267b2", color: "white", marginBottom: 1 }}
        >
          Sign Up with Facebook
        </Button>
        <Button
          fullWidth
          startIcon={<FcGoogle />}
          variant="outlined"
          sx={{ marginBottom: 2 }}
        >
          Sign Up with Google
        </Button>
      </Box>
    </Container>
  );
};

export default Signup;
