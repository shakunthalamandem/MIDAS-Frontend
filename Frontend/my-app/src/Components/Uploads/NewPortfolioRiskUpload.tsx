import React, { useEffect, useRef, useState } from "react"
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  TextField,
  Chip,
  LinearProgress
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"

const POLL_INTERVAL_MS = 3000

type UploadStartResponse = {
  message?: string
  task_id: string
  status: string
}

type UploadStatusResponse = {
  task_id: string
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | string
  result?: {
    message?: string
    rows_deleted?: number
    rows_inserted?: number
    error?: string
    total_errors?: number
  }
  error?: string
}

type PollOutcome = "pending" | "success" | "failure"

const NewPortfolioRiskUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskId, setTaskId] = useState("")
  const [taskStatus, setTaskStatus] = useState("")

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [])

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token")
    const headers: Record<string, string> = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  const uploadPortfolioFile = (
    url: string,
    formData: FormData
  ): Promise<UploadStartResponse> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const authHeaders = getAuthHeaders()

      xhr.open("POST", url)
      Object.entries(authHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return
        }
        const percent = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(percent)
      }

      xhr.onload = () => {
        let data: any = {}

        try {
          data = xhr.responseText ? JSON.parse(xhr.responseText) : {}
        } catch {
          reject(new Error("Unable to read upload response"))
          return
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as UploadStartResponse)
          return
        }

        reject(new Error(data.error || data.message || "Upload failed"))
      }

      xhr.onerror = () => reject(new Error("Network error while uploading file"))
      xhr.send(formData)
    })

  const pollTaskStatus = async (currentTaskId: string): Promise<PollOutcome> => {
    const apiUrl = process.env.REACT_APP_API_URL

    try {
      const res = await fetch(
        `${apiUrl}/api/portfolio_upload_excel_status/${currentTaskId}/`,
        {
          headers: getAuthHeaders()
        }
      )

      const data: UploadStatusResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch upload status")
      }

      setTaskStatus(data.status)

      if (data.status === "SUCCESS") {
        stopPolling()
        setLoading(false)
        setIsProcessing(false)
        setUploadProgress(100)

        const result = data.result || {}
        if (result.error) {
          setError(result.message || result.error)
          return "failure"
        }

        setMessage(
          `${result.message || "Upload successful"}. Rows inserted: ${result.rows_inserted ?? 0}${typeof result.rows_deleted === "number" ? `, Rows deleted: ${result.rows_deleted}` : ""}`
        )
        setFile(null)
        return "success"
      }

      if (data.status === "FAILURE") {
        stopPolling()
        setLoading(false)
        setIsProcessing(false)
        setError(data.error || "File processing failed")
        return "failure"
      }

      return "pending"
    } catch (err: any) {
      stopPolling()
      setLoading(false)
      setIsProcessing(false)
      setError(err.message || "Failed to track upload status")
      return "failure"
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setError("")
      setMessage("")
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
        setMessage("")
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

    try {
      stopPolling()
      setLoading(true)
      setIsUploading(true)
      setIsProcessing(false)
      setUploadProgress(0)
      setError("")
      setMessage("")
      setTaskId("")
      setTaskStatus("")

      const data = await uploadPortfolioFile(
        `${apiUrl}/api/portfolio_upload_excel/`,
        formData
      )

      if (!data.task_id) {
        throw new Error("Upload started but task id was not returned")
      }

      setTaskId(data.task_id)
      setTaskStatus(data.status || "PENDING")
      setIsUploading(false)
      setIsProcessing(true)
      setUploadProgress(100)

      const firstPollResult = await pollTaskStatus(data.task_id)

      if (firstPollResult === "pending") {
        pollRef.current = setInterval(() => {
          pollTaskStatus(data.task_id)
        }, POLL_INTERVAL_MS)
      }
    } catch (err: any) {
      setError(err.message || "Upload failed")
      setLoading(false)
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  const statusLabel = isUploading
    ? `Uploading ${uploadProgress}%`
    : isProcessing
    ? `Processing ${taskStatus || "PENDING"}`
    : taskStatus

  const buttonLabel = isUploading
    ? `Uploading ${uploadProgress}%`
    : isProcessing
    ? "Processing..."
    : "Upload File"

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
            {buttonLabel}
          </Button>

          {(isUploading || isProcessing) && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "#f8fbff",
                border: "1px solid #dbeafe"
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e3a8a" }}>
                  {statusLabel}
                </Typography>
                {taskStatus && (
                  <Chip
                    size="small"
                    label={taskStatus}
                    sx={{
                      fontWeight: 600,
                      bgcolor: isProcessing ? "#fff7ed" : "#eff6ff",
                      color: isProcessing ? "#c2410c" : "#1d4ed8"
                    }}
                  />
                )}
              </Stack>

              {isUploading ? (
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ height: 8, borderRadius: 999 }}
                />
              ) : (
                <LinearProgress sx={{ height: 8, borderRadius: 999 }} />
              )}

              <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#64748b" }}>
                {isUploading
                  ? "Uploading the Excel file to the server."
                  : "File upload is complete. The portfolio processing task is running in Celery."}
              </Typography>

              {taskId && (
                <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#64748b" }}>
                  Task ID: {taskId}
                </Typography>
              )}
            </Box>
          )}

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
