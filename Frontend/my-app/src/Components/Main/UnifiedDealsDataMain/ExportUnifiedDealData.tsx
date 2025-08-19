import React, { useState } from "react";
import { Box, Button, TextField, CircularProgress } from "@mui/material";

const ExportUnifiedDealData: React.FC = () => {
  const [ticker, setTicker] = useState("");
  const [pricingDate, setPricingDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!ticker) {
      alert("Ticker is required");
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!apiUrl) {
      alert("API URL is not defined in environment variables");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/export_deal_unified_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker, pricing_date: pricingDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to download Excel file");
      }

      // extract filename from headers
      let filename = `deal_data_${ticker}${pricingDate ? "_" + pricingDate : ""}.xlsx`;
      const disposition = response.headers.get("content-disposition");
      if (disposition) {
        const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/.exec(disposition);
        if (match?.[1]) filename = decodeURIComponent(match[1]);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
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
    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
      <TextField
        label="Ticker"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        size="small"
        required
      />
      <TextField
        label="Pricing Date"
        type="date"
        value={pricingDate}
        onChange={(e) => setPricingDate(e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : "Download Excel"}
      </Button>
    </Box>
  );
};

export default ExportUnifiedDealData;
