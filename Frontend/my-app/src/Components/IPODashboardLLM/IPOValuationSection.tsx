// src/components/IPODashboardMain/IPOValuationSection.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { SelectedData } from "./IPODealsS1DealData";
import ValuationImagePanel from "./ValuationImagePanel";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const initialValuationImageId =
    selectedData.valuation_image_url ??
    selectedData.valuation_image ??
    selectedData.valuation_image_id ??
    null;
  const [valuationImageId, setValuationImageId] = useState<string | null>(
    initialValuationImageId
  );
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  useEffect(() => {
    setValuationImageId(
      selectedData?.valuation_image_url ??
        selectedData?.valuation_image ??
        selectedData?.valuation_image_id ??
        null
    );
  }, [
    selectedData?.valuation_image_url,
    selectedData?.valuation_image,
    selectedData?.valuation_image_id,
  ]);

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
    if (saving) return; // don't allow cancel mid-save
    setEditedValuation(Array.isArray(valuation) ? valuation : []);
    setImageFile(null);
    setUploadError(null);
    setEditValuationMode(false);
  };

  const handleSaveValuation = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined");
      if (!selectedData.ticker_name) throw new Error("Ticker name is missing");

      setSaving(true);
      setUploadError(null);

      const cleaned = (editedValuation || []).filter(
        (item) => item.trim() !== ""
      );
      const formatted = cleaned.map((item) => `• ${item}`).join("\n");

      const formData = new FormData();
      formData.append("ticker_name", selectedData.ticker_name);
      formData.append("valuation", formatted);

      if (imageFile) {
        formData.append("valuation_image", imageFile);
      }

      const response = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "PATCH",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          // don't set Content-Type manually for FormData
        },
        body: formData,
      });

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || resJson.error || "Failed to save valuation");
      }

      // Sync bullets with selectedData
      selectedData.valuation = cleaned;

      // If backend returns a new image ID, save it back
      const newImageId =
        resJson.valuation_image_url ??
        resJson.valuation_image ??
        resJson.valuation_image_id ??
        null;

      if (newImageId) {
        selectedData.valuation_image_url = newImageId;
      }
      setValuationImageId((prev) => newImageId ?? prev ?? null);

      setEditValuationMode(false);
      setUploadError(null);
      if (newImageId) {
        setImageFile(null);
      }
    } catch (err: any) {
      setUploadError(err.message || "Unknown error occurred");
    } finally {
      setSaving(false);
    }
  };

  const renderValuationList = () => {
    return Array.isArray(valuation) && valuation.length > 0 ? (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
        {valuation.map((item: string, index: number) => (
          <Box
            key={index}
            sx={{
              color: "#1f2a44",
              lineHeight: 1.6,
              borderRadius: 1,
              p: 0.5,
              "& ul": { margin: 0, pl: 3 },
            }}
            dangerouslySetInnerHTML={{ __html: item }}
          />
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

  const renderEditValuation = () => (
    <>
      {editedValuation.map((item, index) => (
        <Box key={index} display="flex" alignItems="flex-start" gap={1} mb={1}>
          <Box sx={{ flex: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}>
            <ReactQuill
              theme="snow"
              value={item}
              onChange={(value) => {
                const updated = [...editedValuation];
                updated[index] = value;
                setEditedValuation(updated);
              }}
              modules={quillModules}
              formats={quillFormats}
            />
          </Box>
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
        <Button variant="outlined" onClick={() => handleAddValuationLine(-1)}>
          Add First Point
        </Button>
      )}
    </>
  );

  const showImageColumn =
    editValuationMode ||
    Boolean(valuationImageId) ||
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
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#002060" }}>
            Valuation Information
          </Typography>

          <Box position="absolute" right={24} display="flex" gap={1}>
            {editValuationMode ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleSaveValuation}
                  disabled={saving}
                  startIcon={
                    saving ? (
                      <CircularProgress size={16} />
                    ) : (
                      <SaveIcon fontSize="small" />
                    )
                  }
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
                <IconButton
                  color="secondary"
                  onClick={handleCancelValuation}
                  disabled={saving}
                >
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

        {/* Subtle helper text when saving */}
        {saving && (
          <Box
            px={3}
            pt={1}
            display="flex"
            alignItems="center"
            gap={1}
            justifyContent="flex-end"
          >
            <Typography variant="caption" sx={{ color: "#555" }}>
              Uploading image & saving valuation… Please wait.
            </Typography>
          </Box>
        )}

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
            {/* Left side */}
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

            {/* Right side: image panel */}
            {showImageColumn && (
              <Box
                sx={{
                  flex: 3,
                  mt: { xs: 2, md: 0 },
                }}
              >
                <ValuationImagePanel
                  editMode={editValuationMode}
                  valuationImageId={valuationImageId}
                  apiUrl={apiUrl}
                  token={token}
                  imageFile={imageFile}
                  onImageFileChange={setImageFile}
                  setUploadError={setUploadError}
                  tickerName={selectedData.ticker_name}
                  deleteApiPath="/api/delete_valuation_image/"
                  onImageDeleted={() => {
                    selectedData.valuation_image_url = undefined;
                    setValuationImageId(null);
                  }}
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
