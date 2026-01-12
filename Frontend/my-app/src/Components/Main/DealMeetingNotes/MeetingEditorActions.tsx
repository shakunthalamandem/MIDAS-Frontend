import React from "react";
import { Button, Paper, Stack } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

type MeetingEditorActionsProps = {
  isEditing: boolean;
  submitting: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  container?: boolean;
};

const MeetingEditorActions: React.FC<MeetingEditorActionsProps> = ({
  isEditing,
  submitting,
  onEdit,
  onSave,
  onCancel,
  onReset,
  container = true,
}) => {
  const content = (
    <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
      {!isEditing ? (
        <Button
          variant="contained"
          startIcon={<EditOutlinedIcon />}
          onClick={onEdit}
          sx={{
            background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
            color: "#fff",
            borderRadius: 999,
            px: 2.5,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
            },
          }}
        >
          Edit
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={onSave}
            disabled={submitting}
            sx={{
              background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
              color: "#fff",
              borderRadius: 999,
              px: 2.5,
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.16)",
              },
            }}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloseOutlinedIcon />}
            onClick={onCancel}
            disabled={submitting}
            sx={{
              borderColor: "#0050c8",
              color: "#0050c8",
              borderRadius: 999,
              px: 2.5,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReplayOutlinedIcon />}
            onClick={onReset}
            disabled={submitting}
            sx={{
              borderColor: "#f28c28",
              color: "#f28c28",
              borderRadius: 999,
              px: 2.5,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
              },
            }}
          >
            Reset
          </Button>
        </>
      )}
    </Stack>
  );

  if (!container) return content;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 999,
        border: "1px solid #d8deef",
        backgroundColor: "rgba(0,32,96,0.04)",
      }}
    >
      {content}
    </Paper>
  );
};

export default MeetingEditorActions;
