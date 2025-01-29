import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";
interface ForgotPasswordResponse {
    message: string; // Adjust this based on what your API actually returns
  }
  

const ForgotPassword: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
// const token = localStorage.getItem("access_token");

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
  
    if (!email) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
  
    try {
        const response = await axios.post<ForgotPasswordResponse>(
            `${apiUrl}/api/password-reset/`,
            { email }
          );
          
          setSuccessMessage(response.data.message);
          
  
      setSuccessMessage(response.data.message);
      setEmail(""); // Clear the email input
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setEmail("");
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
      <Typography variant="body1" fontWeight="700" color="brown">
  Please enter your email address to reset your password
</Typography>

      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          {successMessage && (
            <Typography color="primary" variant="body2">
              {successMessage}
            </Typography>
          )}
          {!successMessage && (
            <>
              <TextField
                fullWidth
                label="Recovery Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {!successMessage ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !email}
            sx={{
              backgroundColor: "#6d7f40",
              "&:hover": {
                backgroundColor: "#54662a",
              },
            }}
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: "#6d7f40",
              "&:hover": {
                backgroundColor: "#54662a",
              },
            }}
          >
            Okay
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPassword;
