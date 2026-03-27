import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { CreateAgentPayload } from "./types";
import { createAgent, runAgent } from "./agentService";

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const WEEKDAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

const CreateAgentDialog: React.FC<CreateAgentDialogProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [scheduleType, setScheduleType] =
    useState<CreateAgentPayload["schedule_type"]>("daily");
  const [time, setTime] = useState("09:00");
  const [weekday, setWeekday] = useState("1");
  const [hourInterval, setHourInterval] = useState("2");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const buildScheduleValue = (): string => {
    switch (scheduleType) {
      case "daily":
        return time;
      case "weekly":
        return `${weekday},${time}`;
      case "hourly":
        return hourInterval;
      case "one_time":
        return "";
      default:
        return "";
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrompt("");
    setScheduleType("daily");
    setTime("09:00");
    setWeekday("1");
    setHourInterval("2");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (runNow: boolean) => {
    if (!name.trim()) { setError("Agent name is required"); return; }
    if (!description.trim()) { setError("Description is required"); return; }
    if (!prompt.trim()) { setError("Prompt is required"); return; }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: CreateAgentPayload = {
        name: name.trim(),
        description: description.trim(),
        prompt: prompt.trim(),
        schedule_type: scheduleType,
        schedule_value: buildScheduleValue(),
      };

      const agent = await createAgent(payload);

      if (runNow) {
        await runAgent(agent.id);
        setSuccess(
          `Agent "${agent.name}" created and run triggered! You'll receive the output via email.`
        );
      } else {
        setSuccess(`Agent "${agent.name}" created successfully!`);
      }

      setTimeout(() => {
        resetForm();
        onCreated();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose();
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      bgcolor: "#eef2ff",
      "&:hover": { bgcolor: "#e0e7ff" },
      "&.Mui-focused": {
        bgcolor: "#fff",
        boxShadow: "0 0 0 3px rgba(79,70,229,0.08)",
      },
      "& fieldset": { borderColor: "#a5b4fc" },
      "&:hover fieldset": { borderColor: "#818cf8" },
      "&.Mui-focused fieldset": { borderColor: "#4f46e5" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#4f46e5" },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #c7d2fe",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #e8e8ef",
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            bgcolor: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SmartToyOutlinedIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "1.05rem" }}>
            Create New AI Agent
          </Typography>
          <Typography sx={{ color: "#4338ca", fontSize: "0.78rem" }}>
            Configure your autonomous financial agent
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error" sx={{ borderRadius: 2.5 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: 2.5 }}>{success}</Alert>}

          <TextField
            label="Agent Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            placeholder="e.g., Earnings Analysis Agent"
            sx={inputSx}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={2}
            placeholder="What does this agent do?"
            sx={inputSx}
          />

          <TextField
            label="Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="Enter the prompt/instructions for this agent..."
            sx={inputSx}
          />

          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Schedule Type</InputLabel>
            <Select
              value={scheduleType}
              label="Schedule Type"
              onChange={(e) =>
                setScheduleType(e.target.value as CreateAgentPayload["schedule_type"])
              }
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="one_time">One Time</MenuItem>
            </Select>
          </FormControl>

          {(scheduleType === "daily" || scheduleType === "weekly") && (
            <TextField
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
          )}

          {scheduleType === "weekly" && (
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={weekday}
                label="Day of Week"
                onChange={(e) => setWeekday(e.target.value)}
              >
                {WEEKDAYS.map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {scheduleType === "hourly" && (
            <TextField
              label="Run every N hours"
              type="number"
              value={hourInterval}
              onChange={(e) => setHourInterval(e.target.value)}
              inputProps={{ min: 1, max: 24 }}
              sx={inputSx}
            />
          )}

          <Box
            sx={{
              p: 2,
              bgcolor: "#eef2ff",
              borderRadius: 2.5,
              border: "1px solid #a5b4fc",
            }}
          >
            <Typography sx={{ fontSize: "0.78rem", color: "#312e81", lineHeight: 1.6 }}>
              Your agent will be always active and run according to the schedule
              above. Toggle "Email Alerts" on the agent card to receive results
              via email.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, borderTop: "1px solid #c7d2fe", pt: 2 }}>
        <Button
          onClick={handleClose}
          disabled={saving}
          sx={{ textTransform: "none", borderRadius: 2.5, color: "#1e293b", fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSubmit(false)}
          disabled={saving}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2.5,
            borderColor: "#4f46e5",
            color: "#4f46e5",
            px: 2.5,
            "&:hover": { borderColor: "#4338ca", bgcolor: "#eef2ff" },
          }}
        >
          {saving ? <CircularProgress size={18} /> : "Create"}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubmit(true)}
          disabled={saving}
          startIcon={
            saving ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : (
              <RocketLaunchIcon sx={{ fontSize: 16 }} />
            )
          }
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2.5,
            px: 2.5,
            bgcolor: "#4f46e5",
            boxShadow: "none",
            "&:hover": { bgcolor: "#4338ca", boxShadow: "0 4px 12px rgba(79,70,229,0.25)" },
          }}
        >
          Create & Run Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAgentDialog;
