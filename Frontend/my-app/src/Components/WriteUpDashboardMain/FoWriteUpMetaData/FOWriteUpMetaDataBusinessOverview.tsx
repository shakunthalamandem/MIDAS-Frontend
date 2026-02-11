import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { BusinessDetails } from "../types/FOWriteUpData";
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

interface FOWriteUpMetaDataBusinessOverviewProps {
  ticker: string;
  data?: BusinessDetails;
  onUpdate?: () => void;
}

const FOWriteUpMetaDataBusinessOverview: React.FC<FOWriteUpMetaDataBusinessOverviewProps> = ({
  ticker,
  data: initialData,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<BusinessDetails>(initialData ?? {});
  const [editHighlights, setEditHighlights] = useState(false);
  const [editStrengths, setEditStrengths] = useState(false);
  const [editConcerns, setEditConcerns] = useState(false);
  const [savingHighlights, setSavingHighlights] = useState(false);
  const [savingStrengths, setSavingStrengths] = useState(false);
  const [savingConcerns, setSavingConcerns] = useState(false);
  const [expandedStrengths, setExpandedStrengths] = useState(true);
  const [expandedConcerns, setExpandedConcerns] = useState(true);

  useEffect(() => {
    setFormData(initialData ?? {});
  }, [initialData]);

  const handleChange = (key: keyof BusinessDetails, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async (field: keyof BusinessDetails, setEditMode: (v: boolean) => void, setSaving: (v: boolean) => void) => {
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload: Record<string, any> = {
        ticker,
        [field]: formData[field],
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

  const cardStyle = {
    borderRadius: 3,
    background: "#f0f4ff",
    p: 3,
    position: "relative" as const,
  };

  const titleStyle = {
    fontWeight: 700,
    color: "#026269",
    fontSize: "18px",
    textAlign: "center" as const,
  };

  const accordionStyle = {
    borderRadius: "12px !important",
    background: "#f0f4ff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    "&:before": { display: "none" },
    "&.Mui-expanded": { margin: 0 },
  };

  const accordionSummaryStyle = {
    minHeight: "56px",
    "& .MuiAccordionSummary-content": {
      margin: "12px 0",
      alignItems: "center",
      justifyContent: "space-between",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Business Highlights - Full Width Card */}
      <Box sx={{ ...cardStyle, mb: 3 }}>
        <IconButton
          onClick={() => (editHighlights ? handleSave("business_highlights", setEditHighlights, setSavingHighlights) : setEditHighlights(true))}
          disabled={savingHighlights}
          size="small"
          sx={{ position: "absolute", top: 16, right: 16, color: "#1e3a5f" }}
        >
          {savingHighlights ? <CircularProgress size={18} /> : editHighlights ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
        </IconButton>

        <Typography sx={{ ...titleStyle, mb: 2 }}>Business Highlights</Typography>

        {editHighlights ? (
          <Box sx={{ background: "#ffffff", borderRadius: 1 }}>
            <ReactQuill
              theme="snow"
              value={formData.business_highlights ?? ""}
              onChange={(value) => handleChange("business_highlights", value)}
              modules={quillModules}
              formats={quillFormats}
            />
          </Box>
        ) : (
          <Box
            sx={{
              background: "#fff",
              borderRadius: 2,
              p: 2,
              minHeight: "100px",
              border: "1px solid #e0e7ff",
            }}
          >
            <Box
              sx={{
                color: "#000000ff",
                fontSize: "14px",
                lineHeight: 1.6,
                "& ul, & ol": { marginLeft: 2, marginTop: 0.5, marginBottom: 0.5 },
                "& p": { margin: 0, marginBottom: 0.5 },
              }}
              dangerouslySetInnerHTML={{
                __html: formData.business_highlights || "N/A",
              }}
            />
          </Box>
        )}
      </Box>

      {/* Strengths and Concerns - Side by Side Expandable Cards */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3} alignItems="stretch">
        {/* Strengths Accordion */}
        <Box sx={{ flex: 1, minWidth: "300px", display: "flex" }}>
          <Accordion
            expanded={expandedStrengths}
            onChange={() => setExpandedStrengths(!expandedStrengths)}
            sx={{ ...accordionStyle, width: "100%", display: "flex", flexDirection: "column" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#1e3a5f" }} />}
              sx={accordionSummaryStyle}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1}>
                <Typography sx={{ fontWeight: 700, color: "#026269", fontSize: "16px", textAlign: "center" }}>
                  Strengths
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editStrengths) {
                      handleSave("strengths", setEditStrengths, setSavingStrengths);
                    } else {
                      setEditStrengths(true);
                    }
                  }}
                  disabled={savingStrengths}
                  size="small"
                  sx={{ color: "#1e3a5f" }}
                >
                  {savingStrengths ? <CircularProgress size={16} /> : editStrengths ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, flex: 1, display: "flex", flexDirection: "column" }}>
              {editStrengths ? (
                <Box sx={{ background: "#ffffff", borderRadius: 1, flex: 1 }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.strengths ?? ""}
                    onChange={(value) => handleChange("strengths", value)}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    background: "#fff",
                    borderRadius: 2,
                    p: 2,
                    border: "1px solid #e0e7ff",
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      color: "#000000ff",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      "& ul, & ol": { marginLeft: 2, marginTop: 0.5, marginBottom: 0.5 },
                      "& p": { margin: 0, marginBottom: 0.5 },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formData.strengths || "N/A",
                    }}
                  />
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Concerns (Weaknesses) Accordion */}
        <Box sx={{ flex: 1, minWidth: "300px", display: "flex" }}>
          <Accordion
            expanded={expandedConcerns}
            onChange={() => setExpandedConcerns(!expandedConcerns)}
            sx={{ ...accordionStyle, width: "100%", display: "flex", flexDirection: "column" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#1e3a5f" }} />}
              sx={accordionSummaryStyle}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1}>
                <Typography sx={{ fontWeight: 700, color: "#026269", fontSize: "16px", textAlign: "center" }}>
                  Concerns
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editConcerns) {
                      handleSave("weakness", setEditConcerns, setSavingConcerns);
                    } else {
                      setEditConcerns(true);
                    }
                  }}
                  disabled={savingConcerns}
                  size="small"
                  sx={{ color: "#1e3a5f" }}
                >
                  {savingConcerns ? <CircularProgress size={16} /> : editConcerns ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, flex: 1, display: "flex", flexDirection: "column" }}>
              {editConcerns ? (
                <Box sx={{ background: "#ffffff", borderRadius: 1, flex: 1 }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.weakness ?? ""}
                    onChange={(value) => handleChange("weakness", value)}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    background: "#fff",
                    borderRadius: 2,
                    p: 2,
                    border: "1px solid #e0e7ff",
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      color: "#000000ff",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      "& ul, & ol": { marginLeft: 2, marginTop: 0.5, marginBottom: 0.5 },
                      "& p": { margin: 0, marginBottom: 0.5 },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formData.weakness || "N/A",
                    }}
                  />
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </motion.div>
  );
};

export default FOWriteUpMetaDataBusinessOverview;
