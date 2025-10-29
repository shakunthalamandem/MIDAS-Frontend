import React, { useState, ChangeEvent, FormEvent, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { SelectChangeEvent } from "@mui/material";

type Region = "US" | "HK" | "EMEA";
type USDocType = "S1" | "Report Card";
type HKDocType = "A1" | "Additional Analytics";
type EMEADocType = "All Analytic Documents";
type DocType = USDocType | HKDocType | EMEADocType;

const REGION_OPTIONS: Region[] = ["US", "HK", "EMEA"];
const REGION_TO_TYPES: Record<Region, DocType[]> = {
  US: ["S1", "Report Card"],
  HK: ["A1", "Additional Analytics"],
  EMEA: ["All Analytic Documents"],
};

const isSingleFileDoc = (region: Region, docType?: DocType) =>
  (region === "US" && docType === "S1") ||
  (region === "HK" && docType === "A1");

const endpointFor = (region: Region, docType?: DocType) => {
  if (region === "US" && docType === "S1") return "upload_s1";
  if (region === "US" && docType === "Report Card")
    return "upload_ipo_s1_categories";
  if (region === "HK" && docType === "A1") return "upload_s1";
  if (region === "HK" && docType === "Additional Analytics")
    return "update_ipo_s1_ai";
  return undefined;
};

const IPOS1FileUpload: React.FC = () => {
  const [region, setRegion] = useState<Region>("US");
  const [docType, setDocType] = useState<DocType>("S1");
  const [files, setFiles] = useState<File[]>([]);
  const [ticker, setTicker] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [severity, setSeverity] = useState<"success" | "error" | "info">(
    "info"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const allowMultiple = useMemo(
    () => !isSingleFileDoc(region, docType),
    [region, docType]
  );
  const docOptions = REGION_TO_TYPES[region];
  const isEMEA = region === "EMEA";

  const resetSelectionsForRegion = (newRegion: Region) => {
    const firstType = REGION_TO_TYPES[newRegion][0];
    setDocType(firstType);
    setFiles([]);
    setTicker("");
  };

  const handleRegionChange = (e: SelectChangeEvent) => {
    const value = e.target.value as Region;
    setRegion(value);
    resetSelectionsForRegion(value);
    setMessage("");
  };

  const handleDocTypeChange = (e: SelectChangeEvent) => {
    const value = e.target.value as DocType;
    setDocType(value);
    setFiles([]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const nonPdf = selected.find((f) => f.type !== "application/pdf");
    if (nonPdf) {
      setMessage("Only PDF files are allowed.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setFiles(allowMultiple ? selected : [selected[0]]);
  };

  const handleRemoveFile = (idx: number) => {
    const next = [...files];
    next.splice(idx, 1);
    setFiles(next);
  };

  const validate = () => {
    if (isEMEA) {
      setMessage("EMEA uploads are coming soon.");
      setSeverity("info");
      setSnackbarOpen(true);
      return false;
    }
    if (!files.length) {
      setMessage("Please select PDF file(s).");
      setSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    if (!ticker.trim()) {
      setMessage("Please enter a ticker (mandatory for all).");
      setSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const endpointKey = endpointFor(region, docType);
    if (!endpointKey) {
      setMessage("No endpoint configured for this selection.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const endpoint = `${apiUrl}/api/${endpointKey}/`;
    const market = region;

    const formData = new FormData();
    formData.append("market", market);
    formData.append("ticker", ticker.trim());

    if (isSingleFileDoc(region, docType)) {
      formData.append("file", files[0]);
    } else {
      files.forEach((f) => formData.append("files", f, f.name));
    }

    setLoading(true);
    setSnackbarOpen(false);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setMessage(data.message || "Upload successful.");
        setSeverity("success");
        setFiles([]);
        setTicker("");
      } else {
        setMessage(data.error || "Upload failed.");
        setSeverity("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong during upload.");
      setSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 640, mx: "auto", mt: 4 }}>
      <Card elevation={3} sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center" color="primary">
            Upload IPO Documents
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <FormControl fullWidth>
              <InputLabel id="region-label">Region</InputLabel>
              <Select
                labelId="region-label"
                value={region}
                label="Region"
                onChange={handleRegionChange}
              >
                {REGION_OPTIONS.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={isEMEA}>
              <InputLabel id="doctype-label">Document Type</InputLabel>
              <Select
                labelId="doctype-label"
                value={docType}
                label="Document Type"
                onChange={handleDocTypeChange}
              >
                {docOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {isEMEA && (
            <Alert severity="info" sx={{ mb: 2 }}>
              EMEA uploads are <strong>coming soon</strong>.
            </Alert>
          )}

          {!isEMEA && (
            <>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 2 }}
                alignItems="center"
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  {allowMultiple ? "Select PDF Files" : "Select PDF File"}
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={handleFileChange}
                    multiple={allowMultiple}
                  />
                </Button>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {allowMultiple ? "Multiple PDFs allowed" : "Single PDF only"}
                </Typography>
              </Stack>

              {!!files.length && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 2, flexWrap: "wrap" }}
                >
                  {files.map((f, idx) => (
                    <Chip
                      key={idx}
                      label={f.name}
                      onDelete={() => handleRemoveFile(idx)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              )}

              <TextField
                label="Ticker (e.g., AAPL)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />

              <Box component="form" onSubmit={handleSubmit}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    loading || isEMEA || files.length === 0 || !ticker.trim()
                  }
                  fullWidth
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Upload"
                  )}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={7000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IPOS1FileUpload;
