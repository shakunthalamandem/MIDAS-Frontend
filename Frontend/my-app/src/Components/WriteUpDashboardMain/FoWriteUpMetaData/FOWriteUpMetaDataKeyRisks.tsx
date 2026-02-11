import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

interface FOWriteUpMetaDataKeyRisksProps {
  ticker: string;
  data?: string;
  onUpdate?: () => void;
}

const FOWriteUpMetaDataKeyRisks: React.FC<FOWriteUpMetaDataKeyRisksProps> = ({
  ticker,
  data: initialData,
  onUpdate,
}) => {
  const [keyRisks, setKeyRisks] = useState<string>(initialData ?? "");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setKeyRisks(initialData ?? "");
  }, [initialData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload: Record<string, any> = {
        ticker,
        key_risks: keyRisks,
      };

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setEditMode(false);
        onUpdate?.();
      } else {
        console.error("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        borderRadius: 16,
        background: "linear-gradient(#f0f5ff)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        padding: "20px",
        position: "relative",
      }}
    >
      <IconButton
        onClick={() => (editMode ? handleSave() : setEditMode(true))}
        disabled={saving}
        sx={{ position: "absolute", top: 12, right: 12, color: "#002060" }}
      >
        {saving ? <CircularProgress size={20} /> : editMode ? <SaveIcon /> : <EditIcon />}
      </IconButton>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#026269", mb: 3, textAlign: "center" }}>
        Key Risks
      </Typography>

      <Box>
        {editMode ? (
          <Box sx={{ background: "#ffffff", borderRadius: 1 }}>
            <ReactQuill
              theme="snow"
              value={keyRisks}
              onChange={setKeyRisks}
              modules={quillModules}
              formats={quillFormats}
            />
          </Box>
        ) : (
          <Box
            sx={{
              color: "#333333",
              fontSize: "14px",
              lineHeight: 1.6,
              "& ul, & ol": { marginLeft: 2, marginTop: 0.5, marginBottom: 0.5 },
              "& p": { margin: 0, marginBottom: 0.5 },
            }}
            dangerouslySetInnerHTML={{ __html: keyRisks || "N/A" }}
          />
        )}
      </Box>
    </motion.div>
  );
};

export default FOWriteUpMetaDataKeyRisks;
