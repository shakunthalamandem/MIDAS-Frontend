// src/components/IPODashboardMain/IPOValuationSection.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  TextField,
  Button,
  Slider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { SelectedData } from "./IPODealsS1DealData";

interface Props {
  selectedData: SelectedData;
}

const IPOValuationSection: React.FC<Props> = ({ selectedData }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const valuation = selectedData?.valuation ?? [];

  const [editValuationMode, setEditValuationMode] = useState(false);
  const [editedValuation, setEditedValuation] = useState<string[]>(valuation);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Image controls
  const initialImageUrl = selectedData.valuation_image_url || null;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialImageUrl
  );
  const [imageScale, setImageScale] = useState<number>(100); // percent width

  const handleAddValuationLine = (index: number) => {
    const updated = [...editedValuation];
    updated.splice(index + 1, 0, "");
    setEditedValuation(updated);
  };

  const handleRemoveValuationLine = (index: number) => {
    const updated = [...editedValuation];
    updated.splice(index, 1);
    setEditedValuation(updated);
  };

  const handleOpenEditor = () => {
    setEditedValuation(Array.isArray(valuation) ? valuation : []);
    setUploadError(null);
    setEditValuationMode(true);
  };

  const handleCancelValuation = () => {
    setEditedValuation(Array.isArray(valuation) ? valuation : []);
    setImageFile(null);
    // Keep any already saved/known image URL as preview
    setImagePreviewUrl(initialImageUrl);
    setImageScale(100);
    setEditValuationMode(false);
    setUploadError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file.");
      return;
    }

    setImageFile(file);
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveValuation = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined");
      if (!selectedData.ticker_name) throw new Error("Ticker name is missing");

      const cleaned = (editedValuation || []).filter(
        (item) => item.trim() !== ""
      );
      const formatted = cleaned.map((item) => `• ${item}`).join("\n");

      const formData = new FormData();
      formData.append("ticker_name", selectedData.ticker_name);
      formData.append("valuation", formatted);

      if (imageFile) {
        // backend should expect something like "valuation_image"
        formData.append("valuation_image", imageFile);
      }

      const response = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "PATCH",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          // Don't set Content-Type; browser will set multipart boundary
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save valuation");

      // Sync simple text bullets with selectedData (matching your existing pattern)
      selectedData.valuation = cleaned;

      // If backend returns an image URL, you could read it here:
      // const resJson = await response.json();
      // setImagePreviewUrl(resJson.valuation_image_url ?? imagePreviewUrl);

      setEditValuationMode(false);
    } catch (err: any) {
      setUploadError(err.message || "Unknown error occurred");
    }
  };

  // ----- View Mode Layout Helpers -----
  const renderValuationList = () => {
    return Array.isArray(valuation) && valuation.length > 0 ? (
      <Box component="ul" sx={{ pl: 3, color: "#333", mt: 1 }}>
        {valuation.map((item: string, index: number) => (
          <li key={index} style={{ marginBottom: 8, lineHeight: 1.6 }}>
            {item}
          </li>
        ))}
      </Box>
    ) : (
      <Typography
        variant="body1"
        sx={{ color: "#333", textAlign: "center", mt: 2 }}
      >
        No valuation data available.
      </Typography>
    );
  };

  const renderViewModeContent = () => {
    if (imagePreviewUrl) {
      // 70/30 layout when image exists
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            minHeight: 300,
          }}
        >
          {/* Left: 70% text */}
          <Box sx={{ flex: 7, minHeight: 200 }}>
            {renderValuationList()}
          </Box>

          {/* Right: 30% image */}
          <Box
            sx={{
              flex: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Supporting Valuation Image
            </Typography>
            <Box
              sx={{
                mt: 1,
                border: "1px solid #ccc",
                borderRadius: 1,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
                height: 180,
              }}
            >
              <img
                src={imagePreviewUrl}
                alt="Valuation visual"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
        </Box>
      );
    }

    // No image → original single-column valuation text
    return renderValuationList();
  };

  const renderEditModeContent = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          minHeight: 300,
        }}
      >
        {/* Left: Valuation bullets (70%) */}
        <Box sx={{ flex: 7, minHeight: 200 }}>
          {editedValuation.map((item, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              gap={1}
              mb={1}
            >
              <TextField
                value={item}
                onChange={(e) => {
                  const updated = [...editedValuation];
                  updated[index] = e.target.value;
                  setEditedValuation(updated);
                }}
                fullWidth
                multiline
                size="small"
                InputProps={{ style: { backgroundColor: "#fff" } }}
              />
              <IconButton
                color="primary"
                onClick={() => handleAddValuationLine(index)}
                size="small"
              >
                <AddCircleOutlineIcon />
              </IconButton>
              {editedValuation.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => handleRemoveValuationLine(index)}
                  size="small"
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              )}
            </Box>
          ))}
          {editedValuation.length === 0 && (
            <Button
              variant="outlined"
              onClick={() => handleAddValuationLine(-1)}
            >
              Add First Point
            </Button>
          )}
        </Box>

        {/* Right: Image upload + resize (30%) */}
        <Box
          sx={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            Supporting Valuation Image
          </Typography>

          <Button
            variant="contained"
            component="label"
            size="small"
            sx={{ alignSelf: "flex-start" }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>

          {imagePreviewUrl && (
            <>
              <Box
                sx={{
                  mt: 1,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  height: 180,
                }}
              >
                <img
                  src={imagePreviewUrl}
                  alt="Valuation upload"
                  style={{
                    maxHeight: "100%",
                    width: `${imageScale}%`,
                    objectFit: "contain",
                  }}
                />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption">
                  Adjust image size
                </Typography>
                <Slider
                  size="small"
                  value={imageScale}
                  min={50}
                  max={150}
                  onChange={(_, value) =>
                    setImageScale(value as number)
                  }
                />
              </Box>
            </>
          )}

          {uploadError && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 0.5 }}
            >
              {uploadError}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          background: "linear-gradient(#f0f5ff, #f0f5ff)",
          width: "100%",
          mx: "auto",
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          position="relative"
          px={3}
          pt={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#002060" }}
          >
            Valuation Information
          </Typography>
          <Box position="absolute" right={24}>
            {editValuationMode ? (
              <>
                <IconButton color="primary" onClick={handleSaveValuation}>
                  <SaveIcon />
                </IconButton>
                <IconButton color="secondary" onClick={handleCancelValuation}>
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={handleOpenEditor}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Body */}
        <CardContent sx={{ px: 3, pb: 3 }}>
          {editValuationMode
            ? renderEditModeContent()
            : renderViewModeContent()}
        </CardContent>
      </Card>
    </Container>
  );
};

export default IPOValuationSection;
