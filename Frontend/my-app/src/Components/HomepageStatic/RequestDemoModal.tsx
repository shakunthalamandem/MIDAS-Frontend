import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from "@mui/material";


interface RequestDemoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; phone: string; email: string; companyname: string }) => void;
}

const countryCodes = [
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
 
];

const RequestDemoModal: React.FC<RequestDemoModalProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    companyname: "",
    countryCode: "+91", 
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
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

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      countryCode: e.target.value,
    });
  };

  const validateForm = () => {
    let formErrors = {
      name: "",
      phone: "",
      email: "",
      companyname: "",
    };

    if (!formData.name) formErrors.name = "Name is required";
    if (!formData.phone) formErrors.phone = "Phone number is required";
    if (!formData.email) formErrors.email = "Email is required";

   
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      formErrors.email = "Provide a valid email (example: johndoe@example.com)";
    }

    if (!formData.companyname) formErrors.companyname = "Company name is required";

    setErrors(formErrors);

    return Object.values(formErrors).every((error) => !error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);

      setFormData({
        name: "",
        phone: "",
        email: "",
        companyname: "",
        countryCode: "+91", 
      });


      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          width: "400px", 
          maxWidth: "none", 
        },
      }}
    >
      <DialogTitle>Request a Demo</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
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
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            <FormControl fullWidth margin="normal" sx={{ width: 130 }}>
              <InputLabel>Country Code</InputLabel>
              <Select
                value={formData.countryCode}
                onChange={handleSelectChange}
                name="countryCode"
                label="Country Code"
                sx={{ fontSize: '0.875rem', height: 35 }}
              >
                {countryCodes.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.code} ({country.country})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              style={{ marginLeft: 8 }}
            />
          </div>
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
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestDemoModal;
