import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import SectionEditor from "./SectionEditor";

interface SectionCardProps {
  title: string;
  values: string[];
  isEditing: boolean;
  isLoading: boolean;
  status: "idle" | "success" | "error";
  onEdit: () => void;
  onSave: () => void;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  values,
  isEditing,
  isLoading,
  status,
  onEdit,
  onSave,
  onChange,
  onAdd,
  onRemove,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
        background: "linear-gradient(#f0f5ff, #f0f5ff)",
      }}
    >
      <Accordion
        disableGutters
        sx={{ background: "linear-gradient(#f0f5ff, #f0f5ff)" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            alignItems: "center",
            background: "linear-gradient(#f0f5ff, #f0f5ff)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#026269",
              flexGrow: 1,
              textAlign: "center",
              userSelect: "none",
            }}
            onClick={(e) => e.stopPropagation()} // ✅ prevent toggle on title click
          >
            {title}
          </Typography>

          {/* Status Icons */}
          {status === "success" && (
            <Tooltip title="Saved">
              <CheckCircle
                fontSize="small"
                sx={{ color: "#1e7f34", mr: 1 }}
                onClick={(e) => e.stopPropagation()} // ✅ prevent toggle
              />
            </Tooltip>
          )}
          {status === "error" && (
            <Tooltip title="Failed to save">
              <ErrorOutline
                fontSize="small"
                color="error"
                sx={{ mr: 1 }}
                onClick={(e) => e.stopPropagation()} // ✅ prevent toggle
              />
            </Tooltip>
          )}

          {/* Edit / Save Button */}
          <Tooltip title={isEditing ? "Save" : "Edit"}>
            <span
              onClick={(e) => e.stopPropagation()} // ✅ prevent toggle
            >
              <IconButton
                onClick={isEditing ? onSave : onEdit}
                disabled={isLoading}
                sx={{ color: "#002060" }}
                size="small"
              >
                {isEditing ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </AccordionSummary>

        <AccordionDetails>
          <CardContent sx={{ background: "linear-gradient(#f0f5ff, #f0f5ff)" }}>
            {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            <Box
              mt={1}
              display="flex"
              flexDirection="column"
              gap={1}
              sx={{ background: "linear-gradient(#f0f5ff, #f0f5ff)" }}
            >
              {values.map((sentence, idx) => (
                <SectionEditor
                  key={idx}
                  sentence={sentence}
                  index={idx}
                  isEditing={isEditing}
                  onChange={onChange}
                  onAdd={onAdd}
                  onRemove={onRemove}
                />
              ))}
            </Box>
          </CardContent>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default SectionCard;
