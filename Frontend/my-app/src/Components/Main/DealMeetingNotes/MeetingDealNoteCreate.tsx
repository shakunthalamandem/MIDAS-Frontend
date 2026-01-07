import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

type MeetingOverview = {
  ticker: string;
  name: string;
  date: string;
  location: string;
  reason: string;
  broker: string;
  attendees: string;
};

type InvestmentSnapshot = {
  oneLineSummary: string;
  executiveSummary: string;
  keyLevel: string;
  possibleSize: string;
  results: string;
};

type BusinessStrategy = {
  meetingNotes: string;
  catalysts: string;
  likelihoodPrimaryRaise: string;
  reasonForRaise: string;
  opportunisticDeal: string;
};

type CapitalStructure = {
  potentialSellers: string;
  ipoLockupExpiry: string;
  lastDealLockupExpiry: string;
  historicalSellers: string;
  followUpQuestions: string;
  managementEmailFeedback: string;
  bankerFollowUpFeedback: string;
};

type Status =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

const baseCardStyles = {
  p: { xs: 2.5, md: 3.5 },
  minHeight: { xs: 320, md: 380 },
  borderRadius: 3,
  background: "linear-gradient(135deg, #d8e7ff 0%, #e7f6ff 50%, #dff1ff 100%)",
  border: "1px solid rgba(0, 32, 96, 0.12)",
  boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
};

const initialMeetingOverview: MeetingOverview = {
  ticker: "",
  name: "",
  date: "",
  location: "",
  reason: "",
  broker: "",
  attendees: "",
};

const initialInvestmentSnapshot: InvestmentSnapshot = {
  oneLineSummary: "",
  executiveSummary: "",
  keyLevel: "",
  possibleSize: "",
  results: "",
};

const initialBusinessStrategy: BusinessStrategy = {
  meetingNotes: "",
  catalysts: "",
  likelihoodPrimaryRaise: "",
  reasonForRaise: "",
  opportunisticDeal: "",
};

const initialCapitalStructure: CapitalStructure = {
  potentialSellers: "",
  ipoLockupExpiry: "",
  lastDealLockupExpiry: "",
  historicalSellers: "",
  followUpQuestions: "",
  managementEmailFeedback: "",
  bankerFollowUpFeedback: "",
};

type FormState = {
  meetingOverview: MeetingOverview;
  investmentSnapshot: InvestmentSnapshot;
  businessStrategy: BusinessStrategy;
  capitalStructure: CapitalStructure;
};

