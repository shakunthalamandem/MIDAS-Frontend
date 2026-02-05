import React from "react";
import {
  Box,
  Typography,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface UploadConfig {
  key: string;
  label: string;
  apiEndpoint: string;
  buttonColor: string;
}

interface Props {
  activeUpload: string;
  setActiveUpload: (value: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  uploadedFileName: string;
  setUploadedFileName: (name: string) => void;
  error: string;
  setError: (err: string) => void;
  uploadConfigs: UploadConfig[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const UploadDataCard: React.FC<Props> = ({
  activeUpload,
  setActiveUpload,
  file,
  setFile,
  uploadedFileName,
  setUploadedFileName,
  error,
  setError,
  uploadConfigs,
  handleFileChange,
  handleUpload,
  uploading,
  uploadProgress,
}) => {
  return (
    <>
        <Box
          maxWidth={600}
          sx={{ mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}
        >
                <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        p: 3,
        background: "linear-gradient(to bottom,rgb(243, 235, 191),rgb(240, 169, 230))",
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        color="primary"
        align="center"
        sx={{ fontWeight: 600 }}
      >
        Upload Data
      </Typography>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="upload-type-label">Select Upload Type</InputLabel>
        <Select
          labelId="upload-type-label"
          id="upload-type"
          value={activeUpload}
          label="Select Upload Type"
          onChange={(e) => {
            setActiveUpload(e.target.value);
            setFile(null);
            setUploadedFileName("");
            setError("");
          }}
        >
          {uploadConfigs.map((config) => (
            <MenuItem key={config.key} value={config.key}>
              {config.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {activeUpload && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="subtitle1"
            align="center"
            color="textSecondary"
            gutterBottom
          >
            {
              uploadConfigs.find((cfg) => cfg.key === activeUpload)?.label
            }
          </Typography>

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            sx={{
                border:'1px solid',
              borderRadius: 2,
              p: 3,
              mt: 2,
        background: "linear-gradient(to bottom,rgb(243, 235, 191),rgb(240, 169, 230))",
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
              <Typography sx={{ mt: 1 }} color="#000000">
                <strong>Selected:</strong> {uploadedFileName}
              </Typography>
            )}
          </Box>

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            onClick={handleUpload}
            fullWidth
            variant="contained"
            color="success"
            sx={{ mt: 3 }}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit"}
          </Button>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Box>
      )}
    </Card>
    
    </Box>
    </>
    
  );
};

export default UploadDataCard;
