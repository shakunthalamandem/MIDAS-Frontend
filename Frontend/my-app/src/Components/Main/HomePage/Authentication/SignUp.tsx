import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Container,
  Grid,
} from "@mui/material";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import { Link } from "react-router-dom";

// Define the form data interface
interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmPasswordVisible(!confirmPasswordVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: SignupFormData) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    const { fullName, email, password } = formData;

    try {
      const response = await axios.post(`${apiUrl}/api/signup/`, {
        full_name: fullName,
        email,
        password,
      });
      console.log("Signup successful:", response.data);
      // Handle successful signup (e.g., redirect or show success message)
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    handleSignup();
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
          mt: 2,
          mb: 8,
          border: "1px solid #e0e0e0",
          width: "100%",
        }}
      >
        <Typography variant="h4" fontWeight="700" color="#293c3d" gutterBottom>
          Sign Up
        </Typography>

        {error && (
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            sx={{
              marginBottom: 2,
            }}
          />

          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            sx={{
              marginBottom: 2,
            }}
          />

          <Box position="relative" width="100%">
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                marginBottom: 2,
              }}
            />
            <IconButton
              onClick={togglePasswordVisibility}
              sx={{
                position: "absolute",
                top: "10%",
                right: 10,
              }}
            >
              {passwordVisible ? <BsEye /> : <BsEyeSlash />}
            </IconButton>
          </Box>

          <Box position="relative" width="100%">
            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              type={confirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              sx={{
                marginTop: 2,
              }}
            />
            <IconButton
              onClick={toggleConfirmPasswordVisibility}
              sx={{
                position: "absolute",
                top: "30%",
                right: 10,
              }}
            >
              {confirmPasswordVisible ? <BsEye /> : <BsEyeSlash />}
            </IconButton>
          </Box>

          <Button
            fullWidth={true}
            variant="contained"
            color="primary"
            type="submit"
            sx={{
              mt: 2,
              backgroundColor: "#6d7f40",
              "&:hover": {
                backgroundColor: "#54662a",
              },
            }}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Signup;
