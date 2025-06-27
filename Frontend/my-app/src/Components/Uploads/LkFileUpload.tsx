import React, { useState } from "react";
import {
    Button,
    TextField,
    Box,
    Typography,
    InputLabel,
    FormHelperText,
    LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const LkFileUpload = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [errors, setErrors] = useState({ fromDate: "", toDate: "", file: "" });
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [responseMessage, setResponseMessage] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        setUploadedFileName(selectedFile ? selectedFile.name : "");
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
        setResponseMessage("");
        setUploadProgress(0);

        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const token = localStorage.getItem("access_token");

            const res = await fetch(`${apiUrl}/api/upload/lk_file/`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            const data = await res.json();

            if (res.ok) {
                setResponseMessage(data.message || "Upload successful.");
                setFromDate("");
                setToDate("");
                setFile(null);
                setUploadedFileName("");
            } else {
                setResponseMessage(data.error || "Upload failed.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setResponseMessage("An error occurred while uploading.");
        } finally {
            setLoading(false);
            setUploadProgress(100);
        }
    };

    return (
        <Box
            maxWidth={500}
            sx={{ mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}
        >
            <Typography
                variant="h6"
                gutterBottom
                align="center"
                sx={{ color: '#002060', fontWeight: 600 }}
            >
                LK File Data Upload
            </Typography>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    type="date"
                    label="From Date"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    error={!!errors.fromDate}
                    helperText={errors.fromDate}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    type="date"
                    label="To Date"
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    error={!!errors.toDate}
                    helperText={errors.toDate}
                    margin="normal"
                />

                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                    sx={{
                        border: "2px dashed #ccc",
                        borderRadius: 2,
                        p: 3,
                        mt: 2,
                        backgroundColor: "#fdfdfd",
                    }}
                >
                    <CloudUploadIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                    <input
                        accept=".xlsx, .xls"
                        style={{ display: "none" }}
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload">
                        <Button variant="contained" component="span">
                            Choose File
                        </Button>
                    </label>

                    {uploadedFileName && (
                        <Typography sx={{ mt: 1 }} color="text.secondary">
                            <strong>Selected:</strong> {uploadedFileName}
                        </Typography>
                    )}
                </Box>

                {errors.file && (
                    <Typography color="error" align="center" sx={{ mt: 2 }}>
                        {errors.file}
                    </Typography>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                    disabled={loading}
                >
                    {loading ? "Uploading..." : "Submit"}
                </Button>

                {loading && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                    </Box>
                )}

                {responseMessage && (
                    <Typography color="secondary" mt={2} textAlign="center">
                        {responseMessage}
                    </Typography>
                )}
            </form>
        </Box>
    );
};

export default LkFileUpload;
