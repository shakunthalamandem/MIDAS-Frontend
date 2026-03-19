import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  const [scheduleType, setScheduleType] = useState<CreateAgentPayload["schedule_type"]>("daily");
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
    if (!name.trim()) {
      setError("Agent name is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (!prompt.trim()) {
      setError("Prompt is required");
      return;
    }

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
        setSuccess(`Agent "${agent.name}" created and run triggered! You'll receive the output via email.`);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#481f93" }}>
        Create New AI Agent
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Agent Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            placeholder="e.g., Earnings Analysis Agent"
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
          />

          <FormControl fullWidth>
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

          {/* Dynamic schedule inputs */}
          {(scheduleType === "daily" || scheduleType === "weekly") && (
            <TextField
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}

          {scheduleType === "weekly" && (
            <FormControl fullWidth>
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
            />
          )}

          <Box
            sx={{
              p: 2,
              bgcolor: "#f8f7ff",
              borderRadius: 2,
              border: "1px solid #e0dff7",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Your agent will be always active and run according to the schedule above.
              Toggle "Email Me" on the agent card to receive results via email.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSubmit(false)}
          disabled={saving}
        >
          {saving ? <CircularProgress size={20} /> : "Create"}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubmit(true)}
          disabled={saving}
        >
          {saving ? <CircularProgress size={20} /> : "Create & Run Now"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAgentDialog;