const MeetingDealNoteCreate: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = useMemo(() => localStorage.getItem("access_token"), []);

  const [meetingOverview, setMeetingOverview] = useState<MeetingOverview>(initialMeetingOverview);

  const [investmentSnapshot, setInvestmentSnapshot] = useState<InvestmentSnapshot>(
    initialInvestmentSnapshot
  );

  const [businessStrategy, setBusinessStrategy] = useState<BusinessStrategy>(initialBusinessStrategy);

  const [capitalStructure, setCapitalStructure] = useState<CapitalStructure>(initialCapitalStructure);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [backupState, setBackupState] = useState<FormState | null>(null);

  const startEdit = () => {
    setBackupState({
      meetingOverview,
      investmentSnapshot,
      businessStrategy,
      capitalStructure,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (backupState) {
      setMeetingOverview(backupState.meetingOverview);
      setInvestmentSnapshot(backupState.investmentSnapshot);
      setBusinessStrategy(backupState.businessStrategy);
      setCapitalStructure(backupState.capitalStructure);
    }
    setIsEditing(false);
    setStatus(null);
  };

  const handleReset = () => {
    setMeetingOverview(initialMeetingOverview);
    setInvestmentSnapshot(initialInvestmentSnapshot);
    setBusinessStrategy(initialBusinessStrategy);
    setCapitalStructure(initialCapitalStructure);
  };

  const handleSubmit = async () => {
    setStatus(null);
    if (!apiUrl) {
      setStatus({ kind: "error", message: "REACT_APP_API_URL is not set." });
      return;
    }

    const normalizedTicker = meetingOverview.ticker.trim();
    const pricingDate = meetingOverview.date || "";

    const payload = {
      ticker: normalizedTicker,
      pricing_date: pricingDate,
      description: {
        meeting_overview: {
          name: meetingOverview.name,
          date: meetingOverview.date,
          location: meetingOverview.location,
          reason: meetingOverview.reason,
          broker: meetingOverview.broker,
          attendees: meetingOverview.attendees,
        },
        investment_snapshot: investmentSnapshot,
        business_strategy: businessStrategy,
        capital_structure: capitalStructure,
      },
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${apiUrl}/api/create_deal_meeting_notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create meeting notes");
      }

      setStatus({ kind: "success", message: "Meeting notes created successfully." });
    } catch (err: any) {
      console.error("Failed to submit meeting notes:", err);
      setStatus({ kind: "error", message: err?.message || "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options?: { multiline?: boolean; type?: string }
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
      disabled={!isEditing}
    />
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            onClick={startEdit}
            sx={{
              background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
              color: "#fff",
              borderRadius: 999,
              px: 2.5,
            }}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
                color: "#fff",
                borderRadius: 999,
                px: 2.5,
                boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloseOutlinedIcon />}
              onClick={handleCancel}
              disabled={submitting}
              sx={{
                borderColor: "#0050c8",
                color: "#0050c8",
                borderRadius: 999,
                px: 2.5,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<ReplayOutlinedIcon />}
              onClick={handleReset}
              disabled={submitting}
              sx={{
                borderColor: "#f28c28",
                color: "#f28c28",
                borderRadius: 999,
                px: 2.5,
              }}
            >
              Reset
            </Button>
          </>
        )}
      </Stack>

      {status ? (
        <Alert severity={status.kind} onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      ) : null}

      <Grid container spacing={1}>
        <Grid item xs={12} md={6}>
          <Paper sx={baseCardStyles}>
            <Typography variant="h6" fontWeight={700} color="#002060" mb={2}>
              Meeting Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderField("Ticker", meetingOverview.ticker, (val) =>
                  setMeetingOverview((prev) => ({ ...prev, ticker: val.toUpperCase() }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField("Name", meetingOverview.name, (val) =>
                  setMeetingOverview((prev) => ({ ...prev, name: val }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "Date",
                  meetingOverview.date,
                  (val) => setMeetingOverview((prev) => ({ ...prev, date: val })),
                  { type: "date" }
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField("Location", meetingOverview.location, (val) =>
                  setMeetingOverview((prev) => ({ ...prev, location: val }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField("Reason", meetingOverview.reason, (val) =>
                  setMeetingOverview((prev) => ({ ...prev, reason: val }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField("Broker", meetingOverview.broker, (val) =>
                  setMeetingOverview((prev) => ({ ...prev, broker: val }))
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "Attendees",
                  meetingOverview.attendees,
                  (val) => setMeetingOverview((prev) => ({ ...prev, attendees: val })),
                  { multiline: true }
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={baseCardStyles}>
            <Typography variant="h6" fontWeight={700} color="#002060" mb={2}>
              Investment Snapshot
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {renderField("One-line summary", investmentSnapshot.oneLineSummary, (val) =>
                  setInvestmentSnapshot((prev) => ({ ...prev, oneLineSummary: val }))
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "Executive summary",
                  investmentSnapshot.executiveSummary,
                  (val) => setInvestmentSnapshot((prev) => ({ ...prev, executiveSummary: val })),
                  { multiline: true }
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField("Key level", investmentSnapshot.keyLevel, (val) =>
                  setInvestmentSnapshot((prev) => ({ ...prev, keyLevel: val }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField("Possible size", investmentSnapshot.possibleSize, (val) =>
                  setInvestmentSnapshot((prev) => ({ ...prev, possibleSize: val }))
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "Results",
                  investmentSnapshot.results,
                  (val) => setInvestmentSnapshot((prev) => ({ ...prev, results: val })),
                  { multiline: true }
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={baseCardStyles}>
            <Typography variant="h6" fontWeight={700} color="#002060" mb={2}>
              Business, Strategy &amp; Catalysts
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {renderField(
                  "Meeting notes",
                  businessStrategy.meetingNotes,
                  (val) => setBusinessStrategy((prev) => ({ ...prev, meetingNotes: val })),
                  { multiline: true }
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "Catalysts (announcements, trial results)",
                  businessStrategy.catalysts,
                  (val) => setBusinessStrategy((prev) => ({ ...prev, catalysts: val })),
                  { multiline: true }
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "Likelihood of primary raise",
                  businessStrategy.likelihoodPrimaryRaise,
                  (val) => setBusinessStrategy((prev) => ({ ...prev, likelihoodPrimaryRaise: val }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "Reason for raise (cash burn, deleveraging, capex, acquisition)",
                  businessStrategy.reasonForRaise,
                  (val) => setBusinessStrategy((prev) => ({ ...prev, reasonForRaise: val }))
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "Possible opportunistic deal",
                  businessStrategy.opportunisticDeal,
                  (val) => setBusinessStrategy((prev) => ({ ...prev, opportunisticDeal: val })),
                  { multiline: true }
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={baseCardStyles}>
            <Typography variant="h6" fontWeight={700} color="#002060" mb={2}>
              Capital Structure, Shareholder Dynamics &amp; Follow-Ups
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderField("Potential sellers", capitalStructure.potentialSellers, (val) =>
                  setCapitalStructure((prev) => ({ ...prev, potentialSellers: val }))
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "IPO lock-up expiry",
                  capitalStructure.ipoLockupExpiry,
                  (val) => setCapitalStructure((prev) => ({ ...prev, ipoLockupExpiry: val })),
                  { type: "date" }
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "Last deal lock-up expiry",
                  capitalStructure.lastDealLockupExpiry,
                  (val) => setCapitalStructure((prev) => ({ ...prev, lastDealLockupExpiry: val })),
                  { type: "date" }
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField("Historical sellers", capitalStructure.historicalSellers, (val) =>
                  setCapitalStructure((prev) => ({ ...prev, historicalSellers: val }))
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "Follow-up questions for management",
                  capitalStructure.followUpQuestions,
                  (val) => setCapitalStructure((prev) => ({ ...prev, followUpQuestions: val })),
                  { multiline: true }
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "Management email feedback",
                  capitalStructure.managementEmailFeedback,
                  (val) => setCapitalStructure((prev) => ({ ...prev, managementEmailFeedback: val })),
                  { multiline: true }
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "Banker follow-up call feedback",
                  capitalStructure.bankerFollowUpFeedback,
                  (val) => setCapitalStructure((prev) => ({ ...prev, bankerFollowUpFeedback: val })),
                  { multiline: true }
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default MeetingDealNoteCreate;
