import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

interface Props {
  open: boolean;
}

const SessionExpiredPopup: React.FC<Props> = ({ open }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/login");
  };

  useEffect(() => {
    if (open) {
      // Clear session logic if needed
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          background: "linear-gradient(135deg, #002060, #00509E)",
          borderRadius: "12px",
          color: "#fff",
          textAlign: "center",
          padding: "30px",
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#F0F5FF" }}>
          Session Expired
        </DialogTitle>
        <DialogContent sx={{ marginTop: 2 }}>
          <p>Your session has expired. Please log in again.</p>
          <Button
            variant="contained"
            sx={{
              marginTop: 3,
              backgroundColor: "#FFA500",
              "&:hover": { backgroundColor: "#FF7F00" },
              color: "#fff",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
            onClick={handleClose}
          >
            Okay
          </Button>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default SessionExpiredPopup;
