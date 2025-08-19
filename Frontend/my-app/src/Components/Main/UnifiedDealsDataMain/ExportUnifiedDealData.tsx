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
    <Container>
      <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export Unified Deal Data
          </Typography>

          <UnifiedDealSelector selected={selected} setSelected={setSelected} />

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Download />}
              onClick={handleDownload}
              disabled={loading || !selected.length}
            >
              {loading ? <CircularProgress size={20} /> : "Download Excel"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ExportUnifiedDealData;
