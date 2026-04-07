import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { AIAgent, CreateAgentPayload } from "./types";
import { updateAgent, runAgent } from "./agentService";

interface EditAgentDialogProps {
  open: boolean;
  agent: AIAgent | null;
  onClose: () => void;
  onUpdated: () => void;
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

const EditAgentDialog: React.FC<EditAgentDialogProps> = ({
  open,
  agent,
  onClose,
  onUpdated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [scheduleType, setScheduleType] =
    useState<CreateAgentPayload["schedule_type"]>("daily");
  const [time, setTime] = useState("09:00");
  const [weekday, setWeekday] = useState("1");
  const [hourInterval, setHourInterval] = useState("2");
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate form when agent changes
  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description);
      setPrompt(agent.prompt || "");
      setScheduleType(agent.schedule_type);
      setUseWebSearch(agent.use_web_search ?? false);
      setError(null);
      setSuccess(null);

      // Parse schedule_value based on type
      if (agent.schedule_type === "daily") {
        setTime(agent.schedule_value || "09:00");
      } else if (agent.schedule_type === "weekly") {
        const parts = agent.schedule_value.split(",");
        setWeekday(parts[0] || "1");
        setTime(parts[1] || "09:00");
      } else if (agent.schedule_type === "hourly") {
        setHourInterval(agent.schedule_value || "2");
      }
    }
  }, [agent]);

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

  const handleSubmit = async (runNow: boolean) => {
    if (!agent) return;
    if (!name.trim()) { setError("Agent name is required"); return; }
    if (!description.trim()) { setError("Description is required"); return; }
    if (!prompt.trim()) { setError("Prompt is required"); return; }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: Partial<CreateAgentPayload> & { use_web_search?: boolean } = {
        name: name.trim(),
        description: description.trim(),
        prompt: prompt.trim(),
        schedule_type: scheduleType,
        schedule_value: buildScheduleValue(),
        use_web_search: useWebSearch,
      };

      await updateAgent(agent.id, payload);

      if (runNow) {
        await runAgent(agent.id);
        setSuccess(`Agent "${name}" updated and run triggered!`);
      } else {
        setSuccess(`Agent "${name}" updated successfully!`);
      }

      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update agent");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setError(null);
    setSuccess(null);
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

  if (!agent) return null;

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
          <EditOutlinedIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "1.05rem" }}>
            Edit Agent
          </Typography>
          <Typography sx={{ color: "#4338ca", fontSize: "0.78rem" }}>
            Modify your AI agent configuration
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

          {/* Web Search Toggle */}
          <Box
            sx={{
              p: 2,
              bgcolor: useWebSearch ? "#ecfdf5" : "#f8fafc",
              borderRadius: 2.5,
              border: `1px solid ${useWebSearch ? "#a7f3d0" : "#e2e8f0"}`,
              transition: "all 0.2s ease",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={useWebSearch}
                  onChange={(e) => setUseWebSearch(e.target.checked)}
                  sx={{
                    color: "#4f46e5",
                    "&.Mui-checked": { color: "#059669" },
                  }}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TravelExploreIcon sx={{ fontSize: 18, color: useWebSearch ? "#059669" : "#64748b" }} />
                  <Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>
                      Enable Web Search
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Allow the agent to search the web for real-time data, latest news, and market updates
                    </Typography>
                  </Box>
                </Stack>
              }
            />
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
          {saving ? <CircularProgress size={18} /> : "Save Changes"}
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
          Save & Run Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAgentDialog;
