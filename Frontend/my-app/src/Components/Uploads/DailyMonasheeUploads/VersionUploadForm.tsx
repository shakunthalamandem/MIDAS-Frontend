import React, { useState } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";

const VersionUploadForm: React.FC = () => {
  const [version, setVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [keyUpdates, setKeyUpdates] = useState("");
  const [dataUpToDate, setDataUpToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSubmit = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!version || !releaseDate || !keyUpdates || !dataUpToDate) {
      setErrorMsg("All fields are required.");
      setSuccessMsg("");
      setOpenSnackbar(true);
      return;
    }

    const payload = {
      version,
      release_date: releaseDate,
      key_updates: keyUpdates,
      data_up_to_date: dataUpToDate,
    };

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/create_version/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed.");
      }

      setSuccessMsg("Version info uploaded successfully!");
      setErrorMsg("");
      // Optional: Clear form
      setVersion("");
      setReleaseDate("");
      setKeyUpdates("");
      setDataUpToDate("");
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong.");
      setSuccessMsg("");
    } finally {
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "60vh",
        background: "linear-gradient(135deg, #f2f6fc, #d9e4f5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 600 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(to bottom right,rgb(223, 137, 215),rgb(155, 226, 127))",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: "#002060", fontWeight: 600 }}
          >
            Upload Version Information
          </Typography>

          <Box display="flex" flexDirection="column" gap={3} mt={3}>
            <TextField
              label="Version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              fullWidth
            />
            <TextField
              label="Release Date"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Key Updates"
              multiline
              minRows={3}
              value={keyUpdates}
              onChange={(e) => setKeyUpdates(e.target.value)}
              fullWidth
            />
            <TextField
              label="Data Up-To-Date"
              type="date"
              value={dataUpToDate}
              onChange={(e) => setDataUpToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                fontWeight: 600,
                letterSpacing: 1,
                bgcolor:'#002060',
                color:'#FFFFFF'
              }}
            >
              {loading ? "Uploading..." : "Submit"}
            </Button>
          </Box>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={5000}
            onClose={() => setOpenSnackbar(false)}
          >
            <Alert
              severity={errorMsg ? "error" : "success"}
              onClose={() => setOpenSnackbar(false)}
            >
              {errorMsg || successMsg}
            </Alert>
          </Snackbar>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default VersionUploadForm;
