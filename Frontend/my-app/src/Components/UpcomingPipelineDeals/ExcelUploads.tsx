import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type UploadKind =
  | "ipo_international"
  | "ipo_us_new_deals"
  | "fo_new_deals"
  | "ipo_europe_new_deals";

const uploadTargets: Record<
  UploadKind,
  { label: string; endpoint: string; helper: string }
> = {
  ipo_international: {
    label: "IPO International",
    endpoint: "/api/ipo_international/",
    helper:
      "Columns: Tickers, Country, Sectors, Consumer & Retail, Backers, Banks, Size ($m), Valuation ($m), Date, Description",
  },
  ipo_us_new_deals: {
    label: "IPO US (New Deals)",
    endpoint: "/api/ipo_us_new_deals/",
    helper:
      "Columns: Ticker, Company, Sector, Current Price ($), Implied Secondary Mkt Valuation ($m), Last Round (LR) Price ($), Last Round / Company Mark, Last Round Post-Money Valuation ($m), Discount / Premium to Last Round",
  },
  fo_new_deals: {
    label: "Follow-On (New Deals)",
    endpoint: "/api/fo_new_deals/",
    helper:
      "Columns: Country, Sectors, Consumer & Retail, Ticker, Key Holders, Sell-Down Size ($m), Shares (m), % Market Cap, % Free Float, 6m ADTV (m), Current Price (LCY), Market Cap ($m), 6m ADTV ($m), YTD Move, % off 52-wk High, Last Placement Date, Last Placement Size ($m), Shares Sold (m), Placement Price (LCY), Discount (%), % Above / (Below) Offer, Lock-Up Date, Earnings",
  },
  ipo_europe_new_deals: {
    label: "IPO Europe (New Deals)",
    endpoint: "/api/ipo_europe_new_deals/",
    helper: "Columns: Ticker, France / BeNeLux, Sector, Seller(s), Source Link",
  },
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ExcelUploads: React.FC = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [kind, setKind] = useState<UploadKind>("ipo_international");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const helperText = useMemo(() => uploadTargets[kind].helper, [kind]);

  const handleUpload = async () => {
    setMessage(null);
    setError(null);

    if (!API_URL) {
      setError("REACT_APP_API_URL is not set.");
      return;
    }
    if (!file) {
      setError("Please choose an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(`${API_URL}${uploadTargets[kind].endpoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...getAuthHeaders(),
        },
        body: formData,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Upload failed");
      }

      setMessage(
        data?.inserted
          ? `Uploaded successfully. Inserted: ${data.inserted}`
          : "Uploaded successfully."
      );
      setFile(null);
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please retry.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 2, md: 4 },
        background:
          "radial-gradient(circle at 15% 20%, rgba(230,240,255,0.6), transparent 32%), radial-gradient(circle at 85% 15%, rgba(255,233,240,0.55), transparent 28%), linear-gradient(180deg, #f7f9fc 0%, #ffffff 45%, #f7f9fc 100%)",
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 960,
          mx: "auto",
          borderRadius: 4,
          border: "1px solid rgba(130,143,255,0.35)",
          boxShadow: "0 20px 55px rgba(43,71,255,0.12)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,248,255,0.96))",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
            Deal Imports
          </Typography>
          <Typography variant="body2" sx={{ color: "#4b5563", mb: 3 }}>
            Select the target dataset, attach your Excel file, and upload. All endpoints accept
            `file` as multipart/form-data.
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              select
              fullWidth
              label="Target dataset"
              value={kind}
              onChange={(e) => setKind(e.target.value as UploadKind)}
              helperText={helperText}
            >
              {Object.entries(uploadTargets).map(([value, cfg]) => (
                <MenuItem key={value} value={value}>
                  {cfg.label}
                </MenuItem>
              ))}
            </TextField>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px dashed rgba(99, 102, 241, 0.4)",
                backgroundColor: "rgba(99, 102, 241, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#111827" }}>
                  Upload Excel
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Accepted: .xlsx, .xls
                </Typography>
              </Box>
              <Button variant="contained" component="label" disabled={isUploading}>
                Choose file
                <input
                  hidden
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Button>
              <Typography variant="body2" sx={{ color: "#374151", minWidth: 180 }}>
                {file ? file.name : "No file selected"}
              </Typography>
            </Box>

            {isUploading && <LinearProgress />}

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {message && (
              <Alert severity="success" onClose={() => setMessage(null)}>
                {message}
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={isUploading}
                sx={{
                  px: 3.5,
                  borderRadius: 2.5,
                  textTransform: "none",
                  boxShadow: "0 12px 30px rgba(99,102,241,0.25)",
                }}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExcelUploads;
