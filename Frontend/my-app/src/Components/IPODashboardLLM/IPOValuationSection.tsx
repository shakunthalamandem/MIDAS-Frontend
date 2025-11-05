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
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { SelectedData } from "./IPODealsS1DealData";
import ValuationImagePanel from "./ValuationImagePanel";

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

  // Image file to send on PATCH
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    setUploadError(null);
    setEditValuationMode(false);
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
        // Backend expects this field name
        formData.append("valuation_image", imageFile);
      }

      const response = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "PATCH",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          // No Content-Type: browser sets multipart boundary
        },
        body: formData,
      });

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || "Failed to save valuation");
      }

      // Sync bullets with selectedData (your previous pattern)
      selectedData.valuation = cleaned;

      // If backend returns a new ID, save it back
      if (resJson.valuation_image_url) {
        selectedData.valuation_image_url = resJson.valuation_image_url;
      }

      setEditValuationMode(false);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || "Unknown error occurred");
    }
  };

  // ----- View mode valuation list -----
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

  // ----- Edit mode valuation editor -----
  const renderEditValuation = () => (
    <>
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
    </>
  );

  // Show 2-column layout if:
  // - In edit mode (so user can upload an image), OR
  // - We have either an image ID from backend or a newly selected image file
  const showImageColumn =
    editValuationMode ||
    Boolean(selectedData.valuation_image_url) ||
    Boolean(imageFile);

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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              minHeight: 300,
            }}
          >
            {/* Left: valuation text (100% or 70%) */}
            <Box
              sx={{
                flex: showImageColumn ? 7 : 1,
                minHeight: 200,
              }}
            >
              {editValuationMode ? renderEditValuation() : renderValuationList()}

              {uploadError && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: "block" }}
                >
                  {uploadError}
                </Typography>
              )}
            </Box>

            {/* Right: image panel (30%) */}
            {showImageColumn && (
              <Box
                sx={{
                  flex: 3,
                  mt: { xs: 2, md: 0 },
                }}
              >
                <ValuationImagePanel
                  editMode={editValuationMode}
                  valuationImageId={selectedData.valuation_image_url ?? null}
                  apiUrl={apiUrl}
                  token={token}
                  imageFile={imageFile}
                  onImageFileChange={setImageFile}
                  setUploadError={setUploadError}
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default IPOValuationSection;
