import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  competitor?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  competitor,
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#002060",
        }}
      >
        Delete Competitor
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center" }}>
        Are you sure you want to permanently delete{" "}
        <span style={{ fontWeight: "bold", color: "#01470a" }}>
          {competitor}
        </span>
        ?
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={onCancel}
          sx={{
            backgroundColor: "#e0e0e0",
            color: "black",
            "&:hover": { backgroundColor: "#bdbdbd" },
          }}
          variant="contained"
        >
          No
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          sx={{ ml: 2 }}
        >
          Yes, Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
