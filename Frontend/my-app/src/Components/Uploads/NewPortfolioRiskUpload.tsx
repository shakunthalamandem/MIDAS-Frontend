import React, { useState } from "react"
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  TextField
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"

const NewPortfolioRiskUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setError("")
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      const ext = droppedFile.name.split(".").pop()?.toLowerCase()
      if (ext === "xlsx" || ext === "xls") {
        setFile(droppedFile)
        setError("")
      } else {
        setError("Please upload an Excel file (.xlsx or .xls)")
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }
    if (!startDate || !endDate) {
      setError("Please select both start date and end date")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("start_date", startDate)
    formData.append("end_date", endDate)

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    try {
      setLoading(true)
      setError("")
      setMessage("")

      const res = await fetch(`${apiUrl}/api/portfolio_upload_excel/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setMessage(
        `Uploaded successfully. Rows inserted: ${data.rows_inserted}`
      )
      setFile(null)
    } catch (err: any) {
      setError(err.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f7fa",
        p: 3
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)"
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            py: 3,
            px: 4,
            borderRadius: "12px 12px 0 0"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <CloudUploadIcon sx={{ color: "#fff", fontSize: 32 }} />
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 600 }}>
              Upload Portfolio Excel
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5, ml: 5.5 }}>
            Upload your .xlsx or .xls file to import portfolio data
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Box
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            sx={{
              border: dragOver ? "2px solid #1976d2" : "2px dashed #bdbdbd",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: dragOver ? "rgba(25,118,210,0.06)" : "#fafafa",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#1976d2",
                bgcolor: "rgba(25,118,210,0.04)"
              }
            }}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {file ? (
              <Stack alignItems="center" spacing={1}>
                <InsertDriveFileIcon sx={{ fontSize: 48, color: "#1976d2" }} />
                <Typography variant="body1" sx={{ fontWeight: 500, color: "#333" }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#888" }}>
                  {(file.size / 1024).toFixed(1)} KB — Click or drag to replace
                </Typography>
              </Stack>
            ) : (
              <Stack alignItems="center" spacing={1}>
                <CloudUploadIcon sx={{ fontSize: 48, color: "#bdbdbd" }} />
                <Typography variant="body1" sx={{ color: "#666" }}>
                  Drag & drop your file here
                </Typography>
                <Typography variant="caption" sx={{ color: "#999" }}>
                  or click to browse — .xlsx, .xls accepted
                </Typography>
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>

          <Button
            variant="contained"
            fullWidth
            onClick={handleUpload}
            disabled={loading || !file || !startDate || !endDate}
            startIcon={loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <CloudUploadIcon />}
            sx={{
              mt: 3,
              py: 1.3,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              borderRadius: 2,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)"
              },
              "&.Mui-disabled": {
                background: "#e0e0e0",
                color: "#9e9e9e"
              }
            }}
          >
            {loading ? "Uploading..." : "Upload File"}
          </Button>

          {message && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default NewPortfolioRiskUpload
