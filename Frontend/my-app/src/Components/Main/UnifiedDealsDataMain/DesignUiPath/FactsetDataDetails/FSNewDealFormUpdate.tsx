import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";

interface FSNewDealFormUpdateProps {
  open: boolean;
  onClose: () => void;
  data: any; // You can type it more strictly if needed
  onSubmit: (updatedData: any) => Promise<void>;
}

const FSNewDealFormUpdate: React.FC<FSNewDealFormUpdateProps> = ({ open, onClose, data, onSubmit }) => {
  const [formData, setFormData] = useState(data);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle align="center" color="#002060">Update New Deal Form</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {Object.keys(formData).map((key) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                label={key.replace(/_/g, " ")}
                fullWidth
                value={formData[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FSNewDealFormUpdate;
