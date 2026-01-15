import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

export type MeetingOverview = {
  ticker: string;
  name: string;
  date: string;
  location: string;
  reason: string;
  broker: string;
  attendees: string;
};

export type InvestmentSnapshot = {
  oneLineSummary: string;
  executiveSummary: string;
  keyLevel: string;
  possibleSize: string;
  results: string;
};

export type BusinessStrategy = {
  meetingNotes: string;
  catalysts: string;
  likelihoodPrimaryRaise: string;
  reasonForRaise: string;
  opportunisticDeal: string;
};

export type CapitalStructure = {
  potentialSellers: string;
  ipoLockupExpiry: string;
  lastDealLockupExpiry: string;
  historicalSellers: string;
  followUpQuestions: string;
  managementEmailFeedback: string;
  bankerFollowUpFeedback: string;
};

type FormProps = {
  meetingOverview: MeetingOverview;
  setMeetingOverview: React.Dispatch<React.SetStateAction<MeetingOverview>>;
  investmentSnapshot: InvestmentSnapshot;
  setInvestmentSnapshot: React.Dispatch<React.SetStateAction<InvestmentSnapshot>>;
  businessStrategy: BusinessStrategy;
  setBusinessStrategy: React.Dispatch<React.SetStateAction<BusinessStrategy>>;
  capitalStructure: CapitalStructure;
  setCapitalStructure: React.Dispatch<React.SetStateAction<CapitalStructure>>;
  isEditing: boolean;
};

