import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  Stack,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface UploadWarning {
  column: string;
  issue: string;
}

interface RowError {
  row: number;
  error: string;
}

interface UploadResponse {
  status?: string;
  message?: string;
  error?: string;
  details?: string;
  records_deleted?: number;
  records_inserted?: number;
  warnings?: UploadWarning[];
  row_errors?: RowError[];
  column_error?: string[];
}

const LkFileUpload = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [errors, setErrors] = useState({ fromDate: "", toDate: "", file: "" });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [responseData, setResponseData] = useState<UploadResponse | null>(null);
  const [responseStatus, setResponseStatus] = useState<"success" | "error" | "warning" | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { fromDate: "", toDate: "", file: "" };

    if (!fromDate) {
      newErrors.fromDate = "From date is required";
      hasError = true;
    }

    if (!toDate) {
      newErrors.toDate = "To date is required";
      hasError = true;
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      newErrors.toDate = "To date must be after From date";
      hasError = true;
    }

    if (!file) {
      newErrors.file = "Please upload an Excel file (.xls or .xlsx)";
      hasError = true;
    } else {
      const validExtensions = [".xls", ".xlsx"];
      const fileName = file.name.toLowerCase();
      const isValidExtension = validExtensions.some((ext) =>
        fileName.endsWith(ext)
      );
      if (!isValidExtension) {
        newErrors.file = "Only .xls or .xlsx files are allowed";
        hasError = true;
      }
    }

    setErrors(newErrors);
    if (hasError) return;

    const formData = new FormData();
    formData.append("from_date", fromDate);
    formData.append("to_date", toDate);
    if (file) {
      formData.append("file", file);
    }

    setLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    setUploadProgress(0);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      // Use XMLHttpRequest for upload progress tracking
      const data: UploadResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 90); // 0-90% for upload
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          setUploadProgress(100);
          try {
            const result = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(result);
            } else {
              reject({ isApiError: true, data: result, status: xhr.status });
            }
          } catch {
            reject(new Error(`Server returned status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error - please check your connection."));
        xhr.ontimeout = () => reject(new Error("Upload timed out. The file may be too large or the server is busy."));

        xhr.open("POST", `${apiUrl}/api/lk_file_upload/`);
        xhr.setRequestHeader("Authorization", token ? `Bearer ${token}` : "");
        xhr.timeout = 600000; // 10 minutes
        xhr.send(formData);
      });

      // Success
      setResponseData(data);
      if (data.warnings && data.warnings.length > 0) {
        setResponseStatus("warning");
      } else {
        setResponseStatus("success");
      }
      setFromDate("");
      setToDate("");
      setFile(null);
      setUploadedFileName("");

    } catch (err: any) {
      if (err?.isApiError) {
        setResponseData(err.data);
        setResponseStatus("error");
      } else {
        setResponseData({
          error: err?.message || "An error occurred while uploading.",
        });
        setResponseStatus("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxWidth={500}
      sx={{ mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}
    >
      <Typography
        variant="h6"
        align="center"
        sx={{ color: "#002060", fontWeight: 600, mb: 2 }}
      >
        LK File Data Upload
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            type="date"
            label="From Date"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            error={!!errors.fromDate}
            helperText={errors.fromDate}
            fullWidth
          />
          <TextField
            type="date"
            label="To Date"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            error={!!errors.toDate}
            helperText={errors.toDate}
            fullWidth
          />

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 2,
              p: 3,
              background: "linear-gradient(to right, #ffecd2, #fcb69f)",
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 40, color: "#1976d2" }} />

            <input
              accept=".xlsx,.xls"
              id="file-upload"
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button variant="outlined" component="span" sx={{ mt: 1 }}>
                Choose File
              </Button>
            </label>

            {uploadedFileName && (
              <Typography variant="body2" color="#000000" mt={1}>
                <strong>Selected:</strong> {uploadedFileName}
                {file && (
                  <span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                )}
              </Typography>
            )}
          </Box>

          {errors.file && (
            <Typography color="error" textAlign="center">
              {errors.file}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Submit"}
          </Button>

          {loading && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
              />
              <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={0.5}>
                {uploadProgress < 90
                  ? `Uploading file... ${uploadProgress}%`
                  : "Processing data on server..."}
              </Typography>
            </Box>
          )}

          {/* Success Response */}
          {responseStatus === "success" && responseData && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {responseData.message}
              </Typography>
              {responseData.records_inserted !== undefined && (
                <Typography variant="caption" display="block" mt={0.5}>
                  Records inserted: {responseData.records_inserted} | Records deleted: {responseData.records_deleted}
                </Typography>
              )}
            </Alert>
          )}

          {/* Warning Response (success with truncation warnings) */}
          {responseStatus === "warning" && responseData && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {responseData.message}
                </Typography>
                {responseData.records_inserted !== undefined && (
                  <Typography variant="caption" display="block" mt={0.5}>
                    Records inserted: {responseData.records_inserted} | Records deleted: {responseData.records_deleted}
                  </Typography>
                )}
              </Alert>
              <Alert severity="warning">
                <Typography variant="body2" fontWeight={600}>Column Warnings:</Typography>
                {responseData.warnings?.map((w, i) => (
                  <Typography key={i} variant="caption" display="block">
                    - <strong>{w.column}</strong>: {w.issue}
                  </Typography>
                ))}
              </Alert>
            </Box>
          )}

          {/* Error Response */}
          {responseStatus === "error" && responseData && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {responseData.error || "Upload failed."}
              </Typography>
              {responseData.details && (
                <Typography variant="caption" display="block" mt={0.5} sx={{ wordBreak: "break-word" }}>
                  Details: {responseData.details}
                </Typography>
              )}
              {responseData.column_error && responseData.column_error.length > 0 && (
                <Typography variant="caption" display="block" mt={0.5}>
                  Columns with errors: {responseData.column_error.join(", ")}
                </Typography>
              )}
              {responseData.row_errors && responseData.row_errors.length > 0 && (
                <Box mt={0.5}>
                  <Typography variant="caption" fontWeight={600}>Row Errors:</Typography>
                  {responseData.row_errors.map((re, i) => (
                    <Typography key={i} variant="caption" display="block">
                      - Row {re.row}: {re.error}
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          )}
        </Stack>
      </form>
    </Box>
  );
};

export default LkFileUpload;
