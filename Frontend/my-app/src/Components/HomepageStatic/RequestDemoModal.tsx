import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";

interface RequestDemoModalProps {
  open: boolean;
  onClose: () => void;
}

const RequestDemoModal: React.FC<RequestDemoModalProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyname: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    companyname: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let formErrors = { name: "", email: "", companyname: "" };
    if (!formData.name) formErrors.name = "Name is required";
    if (!formData.email) formErrors.email = "Email is required";
    if (!formData.companyname) formErrors.companyname = "Company name is required";

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      formErrors.email = "Provide a valid email";
    }

    setErrors(formErrors);
    return Object.values(formErrors).every((error) => !error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      emailjs
        .send(
          "service_1404", 
          "template_r1dcptd", 
          formData, 
          "lUvtEwbYDxNbYX2_o"
        )
        .then(
          () => {
            setFormData({ name: "", email: "", companyname: "" });
            onClose();
          },
          (error) => console.error("Error sending email:", error)
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      BackdropProps={{
        style: {
          background: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(8px)",
        },
      }}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          padding: 3,
          background: "#1e1e2f",
          color: "white",
          width: "400px",
        },
      }}
    >
      <DialogTitle>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          Request a Demo
        </motion.div>
      </DialogTitle>
      <DialogContent>
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={Boolean(errors.name)}
            helperText={errors.name}
            sx={{
              input: { color: "white" },
              label: { color: "gray" },
              fieldset: { borderColor: "#FFFFFF" },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: "#FFD700" },
                '&.Mui-focused fieldset': { borderColor: "#FF6347" },
              },
            }}
          />
          <TextField
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={{
              input: { color: "white" },
              label: { color: "gray" },
              fieldset: { borderColor: "#FFFFFF" },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: "#FFD700" },
                '&.Mui-focused fieldset': { borderColor: "#FF6347" },
              },
            }}
          />
          <TextField
            label="Company Name"
            name="companyname"
            value={formData.companyname}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={Boolean(errors.companyname)}
            helperText={errors.companyname}
            sx={{
              input: { color: "white" },
              label: { color: "gray" },
              fieldset: { borderColor: "#FFFFFF" },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: "#FFD700" },
                '&.Mui-focused fieldset': { borderColor: "#FF6347" },
              },
            }}
          />
        </motion.form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#ff5252" }}>Close</Button>
        <Button onClick={handleSubmit} sx={{ background: "#4caf50", color: "white" }}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestDemoModal;