const sectionCardSx = {
  Padding: 2,
  borderRadius: 2,
  border: "1px solid #d9deeb",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

const checkboxSx = {
  color: "#002060",
  "&.Mui-checked": {
    color: "#002060",
  },
};

const reasonOptions = [
  "Pre earnings cash burn",
  "de-leverage",
  "debt expiry",
  "growth capex",
  "acquisition",
];

const catalystOptions = ["announcement", "Trial results"];

const potentialSellerOptions = [
  "Chairman",
  "PE",
  "Pre IPO",
  "Cross shareholding",
  "Existing substantial shareholder",
  "Lock up expiry",
];

const MeetingNoteForm: React.FC<FormProps> = ({
  meetingOverview,
  setMeetingOverview,
  investmentSnapshot,
  setInvestmentSnapshot,
  businessStrategy,
  setBusinessStrategy,
  capitalStructure,
  setCapitalStructure,
  isEditing,
}) => {
  const renderField = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options?: {
      multiline?: boolean;
      type?: string;
      readOnly?: boolean;
      placeholder?: string;
      required?: boolean;
      error?: boolean;
      helperText?: string;
    }
  ) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      size="small"
      multiline={options?.multiline}
      minRows={options?.multiline ? 2 : undefined}
      type={options?.type}
      InputLabelProps={options?.type === "date" ? { shrink: true } : undefined}
      InputProps={options?.readOnly ? { readOnly: true } : undefined}
      placeholder={options?.placeholder}
      required={options?.required}
      error={options?.error}
      helperText={options?.helperText}
      disabled={!isEditing && !options?.readOnly}
    />
  );

  const renderSelectField = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options: string[]
  ) => (
    <TextField
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      size="small"
      disabled={!isEditing}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );

  const renderMultiSelectField = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options: string[]
  ) => {
    const selectedValues = value
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    return (
      <TextField
        select
        label={label}
        value={selectedValues}
        onChange={(e) => {
          const next = Array.isArray(e.target.value) ? e.target.value : [];
          onChange(next.join(", "));
        }}
        SelectProps={{ multiple: true }}
        fullWidth
        size="small"
        disabled={!isEditing}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selectedValues.includes(option)} sx={checkboxSx} />
            {option}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const sectionHeader = (icon: React.ReactNode, title: string) => (
    <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: "rgba(0,80,200,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#002060",
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={700} color="#002060" sx={{ fontSize: "1rem" }}>
        {title}
      </Typography>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <Divider />

      <Grid
        container
        spacing={1}
        columnSpacing={{ xs: 1, md: 1 }}
        rowSpacing={{ xs: 1, md: 1 }}
        alignItems="stretch"
      >
        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
          <Paper sx={{ ...sectionCardSx, minHeight: { xs: 420, md: 460 } }}>
            <Box
              sx={{
                backgroundColor: "rgba(0,80,200,0.12)",
                borderRadius: 1.5,
                py: 0.75,
                px: 1,
              }}
            >
              {sectionHeader(<EventNoteOutlinedIcon fontSize="small" />, "Meeting Information")}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1} sx={{padding:2}}>
                            {renderField(
                "Ticker",
                meetingOverview.ticker,
                (val) => setMeetingOverview((prev) => ({ ...prev, ticker: val })),
                {
                  required: true,
                  error: isEditing && !meetingOverview.ticker.trim(),
                  helperText:
                    isEditing && !meetingOverview.ticker.trim() ? "Ticker is required." : "",
                }
              )}


              {renderField(
                "Meeting Name",
                meetingOverview.name,
                (val) => setMeetingOverview((prev) => ({ ...prev, name: val })),
                {
                  required: true,
                  error: isEditing && !meetingOverview.name.trim(),
                  helperText:
                    isEditing && !meetingOverview.name.trim() ? "Meeting name is required." : "",
                }
              )}
                            {renderField(
                "Meeting Date",
                meetingOverview.date,
                (val) => setMeetingOverview((prev) => ({ ...prev, date: val })),
                {
                  type: "date",
                  required: true,
                  error: isEditing && !meetingOverview.date.trim(),
                  helperText:
                    isEditing && !meetingOverview.date.trim() ? "Meeting date is required." : "",
                }
              )}

              {renderField("Location", meetingOverview.location, (val) =>
                setMeetingOverview((prev) => ({ ...prev, location: val }))
              )}
                            {renderSelectField(
                "Reason",
                meetingOverview.reason,
                (val) => setMeetingOverview((prev) => ({ ...prev, reason: val })),
                reasonOptions
              )}
              {renderField("Broker", meetingOverview.broker, (val) =>
                setMeetingOverview((prev) => ({ ...prev, broker: val }))
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
          <Paper sx={{ ...sectionCardSx, minHeight: { xs: 420, md: 460 } }}>
            <Box
              sx={{
                backgroundColor: "rgba(0,80,200,0.12)",
                borderRadius: 1.5,
                py: 0.75,
                px: 1,
              }}
            >
              {sectionHeader(<PeopleAltOutlinedIcon fontSize="small" />, "Attendees")}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1}  sx={{padding:2,flex: 1}}>
              {renderField(
                "Management",
                meetingOverview.attendees,
                (val) => setMeetingOverview((prev) => ({ ...prev, attendees: val })),
                { multiline: true }
              )}
              {renderField("Banker", "", () => undefined, { readOnly: true, multiline: true })}
              {renderField("Others", "", () => undefined, { readOnly: true, multiline: true })}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: "flex", mb: { xs: 2, md: 0 } }}>
          <Paper sx={{ ...sectionCardSx, minHeight: { xs: 420, md: 460 } }}>
            <Box
              sx={{
                backgroundColor: "rgba(0,80,200,0.12)",
                borderRadius: 1.5,
                py: 0.75,
                px: 1,
              }}
            >
              {sectionHeader(<AnalyticsOutlinedIcon fontSize="small" />, "Deal Metrics")}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={1} sx={{padding:2}}>
              <Grid item xs={12} sm={6}>
                {renderField("Key Level", investmentSnapshot.keyLevel, (val) =>
                  setInvestmentSnapshot((prev) => ({ ...prev, keyLevel: val }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField("Possible Deal Size", investmentSnapshot.possibleSize, (val) =>
                  setInvestmentSnapshot((prev) => ({ ...prev, possibleSize: val }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderSelectField(
                  "Primary Raise",
                  businessStrategy.likelihoodPrimaryRaise,
                  (val) => setBusinessStrategy((prev) => ({ ...prev, likelihoodPrimaryRaise: val })),
                  ["High", "Medium", "Low"]
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderSelectField(
                  "Opportunistic Deal",
                  businessStrategy.opportunisticDeal,
                  (val) => setBusinessStrategy((prev) => ({ ...prev, opportunisticDeal: val })),
                  ["Yes", "No"]
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "IPO Lock up Expiry",
                  capitalStructure.ipoLockupExpiry,
                  (val) => setCapitalStructure((prev) => ({ ...prev, ipoLockupExpiry: val })),
                  { type: "date" }
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "Last deal lock up expiry",
                  capitalStructure.lastDealLockupExpiry,
                  (val) =>
                    setCapitalStructure((prev) => ({
                      ...prev,
                      lastDealLockupExpiry: val,
                    })),
                  { type: "date" }
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "Results",
                  investmentSnapshot.results,
                  (val) => setInvestmentSnapshot((prev) => ({ ...prev, results: val })),
                  { type: "date" }
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderSelectField(
                  "Catalyst",
                  businessStrategy.catalysts,
                  (val) => setBusinessStrategy((prev) => ({ ...prev, catalysts: val })),
                  catalystOptions
                )}
              </Grid>
              <Grid item xs={12}>
                {renderMultiSelectField(
                  "Potential sellers",
                  capitalStructure.potentialSellers,
                  (val) => setCapitalStructure((prev) => ({ ...prev, potentialSellers: val })),
                  potentialSellerOptions
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField("Historical sellers", capitalStructure.historicalSellers, (val) =>
                  setCapitalStructure((prev) => ({ ...prev, historicalSellers: val }))
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={sectionCardSx}>
        <Box
          sx={{
            backgroundColor: "rgba(0,80,200,0.12)",
            borderRadius: 1.5,
            py: 0.75,
            px: 1,
          }}
        >
          {sectionHeader(<LightbulbOutlinedIcon fontSize="small" />, "Key Insights")}
        </Box>
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={1} sx={{padding:2}}>
          <Grid item xs={12} md={4}>
            {renderField(
              "One-line Summary",
              investmentSnapshot.oneLineSummary,
              (val) => setInvestmentSnapshot((prev) => ({ ...prev, oneLineSummary: val })),
              { multiline: true, placeholder: "One-line summary" }
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderField(
              "Executive Summary",
              investmentSnapshot.executiveSummary,
              (val) => setInvestmentSnapshot((prev) => ({ ...prev, executiveSummary: val })),
              { multiline: true, placeholder: "Executive summary" }
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            {renderField(
              "Meeting Notes",
              businessStrategy.meetingNotes,
              (val) => setBusinessStrategy((prev) => ({ ...prev, meetingNotes: val })),
              { multiline: true, placeholder: "Meeting notes" }
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ ...sectionCardSx}}>
        <Box
          sx={{
            backgroundColor: "rgba(0,80,200,0.12)",
            borderRadius: 1.5,
                        py: 0.75,
            px: 1,

          }}
        >
          {sectionHeader(<EmailOutlinedIcon fontSize="small" />, "Email Integration")}
        </Box>
        <Divider sx={{ my: 1 }} />
        <Stack spacing={1.5} sx={{padding:2}}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <Typography fontWeight={600} color="#1c2a4d">
              Send Emails To:
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <FormControlLabel
                control={<Checkbox defaultChecked sx={checkboxSx} />}
                label="Management"
              />
              <FormControlLabel
                control={<Checkbox defaultChecked sx={checkboxSx} />}
                label="Banker"
              />
              <FormControlLabel
                control={<Checkbox defaultChecked sx={checkboxSx} />}
                label="Internal Team"
              />
              <FormControlLabel
                control={<Checkbox defaultChecked sx={checkboxSx} />}
                label="CC Deal Captain"
              />
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Stack spacing={1.5}>
                {renderField(
                  "Management Emails",
                  capitalStructure.managementEmailFeedback,
                  (val) => setCapitalStructure((prev) => ({ ...prev, managementEmailFeedback: val })),
                  { placeholder: "management emails..." }
                )}
                {renderField(
                  "Banker Emails",
                  capitalStructure.bankerFollowUpFeedback,
                  (val) => setCapitalStructure((prev) => ({ ...prev, bankerFollowUpFeedback: val })),
                  { placeholder: "banker emails..." }
                )}
                {renderField("Internal Emails", "", () => undefined, {
                  readOnly: true,
                  placeholder: "internal emails...",
                })}
                {renderField(
                  "Email Subject",
                  meetingOverview.name,
                  (val) => setMeetingOverview((prev) => ({ ...prev, name: val }))
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={<Checkbox defaultChecked sx={checkboxSx} />}
                  label="Include in Email"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked sx={checkboxSx} />}
                  label="One-line Summary"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked sx={checkboxSx} />}
                  label="Executive Summary"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked sx={checkboxSx} />}
                  label="Meeting Notes"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked sx={checkboxSx} />}
                  label="Key Levels"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked sx={checkboxSx} />}
                  label="Deal Size"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked sx={checkboxSx} />}
                  label="Follow-up Question"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1.5} sx={{padding:2}}>
                <Typography fontWeight={600} color="#1c2a4d">
                  Follow-up &amp; Status
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(capitalStructure.followUpQuestions)}
                      sx={checkboxSx}
                      onChange={(e) =>
                        setCapitalStructure((prev) => ({
                          ...prev,
                          followUpQuestions: e.target.checked ? prev.followUpQuestions : "",
                        }))
                      }
                    />
                  }
                  label="Follow up question for management?"
                />
                {renderField(
                  "Follow-up Question",
                  capitalStructure.followUpQuestions,
                  (val) => setCapitalStructure((prev) => ({ ...prev, followUpQuestions: val })),
                  { multiline: true }
                )}
                <Typography variant="body2" color="#47516b">
                  Email Status: Draft
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined">Preview Email</Button>
            <Button variant="outlined">Save Draft</Button>
            <Button variant="contained">Send Email</Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default MeetingNoteForm;
