import React from "react";
import {
  Checkbox,
  Grid,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
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

const baseCardStyles = {
  p: { xs: 2.5, md: 3.5 },
  minHeight: { xs: 320, md: 380 },
  borderRadius: 3,
  background: "linear-gradient(135deg, #d8e7ff 0%, #e7f6ff 50%, #dff1ff 100%)",
  border: "1px solid rgba(0, 32, 96, 0.12)",
  boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
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
    options?: { multiline?: boolean; type?: string; readOnly?: boolean }
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
      disabled={!isEditing && !options?.readOnly}
    />
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

    const handleChange = (event: SelectChangeEvent<string[]>) => {
      const selected = Array.isArray(event.target.value)
        ? event.target.value
        : (event.target.value as string).split(",");
      const normalized = selected.map((item) => item.trim()).filter(Boolean);
      onChange(normalized.join(", "));
    };

    return (
      <TextField
        select
        label={label}
        value={selectedValues}
        onChange={(event) => handleChange(event as SelectChangeEvent<string[]>)}
        SelectProps={{
          multiple: true,
          renderValue: (selected) => (selected as string[]).join(", "),
        }}
        fullWidth
        size="small"
        disabled={!isEditing}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selectedValues.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const parseKeyLevel = (value: string) => {
    if (!value) return { comparator: "", amount: "" };
    const parts = value.trim().split(/\s+/);
    const first = parts[0]?.toLowerCase();
    if (first === "greater" || first === "lesser") {
      return { comparator: first, amount: parts.slice(1).join(" ") };
    }
    return { comparator: "", amount: value };
  };

  const buildKeyLevel = (comparator: string, amount: string) => {
    if (!comparator && !amount) return "";
    if (!comparator) return amount;
    return amount ? `${comparator} ${amount}` : comparator;
  };

  const { comparator: keyLevelComparator, amount: keyLevelAmount } = parseKeyLevel(
    investmentSnapshot.keyLevel
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={6}>
        <Paper sx={baseCardStyles}>
          <Typography variant="h6" fontWeight={700} color="#002060" mb={2}>
            Meeting Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {renderField(
                "Ticker",
                meetingOverview.ticker,
                (val) => setMeetingOverview((prev) => ({ ...prev, ticker: val.toUpperCase() })),
                { readOnly: true }
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
                { type: "date", readOnly: true }
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
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Key level"
                    value={keyLevelComparator}
                    onChange={(e) =>
                      setInvestmentSnapshot((prev) => ({
                        ...prev,
                        keyLevel: buildKeyLevel(e.target.value, keyLevelAmount),
                      }))
                    }
                    fullWidth
                    size="small"
                    disabled={!isEditing}
                  >
                    <MenuItem value="greater">greater</MenuItem>
                    <MenuItem value="lesser">lesser</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Value"
                    value={keyLevelAmount}
                    onChange={(e) =>
                      setInvestmentSnapshot((prev) => ({
                        ...prev,
                        keyLevel: buildKeyLevel(keyLevelComparator, e.target.value),
                      }))
                    }
                    fullWidth
                    size="small"
                    type="number"
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField("Possible size", investmentSnapshot.possibleSize, (val) =>
                setInvestmentSnapshot((prev) => ({ ...prev, possibleSize: val }))
              )}
            </Grid>
            <Grid item xs={12}>
              {renderField(
                "Results date",
                investmentSnapshot.results,
                (val) => setInvestmentSnapshot((prev) => ({ ...prev, results: val })),
                { type: "date" }
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
              {renderMultiSelectField(
                "Catalysts",
                businessStrategy.catalysts,
                (val) => setBusinessStrategy((prev) => ({ ...prev, catalysts: val })),
                catalystOptions
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
              {renderMultiSelectField(
                "Reason for raise",
                businessStrategy.reasonForRaise,
                (val) => setBusinessStrategy((prev) => ({ ...prev, reasonForRaise: val })),
                reasonOptions
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Possible opportunistic deal"
                value={businessStrategy.opportunisticDeal}
                onChange={(e) =>
                  setBusinessStrategy((prev) => ({
                    ...prev,
                    opportunisticDeal: e.target.value,
                  }))
                }
                fullWidth
                size="small"
                disabled={!isEditing}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
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
              {renderMultiSelectField(
                "Potential sellers",
                capitalStructure.potentialSellers,
                (val) => setCapitalStructure((prev) => ({ ...prev, potentialSellers: val })),
                potentialSellerOptions
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
  );
};

export default MeetingNoteForm;
