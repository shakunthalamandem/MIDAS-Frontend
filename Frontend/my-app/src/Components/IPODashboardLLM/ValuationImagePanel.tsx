// src/components/IPODashboardMain/ValuationImagePanel.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Slider,
  Typography,
} from "@mui/material";

type Props = {
  editMode: boolean;
  valuationImageId: string | null;   // backend sends this ID
  apiUrl?: string;
  token: string | null;
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  setUploadError: (msg: string | null) => void;
};

const ValuationImagePanel: React.FC<Props> = ({
  editMode,
  valuationImageId,
  apiUrl,
  token,
  imageFile,
  onImageFileChange,
  setUploadError,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);

  // ---- When user selects a local file, build a preview ----
  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setUploadError(null);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, setUploadError]);

  // ---- Fetch remote image from backend (DriveImageAPIView) ----
  useEffect(() => {
    // If there's no API URL or no image ID, do nothing
    if (!apiUrl || !valuationImageId) return;
    // If the user already picked a local file, prefer that and don't fetch
    if (imageFile) return;

    let cancelled = false;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setUploadError(null);

        const response = await fetch(`${apiUrl}/api/image_download/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ image_url: valuationImageId }),
        });

        if (!response.ok) {
          throw new Error("Failed to load valuation image");
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setPreviewUrl(objectUrl);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Image fetch error:", err);
          setPreviewUrl(null);
          setUploadError("Unable to load valuation image.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, token, valuationImageId, imageFile, setUploadError]);

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file.");
      return;
    }

    setImageScale(100);
    onImageFileChange(file);
  };

  const hasPreview = Boolean(previewUrl);

  // In pure view mode with no preview, don't render anything
  if (!editMode && !hasPreview) {
    return null;
  }

  return (
    <Box
      sx={{
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

      {editMode && (
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
            onChange={handleImageInputChange}
          />
        </Button>
      )}

      {loading && (
        <Typography variant="caption" sx={{ mt: 1 }}>
          Loading image…
        </Typography>
      )}

      {hasPreview && (
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
              src={previewUrl!}
              alt="Valuation"
              style={{
                maxHeight: "100%",
                width: editMode ? `${imageScale}%` : "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          {editMode && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption">
                Adjust image size
              </Typography>
              <Slider
                size="small"
                value={imageScale}
                min={50}
                max={150}
                onChange={(_, value) => setImageScale(value as number)}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ValuationImagePanel;
