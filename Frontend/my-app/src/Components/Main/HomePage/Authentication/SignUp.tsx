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
  username: string;
  email: string;
  password: string;
}
interface SignupResponse {
  message: string; // Adjust this based on your API's actual response structure
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL ; // Update as per your backend URL

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
  
    const { username, email, password } = formData;
  
    if (!username || !email || !password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post<SignupResponse>(`${apiUrl}/api/signup/`, {
        username,
        email,
        password,
      });
  
      // Now `response.data` is correctly typed as `SignupResponse`
      setSuccessMessage(response.data.message);
      setFormData({ username: "", email: "", password: "" });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (!minLength) return "Password must be at least 8 characters.";
    if (!hasUpperCase) return "Password must include at least one uppercase letter.";
    if (!hasLowerCase) return "Password must include at least one lowercase letter.";
    if (!hasNumber) return "Password must include at least one number.";
    if (!hasSpecialChar) return "Password must include at least one special character (!@#$%^&*).";

    return ""; // ✅ Password is valid
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleChange(e); // Call parent function to update form data
    setPasswordError(validatePassword(value)); // Validate password
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
        {successMessage && (
          <Typography color="success" variant="body2" gutterBottom>
            {successMessage}
          </Typography>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {/* Username */}
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            name="username"
            value={formData.username}
            onChange={handleChange}
            sx={{
              marginBottom: 2,
            }}
          />

          {/* Email */}
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

          {/* Password */}
          <Box position="relative" width="100%">
      <TextField
        fullWidth
        label="Password"
        variant="outlined"
        type={passwordVisible ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handlePasswordChange}
        error={!!passwordError}
        helperText={passwordError}
        sx={{ marginBottom: 2 }}
      />
      <IconButton
        onClick={togglePasswordVisibility}
        sx={{ position: "absolute", top: "10%", right: 10 }}
      >
        {passwordVisible ? <BsEye /> : <BsEyeSlash />}
      </IconButton>
    </Box>

          {/* Sign Up Button */}
          <Button
            fullWidth
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

        <Grid container justifyContent="center" alignItems="center" spacing={1} mt={3}>
          <Grid item>
            <Typography variant="body1" color="#293c3d">
              Already have an account?
            </Typography>
          </Grid>
          <Grid item>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Typography variant="body1" color="primary">
                Sign In
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Signup;
