import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Alert } from "@mui/material";

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const status = searchParams.get("status");

  // Messages based on verification status
  const getMessage = () => {
    switch (status) {
      case "success":
        return { severity: "success", message: "Email verified successfully! You can now log in." };
      case "already-verified":
        return { severity: "info", message: "Your email is already verified. You can log in now." };
      case "expired":
        return { severity: "error", message: "Verification link has expired. Please request a new verification email." };
      case "invalid":
        return { severity: "error", message: "Invalid verification link. Please check your email for the correct link." };
      default:
        return { severity: "warning", message: "Unknown verification status." };
    }
  };

  const { severity, message } = getMessage();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Box
        width={400}
        padding={3}
        border="1px solid #ddd"
        borderRadius={4}
        boxShadow={2}
        textAlign="center"
      >
        <Typography variant="h5" marginBottom={2}>
          Email Verification
        </Typography>
        <Alert severity={severity as "success" | "info" | "error" | "warning"} sx={{ mb: 2 }}>
          {message}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Box>
    </Box>
  );
};

export default EmailVerification;
