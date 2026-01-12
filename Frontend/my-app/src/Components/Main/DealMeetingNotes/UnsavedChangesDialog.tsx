import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

type UnsavedChangesDialogProps = {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
};

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onClose,
  onDiscard,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography color="#002060" variant="h6" align="center">
          Unsaved Changes
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>You have unsaved changes. Do you want to discard them?</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Keep Editing
        </Button>
        <Button onClick={onDiscard} variant="contained" color="error">
          Discard Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
