import React from "react";
import {
  Box,
  Checkbox,
  Divider,
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
  bankerAttendees: string;
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
  keyValueAmount: string;
  keyValueComparator: string;
  keyValueAutomate: boolean;
  managementEmailFeedback: string;
  bankerFollowUpFeedback: string;
  emailSendToManagement: boolean;
  emailSendToBanker: boolean;
  emailSendToInternalTeam: boolean;
  emailSendToDealCaptain: boolean;
  emailIncludeInEmail: boolean;
  emailIncludeOneLineSummary: boolean;
  emailIncludeExecutiveSummary: boolean;
  emailIncludeMeetingNotes: boolean;
  emailIncludeKeyLevels: boolean;
  emailIncludeDealSize: boolean;
  emailIncludeFollowUpQuestion: boolean;
  ipoLockupExpiryAutomate: boolean;
  ipoLockupExpiryEmailTwoWeeks: boolean;
  ipoLockupExpiryEmailOnDay: boolean;
  lastDealLockupExpiryAutomate: boolean;
  lastDealLockupExpiryEmailTwoWeeks: boolean;
  lastDealLockupExpiryEmailOnDay: boolean;
  resultsAutomate: boolean;
  resultsEmailTwoWeeks: boolean;
  resultsEmailOnDay: boolean;
  opportunisticDealEmailOnTrigger: boolean;
};

type FormProps = {
  meetingOverview: MeetingOverview;
  setMeetingOverview: React.Dispatch<React.SetStateAction<MeetingOverview>>;
  investmentSnapshot: InvestmentSnapshot;
  setInvestmentSnapshot: React.Dispatch<
    React.SetStateAction<InvestmentSnapshot>
  >;
  businessStrategy: BusinessStrategy;
  setBusinessStrategy: React.Dispatch<React.SetStateAction<BusinessStrategy>>;
  capitalStructure: CapitalStructure;
  setCapitalStructure: React.Dispatch<React.SetStateAction<CapitalStructure>>;
  isEditing: boolean;
};

