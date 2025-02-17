import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface LogoutProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    // Call the onConfirm callback to handle actual logout logic
    setTimeout(() => {
      setLoading(false);
      onConfirm(); // Invoke onConfirm when logout is successful
    }, 1500); // Simulate API delay
  };

  return (
    <Dialog open={true} onClose={onCancel}>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" color="primary">
          Logging out...
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          You are about to log out. Do you want to continue?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? "Logging Out..." : "Yes, Log Out"}
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Logout;
