import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Card,
  CardContent,
  Divider,
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
      }}
    >
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#026269",
              textAlign: "center",
              width: "100%",
            }}
          >
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
              {status === "success" && (
                <Tooltip title="Saved">
                  <CheckCircle fontSize="small" sx={{ color: "#1e7f34" }} />
                </Tooltip>
              )}
              {status === "error" && (
                <Tooltip title="Failed to save">
                  <ErrorOutline fontSize="small" color="error" />
                </Tooltip>
              )}
              <Tooltip title={isEditing ? "Save" : "Edit"}>
                <span>
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
            </Box>

            {isLoading && <LinearProgress sx={{ my: 1, borderRadius: 1 }} />}

            <Box mt={1} display="flex" flexDirection="column" gap={1}>
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
