import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { Upload } from "@mui/icons-material";

const UnifiedDealDataUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("operation", "excel_upload");

      const response = await axios.post(
        `${apiUrl}/api/update_deal_unified_data/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Upload successful!");
      console.log("Response:", response.data);
    } catch (error: any) {
      console.error(error);
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            p: 3,
            background: "linear-gradient(to right, #ffecd2, #fcb69f)",
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#002060", mb: 2 }}
            >
              Upload Excel to Database
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                component="label"
                sx={{ borderColor: "#002060", color: "#002060" }}
                startIcon={<Upload />}
              >
                Choose Excel File
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>

              {file && (
                <Typography variant="body2" sx={{ color: "#002060" }}>
                  Selected: {file.name}
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={loading}
                sx={{
                  backgroundColor: "#002060",
                  "&:hover": { backgroundColor: "#001040" },
                  borderRadius: 2,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
              </Button>

              {message && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color: message.startsWith("✅") ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {message}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default UnifiedDealDataUpload;
