import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import axios from "axios";
import { Download } from "@mui/icons-material";
import UnifiedDealSelector from "./UnifiedDealSelector";

const ExportUnifiedDealData: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleDownload = async () => {
    if (!selected.length) {
      alert("Please select at least one deal");
      return;
    }

    setLoading(true);

    try {
      // Build payload as array of {ticker, pricing_date}
      const payload = {
        selections: selected.map((val) => {
          const [ticker, pricing_date] = val.split("|");
          return { ticker, pricing_date };
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

      // Trigger browser download (single Excel file for all selections)
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
    } catch (err) {
      console.error(err);
      alert("Failed to download Excel file");
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
