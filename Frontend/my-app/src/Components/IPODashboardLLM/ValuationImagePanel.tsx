// src/components/IPODashboardMain/ValuationImagePanel.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Slider,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  editMode: boolean;
  valuationImageId: string | null; // backend sends this ID
  apiUrl?: string;
  token: string | null;
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  setUploadError: (msg: string | null) => void;
  title?: string;
  altText?: string;
  tickerName?: string;
  deleteApiPath?: string;
  onImageDeleted?: () => void;
};

const ValuationImagePanel: React.FC<Props> = ({
  editMode,
  valuationImageId,
  apiUrl,
  token,
  imageFile,
  onImageFileChange,
  setUploadError,
  title = "Supporting Valuation Image",
  altText = "Valuation visual",
  tickerName,
  deleteApiPath,
  onImageDeleted,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState(false);

  // Local file preview
  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setUploadError(null);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, setUploadError]);

  // Remote image fetch
  useEffect(() => {
    if (!apiUrl || !valuationImageId) return;
    if (imageFile) return; // prefer local file if user picked one

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
  const canDeleteRemoteImage = Boolean(
    deleteApiPath && tickerName && valuationImageId
  );

  const handleDeleteImage = async () => {
    if (!apiUrl || !deleteApiPath || !tickerName) {
      setUploadError("Unable to delete image. Missing configuration.");
      return;
    }

    const normalizedDeletePath = deleteApiPath.startsWith("/")
      ? deleteApiPath
      : `/${deleteApiPath}`;

    try {
      setDeleting(true);
      setUploadError(null);

      const response = await fetch(`${apiUrl}${normalizedDeletePath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ticker_name: tickerName }),
      });

      let responseJson: any = null;
      try {
        responseJson = await response.json();
      } catch {
        responseJson = null;
      }

      if (!response.ok) {
        const message =
          responseJson?.message ||
          responseJson?.error ||
          "Failed to delete image.";
        throw new Error(message);
      }

      if (!imageFile) {
        setPreviewUrl(null);
      }
      onImageDeleted?.();
      if (!imageFile) {
        onImageFileChange(null);
      }
    } catch (err: any) {
      setUploadError(err?.message || "Failed to delete image.");
    } finally {
      setDeleting(false);
    }
  };

  // In pure view mode with no preview, render nothing
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
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>

      {editMode && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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

          {canDeleteRemoteImage && (
            <Tooltip title="Delete stored image">
              <span>
                <IconButton
                  color="error"
                  size="small"
                  onClick={handleDeleteImage}
                  disabled={deleting}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      )}

      {loading && (
        <Typography variant="caption" sx={{ mt: 1 }}>
          Loading image...
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
              alt={altText}
              style={{
                maxHeight: "100%",
                width: editMode ? `${imageScale}%` : "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          {editMode && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption">Adjust image size</Typography>
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