const sectionCardSx = {
  Padding: 2,
  borderRadius: 2,
  border: "1px solid #d3dbf0",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

const checkboxSx = {
  color: "#0b2a6f",
  "&.Mui-checked": {
    color: "#0b2a6f",
  },
};

const readOnlyFieldSx = {
  "& .MuiInputBase-root.Mui-disabled": {
    color: "#1a2b5a",
    WebkitTextFillColor: "#1a2b5a",
    opacity: 1,
    backgroundColor: "#ffffff",
  },
};

const headingColor = "#0b2a6f";
const headerBg = "#0b2a6f";
const uiFontFamily = "'Inter', system-ui, sans-serif";

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
    <Stack spacing={0.5}>
      <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
        {label}
        {options?.required ? " *" : ""}
      </Typography>
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        size="small"
        multiline={options?.multiline}
        minRows={options?.multiline ? 2 : undefined}
        type={options?.type}
        InputProps={{
          readOnly: !isEditing || options?.readOnly,
          sx: { fontFamily: uiFontFamily },
        }}
        placeholder={options?.placeholder}
        required={options?.required}
        error={options?.error}
        helperText={options?.helperText}
        disabled={options?.readOnly}
        sx={{
          ...readOnlyFieldSx,
          "& .MuiInputBase-input": {
            fontFamily: uiFontFamily,
          },
        }}
      />
    </Stack>
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
      <Stack spacing={0.5}>
        <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
          {label}
        </Typography>
        <TextField
          select
          value={selectedValues}
          onChange={(e) => {
            const next = Array.isArray(e.target.value) ? e.target.value : [];
            onChange(next.join(", "));
          }}
          SelectProps={{ multiple: true }}
          fullWidth
          size="small"
          disabled={!isEditing}
          sx={{
            ...readOnlyFieldSx,
            "& .MuiInputBase-input": {
              fontFamily: uiFontFamily,
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox
                checked={selectedValues.includes(option)}
                sx={checkboxSx}
              />
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    );
  };

  const renderInsightField = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    placeholder?: string,
    options?: {
      maxHeight?: number;
    }
  ) => {
    const textareaMaxHeight = options?.maxHeight ?? 120;
    return (
      <Grid
        container
        spacing={1}
        alignItems="center"
        sx={{
          px: { xs: 0.5, md: 1 },
          py: 0.5,
        }}
      >
        <Grid item xs={12} md={2}>
          <Typography
            fontWeight={600}
            color={headingColor}
            sx={{ textAlign: { xs: "left", md: "left" }, fontFamily: uiFontFamily }}
          >
            {label}
          </Typography>
        </Grid>
        <Grid item xs={12} md={10}>
          <TextField
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            placeholder={placeholder}
            InputProps={{
              readOnly: !isEditing,
              sx: {
                fontFamily: uiFontFamily,
                "& textarea": {
                  minHeight: 44,
                  maxHeight: textareaMaxHeight,
                  overflow: "auto",
                },
              },
            }}
            multiline
            minRows={1}
            maxRows={4}
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 1,
              width: "100%",
              ...readOnlyFieldSx,
              "& .MuiInputBase-input": {
                fontFamily: uiFontFamily,
              },
            }}
          />
        </Grid>
      </Grid>
    );
  };

  const sectionHeader = (icon: React.ReactNode, title: string) => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      justifyContent="center"
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        fontWeight={700}
        color="#ffffff"
        sx={{ fontSize: "1rem", fontFamily: uiFontFamily }}
      >
        {title}
      </Typography>
    </Stack>
  );

  return (
    <Stack spacing={2}>
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
                backgroundColor: headerBg,
                borderRadius: 1.5,
                py: 0.75,
                px: 1,
              }}
            >
              {sectionHeader(
                <EventNoteOutlinedIcon fontSize="small" />,
                "Meeting Information"
              )}
            </Box>
            <Stack spacing={1} sx={{ padding: 2 }}>
              {renderField(
                "Ticker",
                meetingOverview.ticker,
                (val) =>
                  setMeetingOverview((prev) => ({ ...prev, ticker: val })),
                {
                  required: true,
                  error: isEditing && !meetingOverview.ticker.trim(),
                  helperText:
                    isEditing && !meetingOverview.ticker.trim()
                      ? "Ticker is required."
                      : "",
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
                    isEditing && !meetingOverview.name.trim()
                      ? "Meeting name is required."
                      : "",
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
                    isEditing && !meetingOverview.date.trim()
                      ? "Meeting date is required."
                      : "",
                }
              )}

              {renderField("Location", meetingOverview.location, (val) =>
                setMeetingOverview((prev) => ({ ...prev, location: val }))
              )}
              {renderField("Meeting Reason", meetingOverview.reason, (val) =>
                setMeetingOverview((prev) => ({ ...prev, reason: val }))
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
                backgroundColor: headerBg,
                borderRadius: 1.5,
                py: 0.75,
                px: 1,
              }}
            >
              {sectionHeader(
                <PeopleAltOutlinedIcon fontSize="small" />,
                "Attendees"
              )}
            </Box>
            <Stack spacing={1} sx={{ padding: 2, flex: 1 }}>
              {renderField(
                "Management",
                meetingOverview.attendees,
                (val) =>
                  setMeetingOverview((prev) => ({ ...prev, attendees: val })),
                { multiline: true }
              )}
              {renderField(
                "Banker",
                meetingOverview.bankerAttendees,
                (val) =>
                  setMeetingOverview((prev) => ({
                    ...prev,
                    bankerAttendees: val,
                  })),
                { multiline: true }
              )}
              {renderMultiSelectField(
                "Reason",
                businessStrategy.reasonForRaise,
                (val) =>
                  setBusinessStrategy((prev) => ({
                    ...prev,
                    reasonForRaise: val,
                  })),
                reasonOptions
              )}
              {renderMultiSelectField(
                "Opportunistic Deal",
                businessStrategy.opportunisticDeal,
                (val) =>
                  setBusinessStrategy((prev) => ({
                    ...prev,
                    opportunisticDeal: val,
                  })),
                ["Yes", "No"]
              )}
              {renderMultiSelectField(
                "Catalyst",
                businessStrategy.catalysts,
                (val) =>
                  setBusinessStrategy((prev) => ({ ...prev, catalysts: val })),
                catalystOptions
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: "flex", mb: { xs: 2, md: 0 } }}
        >
          <Paper sx={{ ...sectionCardSx, minHeight: { xs: 420, md: 460 } }}>
            <Box
              sx={{
                backgroundColor: headerBg,
                borderRadius: 1.5,
                py: 0.75,
                px: 1,
              }}
            >
              {sectionHeader(
                <AnalyticsOutlinedIcon fontSize="small" />,
                "Deal Metrics"
              )}
            </Box>
            <Stack spacing={1} sx={{ padding: 2 }}>
              {renderField(
                "Possible Deal Size",
                investmentSnapshot.possibleSize,
                (val) =>
                  setInvestmentSnapshot((prev) => ({
                    ...prev,
                    possibleSize: val,
                  }))
              )}
              {renderField(
                "IPO Lock up Expiry",
                capitalStructure.ipoLockupExpiry,
                (val) =>
                  setCapitalStructure((prev) => ({
                    ...prev,
                    ipoLockupExpiry: val,
                  })),
                { type: "date" }
              )}
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
              {renderField(
                "Results",
                investmentSnapshot.results,
                (val) =>
                  setInvestmentSnapshot((prev) => ({ ...prev, results: val })),
                { type: "date" }
              )}
              {renderMultiSelectField(
                "Potential sellers",
                capitalStructure.potentialSellers,
                (val) =>
                  setCapitalStructure((prev) => ({
                    ...prev,
                    potentialSellers: val,
                  })),
                potentialSellerOptions
              )}
              {renderField(
                "Historical sellers",
                capitalStructure.historicalSellers,
                (val) =>
                  setCapitalStructure((prev) => ({
                    ...prev,
                    historicalSellers: val,
                  }))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={sectionCardSx}>
        <Box
          sx={{
            backgroundColor: headerBg,
            borderRadius: 1.5,
            py: 0.75,
            px: 1,
          }}
        >
          {sectionHeader(
            <LightbulbOutlinedIcon fontSize="small" />,
            "Key Insights"
          )}
        </Box>
        <Stack spacing={1} sx={{ padding: 2 }}>
          {renderInsightField(
            "One-line Summary",
            investmentSnapshot.oneLineSummary,
            (val) =>
              setInvestmentSnapshot((prev) => ({
                ...prev,
                oneLineSummary: val,
              })),
            "One-line summary"
          )}
          <Divider sx={{ borderColor: "#d9deeb" }} />
          {renderInsightField(
            "Executive Summary",
            investmentSnapshot.executiveSummary,
            (val) =>
              setInvestmentSnapshot((prev) => ({
                ...prev,
                executiveSummary: val,
              })),
            "Executive summary"
          )}
          <Divider sx={{ borderColor: "#d9deeb" }} />
          {renderInsightField(
            "Meeting Notes",
            businessStrategy.meetingNotes,
            (val) =>
              setBusinessStrategy((prev) => ({ ...prev, meetingNotes: val })),
            "Meeting notes",
            { maxHeight: 500 }
          )}
          <Divider sx={{ borderColor: "#d9deeb" }} />
          {renderInsightField(
            "Follow-up Questions",
            capitalStructure.followUpQuestions,
            (val) =>
              setCapitalStructure((prev) => ({
                ...prev,
                followUpQuestions: val,
              })),
            "Follow-up questions"
          )}
        </Stack>
      </Paper>

      <Paper sx={{ ...sectionCardSx }}>
        <Box
          sx={{
            backgroundColor: headerBg,
            borderRadius: 1.5,
            py: 0.75,
            px: 1,
          }}
        >
          {sectionHeader(
            <EmailOutlinedIcon fontSize="small" />,
            "Email Automation"
          )}
        </Box>
        <Paper
          variant="outlined"
          sx={{
            borderColor: "#d9deeb",
            borderRadius: 2,
            p: { xs: 1.5, md: 2 },
            background:
              "linear-gradient(135deg, rgba(11,42,111,0.06) 0%, rgba(255,255,255,0.92) 70%)",
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                borderRadius: 1.5,
                backgroundColor: "#ffffff",
                px: 1.5,
                py: 1,
              }}
            >
              <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
                IPO lockup expiry?
              </Typography>
              <Checkbox
                checked={capitalStructure.ipoLockupExpiryAutomate}
                sx={checkboxSx}
                disabled={!isEditing}
                onChange={(e) =>
                  setCapitalStructure((prev) => ({
                    ...prev,
                    ipoLockupExpiryAutomate: e.target.checked,
                  }))
                }
              />
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                borderRadius: 1.5,
                backgroundColor: "#ffffff",
                px: 1.5,
                py: 1,
              }}
            >
              <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
                Last deal lockup expiry?
              </Typography>
              <Checkbox
                checked={capitalStructure.lastDealLockupExpiryAutomate}
                sx={checkboxSx}
                disabled={!isEditing}
                onChange={(e) =>
                  setCapitalStructure((prev) => ({
                    ...prev,
                    lastDealLockupExpiryAutomate: e.target.checked,
                  }))
                }
              />
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                borderRadius: 1.5,
                backgroundColor: "#ffffff",
                px: 1.5,
                py: 1,
              }}
            >
              <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
                Results?
              </Typography>
              <Checkbox
                checked={capitalStructure.resultsAutomate}
                sx={checkboxSx}
                disabled={!isEditing}
                onChange={(e) =>
                  setCapitalStructure((prev) => ({
                    ...prev,
                    resultsAutomate: e.target.checked,
                  }))
                }
              />
            </Stack>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              spacing={1}
              sx={{
                borderRadius: 1.5,
                backgroundColor: "#ffffff",
                px: 1.5,
                py: 1,
              }}
            >
              <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
                Key Level
              </Typography>
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                spacing={1}
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                <TextField
                  value={capitalStructure.keyValueAmount}
                  onChange={(e) =>
                    setCapitalStructure((prev) => ({
                      ...prev,
                      keyValueAmount: e.target.value,
                    }))
                  }
                  size="small"
                  placeholder="$0"
                  disabled={!isEditing}
                  sx={{
                    minWidth: { xs: "100%", md: 140 },
                    "& .MuiInputBase-input": {
                      fontFamily: uiFontFamily,
                    },
                  }}
                />
                <TextField
                  select
                  value={capitalStructure.keyValueComparator}
                  onChange={(e) =>
                    setCapitalStructure((prev) => ({
                      ...prev,
                      keyValueComparator: e.target.value,
                    }))
                  }
                  size="small"
                  disabled={!isEditing}
                  sx={{
                    minWidth: { xs: "100%", md: 160 },
                    "& .MuiInputBase-input": {
                      fontFamily: uiFontFamily,
                    },
                  }}
                >
                  <MenuItem value="greater">Greater than</MenuItem>
                  <MenuItem value="lesser">Lesser than</MenuItem>
                </TextField>
                <Checkbox
                  checked={capitalStructure.keyValueAutomate}
                  sx={checkboxSx}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setCapitalStructure((prev) => ({
                      ...prev,
                      keyValueAutomate: e.target.checked,
                    }))
                  }
                />
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Paper>
    </Stack>
  );
};

export default MeetingNoteForm;
