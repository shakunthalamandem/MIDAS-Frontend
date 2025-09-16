import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  Alert,
} from "@mui/material";
import axios from "axios";
import { Download } from "@mui/icons-material";
import UnifiedDealSelector from "./UnifiedDealSelector";

const ExportUnifiedDealData: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleDownload = async () => {
    if (!selected.length) {
      setError("Please select at least one deal.");
      return;
    }
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      // Prepare payload for API
      const payload = {
        selections: selected.map((val) => {
          const [ticker, deal_id] = val.split("|");
          return { ticker, deal_id };
        }),
      };

      const resp = await axios.post(
        `${apiUrl}/api/export_deal_unified_data/`,
        payload,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          responseType: "blob",
        }
      );

      // Create blob and trigger download
      const blob = new Blob([resp.data as BlobPart], {
        type:
          resp.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute(
        "download",
        `deal_data_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      // If download was successful, show success message
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to download Excel file. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card
        sx={{
          p: 3,
          borderRadius: 4,
          boxShadow: 6,
          background: "linear-gradient(135deg, #f0f4ff 0%, #e3eeff 100%)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#1a237e",
              textAlign: "center",
              mb: 2,
            }}
          >
            Export Unified Deal Data
          </Typography>

          <UnifiedDealSelector selected={selected} setSelected={setSelected} />

          {/* Show error message if any */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Show success message if download is successful */}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Download successful!
            </Alert>
          )}

          <Box mt={3} display="flex" justifyContent="center">
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Download />}
              onClick={handleDownload}
              disabled={loading || !selected.length}
              sx={{
                px: 3,
                py: 1,
                fontWeight: "bold",
                borderRadius: 3,
                background: "linear-gradient(135deg, #211c6eff 0%, #1a701aff 100%)",
                color: "#fff",
                "&:hover": {
                  background: "linear-gradient(135deg, #a1abbeff 0%, #b8dbb7ff 100%)",
                },
              }}
            >
              {loading ? "Downloading..." : "Download Excel"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ExportUnifiedDealData;
