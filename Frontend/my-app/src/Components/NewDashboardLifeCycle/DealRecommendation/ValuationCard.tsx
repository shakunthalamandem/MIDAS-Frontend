import React, { useEffect, useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { SectionCard } from "./SectionCard";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

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

export function ValuationCard({
  value,
  onSave,
  saving,
}: {
  value: string;
  onSave: (nextValue: string) => Promise<void>;
  saving?: boolean;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const handleDraftChange = (content: string) => {
    setDraft(content);
  };

  const handleSave = async () => {
    if (draft === value) {
      setIsEditing(false);
      return;
    }

    try {
      await onSave(draft);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save valuation summary", err);
    }
  };

  const handleCancel = () => {
    setDraft(value ?? "");
    setIsEditing(false);
  };

  return (
    <SectionCard title="Valuation (Editable)">
      <Stack
        spacing={2}
        sx={{
          mx: { xs: 0, md: 1 },
        }}
      >

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ width: "100%" }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1a2a66",
              letterSpacing: 0.5,
            }}
          >
            {/* Valuation Analysis */}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1}>
            {isEditing ? (
              <>
                <IconButton
                  size="small"
                  onClick={handleSave}
                  disabled={!!saving}
                  sx={{
                    backgroundColor: "#1ec15f",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#18a95c" },
                  }}
                  aria-label="Save valuation"
                >
                  <SaveIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCancel}
                  disabled={!!saving}
                  sx={{
                    backgroundColor: "#ff5a5f",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#e04b4b" },
                  }}
                  aria-label="Cancel valuation edit"
                >
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton
                size="small"
                color="primary"
                onClick={() => setIsEditing(true)}
                aria-label="Edit valuation"
                sx={{
                  border: "1px solid rgba(58, 83, 255, 0.4)",
                  backgroundColor: "#ffffff",
                }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {isEditing ? (
          <ReactQuill
            theme="snow"
            value={draft}
            onChange={handleDraftChange}
            modules={quillModules}
            formats={quillFormats}
          />
        ) : (
          <>
            {value?.trim() ? (
              <Box
                sx={{
                  minHeight: 140,
                  px: 2.5,
                  py: 2,
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                  border: "1px solid rgba(229, 235, 255, 0.9)",
                  boxShadow: "0 6px 16px rgba(32, 70, 150, 0.08)",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ color: "#243056", lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: "#7f8790",
                  fontStyle: "italic",
                  px: 0.5,
                }}
              >
                No valuation summary yet. Click edit to add your analysis.
              </Typography>
            )}
          </>
        )}
      </Stack>
    </SectionCard>
  );
}
