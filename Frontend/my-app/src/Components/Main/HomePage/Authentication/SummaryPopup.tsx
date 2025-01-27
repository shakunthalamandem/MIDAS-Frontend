import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Slide } from "@mui/material";
import { motion } from "framer-motion";

const SummaryPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    navigate("/login");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Slide}
      transitionDuration={{ enter: 500, exit: 300 }}
    >
      <DialogTitle
        style={{
          background: "linear-gradient(90deg, #ff8a65, #ff7043)",
          color: "#fff",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Attention
      </DialogTitle>
      <DialogContent >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="body1" align="center" style={{ color: "#333", fontSize: "1.1rem" }}>
            Please contact the <strong>GHC Administration</strong> for further assistance.
          </Typography>
        </motion.div>
      </DialogContent>
      <DialogActions style={{ justifyContent: "center", paddingBottom: "20px" }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            style={{
              backgroundColor: "#ff7043",
              color: "#fff",
              padding: "10px 30px",
              borderRadius: "8px",
              fontWeight: "bold",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            Okay
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

export default SummaryPopup;
