import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import ChecklistIcon from "@mui/icons-material/Checklist";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

const sectionCardSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0 12px 30px rgba(0,0,0,0.04)",
  backgroundColor: "#fff",
};

const confidenceMarks = [
  { value: 0, label: "Low" },
  { value: 50, label: "Medium" },
  { value: 100, label: "High" },
];

const sectors = ["Financials", "Technology", "Healthcare", "Industrial", "Energy", "Consumer", "Utilities"];
const meetingTypes = ["Analyst Call", "Earnings Call", "Management Meeting", "Conference", "Other"];
const timeZones = ["EST", "CST", "MST", "PST", "GMT", "CET", "IST"];
const sentiments = ["Strongly positive", "Positive", "Neutral", "Negative", "Strongly negative"];
const managementTones = ["Confident", "Measured", "Uncertain", "Defensive", "Optimistic"];

const MeetingDealNoteCreate: React.FC = () => {
  const [metadata, setMetadata] = useState({
    companyName: "",
    ticker: "",
    sector: "",
    meetingType: "",
    meetingDate: "",
    meetingTime: "",
    timeZone: "",
    participantInput: "",
    participants: [] as string[],
  });

  const [summary, setSummary] = useState({
    meetingSummary: "",
    overallTakeaway: "bullish",
    confidence: 50,
  });

  const [insights, setInsights] = useState({
    newVsKnown: "",
    managementTone: "",
    managementComments: "",
    strategicUpdateInput: "",
    strategicUpdates: [] as string[],
    financialComments: "",
  });

  const [impact, setImpact] = useState({
    thesisImpact: "positive",
    upsideInput: "",
    upsideDrivers: [] as string[],
    riskInput: "",
    risks: [] as string[],
    netSentiment: "",
  });

  const [action, setAction] = useState({
    recommendation: "increase",
    positionChange: "",
    followUp: false,
  });

  const [notesState, setNotesState] = useState({
    additionalNotes: "",
  });

  const handleAddItem = (
    value: string,
    list: string[],
    setter: (items: string[]) => void,
    reset: () => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setter([...list, trimmed]);
    reset();
  };

  const renderChips = (
    items: string[],
    onRemove: (index: number) => void
  ) => (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Nothing added yet.
        </Typography>
      )}
      {items.map((item, idx) => (
        <Chip key={`${item}-${idx}`} label={item} variant="outlined" onDelete={() => onRemove(idx)} />
      ))}
    </Stack>
  );

  return (
    <Stack spacing={3}>
      <Paper sx={sectionCardSx}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" gap={1}>
            <ChecklistIcon color="primary" fontSize="small" />
            <Typography variant="h6" fontWeight={700} color="primary">
              Meeting Metadata
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Company Name"
                fullWidth
                value={metadata.companyName}
                onChange={(e) => setMetadata((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                label="Ticker"
                fullWidth
                value={metadata.ticker}
                onChange={(e) => setMetadata((prev) => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sector</InputLabel>
                <Select
                  label="Sector"
                  value={metadata.sector}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, sector: e.target.value }))}
                >
                  {sectors.map((sector) => (
                    <MenuItem key={sector} value={sector}>
                      {sector}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Meeting Type</InputLabel>
                <Select
                  label="Meeting Type"
                  value={metadata.meetingType}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, meetingType: e.target.value }))}
                >
                  {meetingTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Meeting Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={metadata.meetingDate}
                onChange={(e) => setMetadata((prev) => ({ ...prev, meetingDate: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Meeting Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={metadata.meetingTime}
                onChange={(e) => setMetadata((prev) => ({ ...prev, meetingTime: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Time Zone</InputLabel>
                <Select
                  label="Time Zone"
                  value={metadata.timeZone}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, timeZone: e.target.value }))}
                >
                  {timeZones.map((zone) => (
                    <MenuItem key={zone} value={zone}>
                      {zone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction="row" gap={1}>
                <TextField
                  label="Add participant name"
                  fullWidth
                  value={metadata.participantInput}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, participantInput: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddItem(
                        metadata.participantInput,
                        metadata.participants,
                        (items) => setMetadata((prev) => ({ ...prev, participants: items })),
                        () => setMetadata((prev) => ({ ...prev, participantInput: "" }))
                      );
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  sx={{ border: "1px solid", borderColor: "primary.main" }}
                  onClick={() =>
                    handleAddItem(
                      metadata.participantInput,
                      metadata.participants,
                      (items) => setMetadata((prev) => ({ ...prev, participants: items })),
                      () => setMetadata((prev) => ({ ...prev, participantInput: "" }))
                    )
                  }
                >
                  <AddIcon />
                </IconButton>
              </Stack>
              {renderChips(metadata.participants, (index) =>
                setMetadata((prev) => ({
                  ...prev,
                  participants: prev.participants.filter((_, idx) => idx !== index),
                }))
              )}
            </Grid>
          </Grid>

          <Stack direction="row" alignItems="center" gap={1} color="success.main">
            <Box sx={{ width: 8, height: 8, bgcolor: "success.main", borderRadius: "50%" }} />
            <Typography fontSize={14}>All sections unlocked</Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={sectionCardSx}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700} color="primary">
            Executive Summary
          </Typography>
          <TextField
            label="Meeting Summary"
            placeholder="Summarize the key points discussed in the meeting..."
            multiline
            minRows={4}
            value={summary.meetingSummary}
            onChange={(e) => setSummary((prev) => ({ ...prev, meetingSummary: e.target.value }))}
          />

          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              Overall Takeaway
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={summary.overallTakeaway}
              onChange={(_, value) => value && setSummary((prev) => ({ ...prev, overallTakeaway: value }))}
              color="primary"
            >
              <ToggleButton value="bullish" sx={{ minWidth: 120 }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Bullish
              </ToggleButton>
              <ToggleButton value="neutral" sx={{ minWidth: 120 }}>
                <TrendingFlatIcon fontSize="small" sx={{ mr: 0.5 }} /> Neutral
              </ToggleButton>
              <ToggleButton value="bearish" sx={{ minWidth: 120 }}>
                <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> Bearish
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              Confidence Level
            </Typography>
            <Slider
              value={summary.confidence}
              onChange={(_, value) => setSummary((prev) => ({ ...prev, confidence: value as number }))}
              marks={confidenceMarks}
              step={5}
              valueLabelDisplay="auto"
              color="primary"
              min={0}
              max={100}
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={sectionCardSx}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700} color="primary">
            Key Insights & Discussion Points
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
            <Typography fontWeight={700} mb={1}>
              What was new vs. known?
            </Typography>
            <TextField
              placeholder="Highlight new information revealed vs. what was already known..."
              multiline
              minRows={3}
              fullWidth
              value={insights.newVsKnown}
              onChange={(e) => setInsights((prev) => ({ ...prev, newVsKnown: e.target.value }))}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
            <Stack spacing={1.5}>
              <Typography fontWeight={700}>Management Tone & Credibility</Typography>
              <FormControl fullWidth>
                <InputLabel>Tone Assessment</InputLabel>
                <Select
                  label="Tone Assessment"
                  value={insights.managementTone}
                  onChange={(e) => setInsights((prev) => ({ ...prev, managementTone: e.target.value }))}
                >
                  {managementTones.map((tone) => (
                    <MenuItem key={tone} value={tone}>
                      {tone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Comments"
                placeholder="Additional observations on management's tone and credibility..."
                multiline
                minRows={3}
                fullWidth
                value={insights.managementComments}
                onChange={(e) => setInsights((prev) => ({ ...prev, managementComments: e.target.value }))}
              />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography fontWeight={700}>Strategic Updates Discussed</Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleAddItem(
                      insights.strategicUpdateInput,
                      insights.strategicUpdates,
                      (items) => setInsights((prev) => ({ ...prev, strategicUpdates: items })),
                      () => setInsights((prev) => ({ ...prev, strategicUpdateInput: "" }))
                    )
                  }
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
              <TextField
                placeholder="Add strategic update point"
                fullWidth
                value={insights.strategicUpdateInput}
                onChange={(e) => setInsights((prev) => ({ ...prev, strategicUpdateInput: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddItem(
                      insights.strategicUpdateInput,
                      insights.strategicUpdates,
                      (items) => setInsights((prev) => ({ ...prev, strategicUpdates: items })),
                      () => setInsights((prev) => ({ ...prev, strategicUpdateInput: "" }))
                    );
                  }
                }}
              />
              {renderChips(insights.strategicUpdates, (index) =>
                setInsights((prev) => ({
                  ...prev,
                  strategicUpdates: prev.strategicUpdates.filter((_, idx) => idx !== index),
                }))
              )}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
            <Typography fontWeight={700} mb={1}>
              Financial or Guidance Commentary
            </Typography>
            <TextField
              placeholder="Any updates on financials, guidance, or key metrics..."
              multiline
              minRows={3}
              fullWidth
              value={insights.financialComments}
              onChange={(e) => setInsights((prev) => ({ ...prev, financialComments: e.target.value }))}
            />
          </Paper>
        </Stack>
      </Paper>

      <Paper sx={sectionCardSx}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700} color="primary">
            Investment Impact Assessment
          </Typography>

          <Stack spacing={1.5}>
            <Typography variant="body2" fontWeight={600}>
              Impact on Existing Thesis
            </Typography>
            <ToggleButtonGroup
              exclusive
              color="primary"
              value={impact.thesisImpact}
              onChange={(_, value) => value && setImpact((prev) => ({ ...prev, thesisImpact: value }))}
            >
              <ToggleButton value="positive">
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Positive
              </ToggleButton>
              <ToggleButton value="neutral">
                <TrendingFlatIcon fontSize="small" sx={{ mr: 0.5 }} /> No Change
              </ToggleButton>
              <ToggleButton value="negative">
                <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> Negative
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <TipsAndUpdatesIcon color="success" fontSize="small" />
                  <Typography variant="body2" fontWeight={700}>
                    Key Upside Drivers Identified
                  </Typography>
                </Stack>
                <Stack direction="row" gap={1}>
                  <TextField
                    placeholder="Add upside driver"
                    fullWidth
                    value={impact.upsideInput}
                    onChange={(e) => setImpact((prev) => ({ ...prev, upsideInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem(
                          impact.upsideInput,
                          impact.upsideDrivers,
                          (items) => setImpact((prev) => ({ ...prev, upsideDrivers: items })),
                          () => setImpact((prev) => ({ ...prev, upsideInput: "" }))
                        );
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() =>
                      handleAddItem(
                        impact.upsideInput,
                        impact.upsideDrivers,
                        (items) => setImpact((prev) => ({ ...prev, upsideDrivers: items })),
                        () => setImpact((prev) => ({ ...prev, upsideInput: "" }))
                      )
                    }
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
                {renderChips(impact.upsideDrivers, (index) =>
                  setImpact((prev) => ({
                    ...prev,
                    upsideDrivers: prev.upsideDrivers.filter((_, idx) => idx !== index),
                  }))
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <WarningAmberIcon color="error" fontSize="small" />
                  <Typography variant="body2" fontWeight={700}>
                    Key Risks or Red Flags
                  </Typography>
                </Stack>
                <Stack direction="row" gap={1}>
                  <TextField
                    placeholder="Add risk or red flag"
                    fullWidth
                    value={impact.riskInput}
                    onChange={(e) => setImpact((prev) => ({ ...prev, riskInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem(
                          impact.riskInput,
                          impact.risks,
                          (items) => setImpact((prev) => ({ ...prev, risks: items })),
                          () => setImpact((prev) => ({ ...prev, riskInput: "" }))
                        );
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() =>
                      handleAddItem(
                        impact.riskInput,
                        impact.risks,
                        (items) => setImpact((prev) => ({ ...prev, risks: items })),
                        () => setImpact((prev) => ({ ...prev, riskInput: "" }))
                      )
                    }
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
                {renderChips(impact.risks, (index) =>
                  setImpact((prev) => ({
                    ...prev,
                    risks: prev.risks.filter((_, idx) => idx !== index),
                  }))
                )}
              </Stack>
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel>Net Sentiment After Meeting</InputLabel>
            <Select
              label="Net Sentiment After Meeting"
              value={impact.netSentiment}
              onChange={(e) => setImpact((prev) => ({ ...prev, netSentiment: e.target.value }))}
            >
              {sentiments.map((sentiment) => (
                <MenuItem key={sentiment} value={sentiment}>
                  {sentiment}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={sectionCardSx}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700} color="primary">
            Action & Decision
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              Recommended Action
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={action.recommendation}
              color="primary"
              onChange={(_, value) => value && setAction((prev) => ({ ...prev, recommendation: value }))}
            >
              <ToggleButton value="increase">
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Increase
              </ToggleButton>
              <ToggleButton value="hold">
                <TrendingFlatIcon fontSize="small" sx={{ mr: 0.5 }} /> Hold
              </ToggleButton>
              <ToggleButton value="reduce">
                <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> Reduce
              </ToggleButton>
              <ToggleButton value="avoid">
                <DoDisturbAltIcon fontSize="small" sx={{ mr: 0.5 }} /> Avoid
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Position Size Change (%)"
                fullWidth
                type="number"
                value={action.positionChange}
                onChange={(e) => setAction((prev) => ({ ...prev, positionChange: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography color="text.secondary">%</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Stack direction="row" alignItems="center" gap={1}>
            <Switch
              checked={action.followUp}
              onChange={(e) => setAction((prev) => ({ ...prev, followUp: e.target.checked }))}
            />
            <Typography fontWeight={600}>Follow-up Required</Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={sectionCardSx}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700} color="primary">
            Notes, Attachments & Audit Trail
          </Typography>

          <TextField
            label="Additional Notes"
            placeholder="Any additional notes, observations, or context..."
            multiline
            minRows={4}
            fullWidth
            value={notesState.additionalNotes}
            onChange={(e) => setNotesState({ additionalNotes: e.target.value })}
          />

          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              Attachments
            </Typography>
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                bgcolor: "grey.50",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 32, color: "text.secondary" }} />
              <Typography mt={1} color="text.secondary">
                Drop files here or click to upload
              </Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                Choose Files
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                Supported: PDF, PPT, DOC
              </Typography>
            </Box>
          </Stack>

          <Divider />
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" gap={1} color="text.secondary">
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">Created: Jan 07, 2026 at 10:43</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1} color="text.secondary">
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2">Last updated: Jan 07, 2026 at 10:43</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button variant="outlined" color="inherit">
          Save Draft
        </Button>
        <Button variant="contained" color="primary">
          Submit Final Notes
        </Button>
      </Box>
    </Stack>
  );
};

export default MeetingDealNoteCreate;
