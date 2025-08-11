import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
  IconButton,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface EditableCardProps {
  section: { key: string; title: string };
  index: number;
  cardColors: string[];
  ipoData: any;
  editMode: Record<string, boolean>;
  editedContent: Record<string, string[]>;
  expandedPanels: Record<string, boolean>;
  setExpandedPanels: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setEditMode: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleSaveCard: (key: string) => void;
  handleCancelCard: (key: string) => void;
  handleAddItem: (key: string) => void;
  handleDeleteItem: (key: string, index: number) => void;
  handleItemChange: (key: string, index: number, value: string) => void;
}

const EditableCard: React.FC<EditableCardProps> = ({
  section,
  index,
  cardColors,
  ipoData,
  editMode,
  editedContent,
  expandedPanels,
  setExpandedPanels,
  setEditMode,
  handleSaveCard,
  handleCancelCard,
  handleAddItem,
  handleDeleteItem,
  handleItemChange,
}) => {
  const key = section.key;
  const content = ipoData[key];
  const isEditing = editMode[key];
  const isExpanded = expandedPanels[key] || false;

  return (
    <Grid item xs={12} key={key}>
      <Accordion
        expanded={isExpanded}
        onChange={() =>
          setExpandedPanels((prev) => ({ ...prev, [key]: !prev[key] }))
        }
        sx={{
          backgroundColor: cardColors[index % cardColors.length],
          borderRadius: 2,
          boxShadow: 3,
          "&::before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${key}-header`}>
          <Typography
            variant="h6"
            align="center"
            sx={{ color: "#002060", fontWeight: "bold", flex: 1 }}
          >
            {section.title}
          </Typography>
          {isEditing ? (
            <>
              <IconButton
                color="primary"
                onClick={() => handleSaveCard(key)}
                size="small"
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                color="secondary"
                onClick={() => handleCancelCard(key)}
                size="small"
              >
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton
              onClick={() =>
                setEditMode((prev) => ({ ...prev, [key]: true }))
              }
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </AccordionSummary>

        <AccordionDetails>
          {isEditing ? (
            <Box>
              {editedContent[key]?.map((item, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Box sx={{ mr: 1, mt: 1 }}>
                    <FiberManualRecordIcon
                      sx={{ fontSize: 8, color: "#002060" }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    size="small"
                    value={item}
                    onChange={(e) =>
                      handleItemChange(key, idx, e.target.value)
                    }
                    placeholder="Enter text..."
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteItem(key, idx)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => handleAddItem(key)}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Add Item
              </Button>
            </Box>
          ) : (
            <List dense>
              {content?.map((item: string, idx: number) => (
                <ListItem key={idx} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24, mt: "5px" }}>
                    <FiberManualRecordIcon
                      sx={{ fontSize: 8, color: "#002060" }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default EditableCard;
