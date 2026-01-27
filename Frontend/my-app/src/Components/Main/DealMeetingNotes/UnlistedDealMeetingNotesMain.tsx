import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import MeetingNoteForm from "./MeetingNoteForm";
import MeetingTabsBar from "./MeetingTabsBar";
import MeetingStatusPanels from "./MeetingStatusPanels";
import MeetingEditorActions from "./MeetingEditorActions";
import UnsavedChangesDialog from "./UnsavedChangesDialog";
import type {
  BusinessStrategy,
  CapitalStructure,
  InvestmentSnapshot,
  MeetingOverview,
} from "./MeetingNoteFormTypes";
import {
  initialBusinessStrategy,
  initialCapitalStructure,
  initialInvestmentSnapshot,
  initialMeetingOverview,
} from "./MeetingDealNoteCreate";

type Status =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

type FormState = {
  meetingOverview: MeetingOverview;
  investmentSnapshot: InvestmentSnapshot;
  businessStrategy: BusinessStrategy;
  capitalStructure: CapitalStructure;
};

type MeetingEntry = {
  id?: number | string;
  meetingKey: string;
  form: FormState;
  isNew?: boolean;
};

const UnlistedDealMeetingNotesMain: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = useMemo(() => localStorage.getItem("access_token"), []);

  const [tickerInput, setTickerInput] = useState("");
  const [pricingDateInput, setPricingDateInput] = useState("");
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
  const [meetings, setMeetings] = useState<MeetingEntry[]>([]);
  const [selectedMeetingIndex, setSelectedMeetingIndex] = useState(0);
  const [currentMeetingId, setCurrentMeetingId] = useState<number | string | null>(null);
  const [currentMeetingKey, setCurrentMeetingKey] = useState<string>("meeting1");
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [noDataFound, setNoDataFound] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const shouldShowEmptyState = meetings.length === 0;

  const getNextMeetingKey = () => {
    if (meetings.length === 0) return "meeting1";
    const regex = /^meeting(\d+)$/i;
    const maxIndex = meetings.reduce((max, entry) => {
      const match = entry.meetingKey.match(regex);
      if (!match) return max;
      const num = parseInt(match[1], 10);
      return Number.isNaN(num) ? max : Math.max(max, num);
    }, 1);
    return `meeting${maxIndex + 1}`;
  };

  const formatAttendeeGroup = (value: any, group: "management" | "banker") => {
    if (!value) return "";
    if (typeof value === "string") return value;
    const entries = Array.isArray(value?.[group]) ? value[group] : [];
    return entries.filter(Boolean).join(", ");
  };

  const buildAttendeesPayload = (managementValue: string, bankerValue: string) => {
    const normalize = (input: string) =>
      (input || "")
        .split(/,|;/)
        .map((item) => item.trim())
        .filter(Boolean);
    const management = normalize(managementValue);
    const banker = normalize(bankerValue);
    return {
      banker,
      management,
      others: [],
    };
  };

  const toBool = (value: any) =>
    value === true || value === "true" || value === 1 || value === "1";

  const applyMeetingToForm = (entry: MeetingEntry) => {
    setMeetingOverview(entry.form.meetingOverview);
    setInvestmentSnapshot(entry.form.investmentSnapshot);
    setBusinessStrategy(entry.form.businessStrategy);
    setCapitalStructure(entry.form.capitalStructure);
    setCurrentMeetingId(entry.id ?? null);
    setCurrentMeetingKey(entry.meetingKey);
    setIsEditing(false);
    setBackupState(null);
    setHasUnsavedChanges(false);
  };

  const buildMeetingFromOverview = (overview: any, record: any): MeetingEntry => ({
    id: record?.id ?? record?.pk ?? null,
    meetingKey: overview?.__key ?? "meeting1",
    form: {
      meetingOverview: {
        ticker: (overview?.ticker || record?.ticker || "").toUpperCase(),
        name: overview?.name || "",
        date: overview?.date || "",
        location: overview?.location || "",
        reason: overview?.reason || "",
        broker: overview?.broker || "",
        attendees: formatAttendeeGroup(overview?.attendees, "management"),
        bankerAttendees: formatAttendeeGroup(overview?.attendees, "banker"),
      },
      investmentSnapshot: {
        oneLineSummary: overview?.one_line_summary || "",
        executiveSummary: overview?.executive_summary || "",
        keyLevel: overview?.key_level || "",
        possibleSize: overview?.possible_size || "",
        results: overview?.results || "",
      },
      businessStrategy: {
        meetingNotes: overview?.meeting_notes || "",
        catalysts: overview?.catalyst || "",
        likelihoodPrimaryRaise: overview?.likelihood_of_primary_raise || "",
        reasonForRaise: overview?.likelihood_reason || "",
        opportunisticDeal: overview?.possible_opportunistic_deal || "",
      },
      capitalStructure: {
        potentialSellers: overview?.potential_sellers || "",
        ipoLockupExpiry: overview?.ipo_lockup_expiry || "",
        lastDealLockupExpiry: overview?.last_deal_lockup_expiry || "",
        historicalSellers: overview?.historical_sellers || "",
        followUpQuestions: overview?.follow_up_question_for_management || "",
        attachments: [],
        keyValueAmount: overview?.key_value_amount || "",
        keyValueComparator: overview?.key_value_comparator || "greater",
        keyValueAutomate: toBool(overview?.key_value_automate),
        emailRecipients: overview?.email_recipients || "",
        ipoLockupExpiryAutomate: toBool(overview?.ipo_lockup_expiry_automate),
        lastDealLockupExpiryAutomate: toBool(overview?.last_deal_lockup_expiry_automate),
        resultsAutomate: toBool(overview?.results_automate),
      },
    },
    isNew: false,
  });

  const normalizeRecordToMeetings = (record: any): MeetingEntry[] => {
    const desc = record?.description || {};
    const meetingEntries = Object.entries(desc).filter(([key]) =>
      key.toLowerCase().startsWith("meeting")
    );

    if (meetingEntries.length === 0) {
      return [buildMeetingFromOverview({}, record)];
    }

    return meetingEntries.map(([key, overview]) =>
      buildMeetingFromOverview({ ...(overview as any), __key: key }, record)
    );
  };

  const createNewMeetingFromTemplate = (resetExisting = false) => {
    const meetingKey = getNextMeetingKey();
    const templateMeeting: MeetingEntry = {
      meetingKey,
      form: {
        meetingOverview: {
          ...initialMeetingOverview,
          ticker: tickerInput.trim().toUpperCase(),
          date: "",
        },
        investmentSnapshot: initialInvestmentSnapshot,
        businessStrategy: initialBusinessStrategy,
        capitalStructure: initialCapitalStructure,
      },
      isNew: true,
    };
    const updated = resetExisting ? [templateMeeting] : [...meetings, templateMeeting];
    setMeetings(updated);
    setSelectedMeetingIndex(updated.length - 1);
    applyMeetingToForm(templateMeeting);
    setCurrentMeetingId(null);
    setIsEditing(true);
    setNoDataFound(false);
  };

  const startEdit = () => {
    setBackupState({
      meetingOverview,
      investmentSnapshot,
      businessStrategy,
      capitalStructure,
    });
    setIsEditing(true);
    setHasUnsavedChanges(false);
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
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setMeetingOverview(initialMeetingOverview);
    setInvestmentSnapshot(initialInvestmentSnapshot);
    setBusinessStrategy(initialBusinessStrategy);
    setCapitalStructure(initialCapitalStructure);
    setCurrentMeetingKey("meeting1");
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    if (!isEditing || !backupState) return;
    const isChanged =
      JSON.stringify(backupState.meetingOverview) !== JSON.stringify(meetingOverview) ||
      JSON.stringify(backupState.investmentSnapshot) !== JSON.stringify(investmentSnapshot) ||
      JSON.stringify(backupState.businessStrategy) !== JSON.stringify(businessStrategy) ||
      JSON.stringify(backupState.capitalStructure) !== JSON.stringify(capitalStructure);
    setHasUnsavedChanges(isChanged);
  }, [
    isEditing,
    backupState,
    meetingOverview,
    investmentSnapshot,
    businessStrategy,
    capitalStructure,
  ]);

  const requestDiscardConfirm = (action: () => void) => {
    if (!isEditing || !hasUnsavedChanges) {
      action();
      return;
    }
    setPendingAction(() => action);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleConfirmDiscard = () => {
    if (pendingAction) {
      pendingAction();
    }
    handleConfirmClose();
  };

  const loadNotes = async () => {
    if (!apiUrl) {
      setStatus({ kind: "error", message: "REACT_APP_API_URL is not set." });
      return;
    }

    const ticker = tickerInput.trim();
    const pricingDate = pricingDateInput.trim();
    if (!ticker || !pricingDate) {
      setStatus({ kind: "error", message: "Ticker and pricing date are required." });
      return;
    }

    try {
      setLoadingMeetings(true);
      setStatus(null);
      setNoDataFound(false);
      const response = await fetch(`${apiUrl}/api/unlisted_get_deal_meeting_notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker, pricing_date: pricingDate }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to load meeting notes");
      }

      const data = await response.json();
      if (data?.message && typeof data.message === "string") {
        setNoDataFound(true);
        setMeetings([]);
        setCurrentMeetingId(null);
        setCurrentMeetingKey("meeting1");
        return;
      }

      const items = Array.isArray(data) ? data : [data];
      const normalized = items.flatMap(normalizeRecordToMeetings);
      setMeetings(normalized);
      setSelectedMeetingIndex(0);
      if (normalized[0]) {
        applyMeetingToForm(normalized[0]);
      }
    } catch (err: any) {
      console.error("Failed to load meeting notes:", err);
      setStatus({ kind: "error", message: err?.message || "Unable to load meeting notes." });
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleSubmit = async () => {
    setStatus(null);
    if (!apiUrl) {
      setStatus({ kind: "error", message: "REACT_APP_API_URL is not set." });
      return;
    }

    const currentEntry = meetings[selectedMeetingIndex];
    const isNewMeeting = currentEntry?.isNew ?? meetings.length === 0;
    const hasExistingMeetingInDb = meetings.some((m) => !m.isNew);
    const shouldCreate = isNewMeeting && !hasExistingMeetingInDb;

    const normalizedTicker = meetingOverview.ticker.trim();
    const pricingDate = pricingDateInput.trim();

    if (!normalizedTicker) {
      setStatus({ kind: "error", message: "Ticker is required." });
      return;
    }

    if (!meetingOverview.name.trim()) {
      setStatus({ kind: "error", message: "Meeting name is required." });
      return;
    }

    if (!meetingOverview.date.trim()) {
      setStatus({ kind: "error", message: "Meeting date is required." });
      return;
    }

    if (!pricingDate) {
      setStatus({ kind: "error", message: "Pricing date is required." });
      return;
    }

    const meetingPayload = {
      date: meetingOverview.date,
      name: meetingOverview.name,
      broker: meetingOverview.broker,
      reason: meetingOverview.reason,
      ticker: meetingOverview.ticker,
      results: investmentSnapshot.results,
      catalyst: businessStrategy.catalysts,
      location: meetingOverview.location,
      attendees: buildAttendeesPayload(
        meetingOverview.attendees,
        meetingOverview.bankerAttendees
      ),
      key_level: investmentSnapshot.keyLevel,
      meeting_notes: businessStrategy.meetingNotes,
      possible_size: investmentSnapshot.possibleSize,
      one_line_summary: investmentSnapshot.oneLineSummary,
      executive_summary: investmentSnapshot.executiveSummary,
      ipo_lockup_expiry: capitalStructure.ipoLockupExpiry,
      likelihood_reason: businessStrategy.reasonForRaise,
      potential_sellers: capitalStructure.potentialSellers,
      historical_sellers: capitalStructure.historicalSellers,
      last_deal_lockup_expiry: capitalStructure.lastDealLockupExpiry,
      likelihood_of_primary_raise: businessStrategy.likelihoodPrimaryRaise,
      possible_opportunistic_deal: businessStrategy.opportunisticDeal,
      follow_up_question_for_management: capitalStructure.followUpQuestions,
      email_recipients: capitalStructure.emailRecipients,
      ipo_lockup_expiry_automate: capitalStructure.ipoLockupExpiryAutomate,
      last_deal_lockup_expiry_automate: capitalStructure.lastDealLockupExpiryAutomate,
      results_automate: capitalStructure.resultsAutomate,
    };

    const payload: any = {
      ticker: normalizedTicker,
      pricing_date: pricingDate,
      description: {
        [currentMeetingKey]: meetingPayload,
      },
    };

    const existingRecordId =
      currentMeetingId ?? meetings.find((entry) => !entry.isNew && entry.id)?.id ?? null;
    if (!shouldCreate && existingRecordId) {
      payload.id = existingRecordId;
    }

    const endpoint = shouldCreate
      ? `${apiUrl}/api/unlisted_create_deal_meeting_notes/`
      : `${apiUrl}/api/unlisted_update_deal_meeting_notes/`;

    try {
      setSubmitting(true);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText ||
            (isNewMeeting ? "Failed to create meeting notes" : "Failed to update meeting notes")
        );
      }

      setStatus({
        kind: "success",
        message: shouldCreate
          ? "Meeting notes created successfully."
          : "Meeting notes updated successfully.",
      });
      setIsEditing(false);
      setNoDataFound(false);
      await loadNotes();
    } catch (err: any) {
      console.error("Failed to submit meeting notes:", err);
      setStatus({
        kind: "error",
        message: err?.message || "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          backgroundColor: "rgba(0,32,96,0.05)",
          border: "1px solid rgba(0,32,96,0.12)",
        }}
      >
        <Stack spacing={2}>
          <Typography sx={{ color: "#002060", fontWeight: 700 }}>
            Unlisted Meeting Notes
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <TextField
              size="small"
              label="Ticker"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              sx={{ minWidth: 160 }}
            />
            <TextField
              size="small"
              label="Pricing Date"
              type="date"
              value={pricingDateInput}
              onChange={(e) => setPricingDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              onClick={() => requestDiscardConfirm(loadNotes)}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 3,
                background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
              }}
            >
              Load Notes
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                requestDiscardConfirm(() => {
                  setMeetings([]);
                  setSelectedMeetingIndex(0);
                  setCurrentMeetingId(null);
                  setCurrentMeetingKey("meeting1");
                  setNoDataFound(false);
                  setStatus(null);
                })
              }
              sx={{ textTransform: "none", borderRadius: 999 }}
            >
              Clear
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Enter a ticker and pricing date to load existing unlisted meeting notes.
          </Typography>
        </Stack>
      </Paper>

      {!shouldShowEmptyState ? (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 999,
            border: "1px solid #d8deef",
            backgroundColor: "rgba(0,32,96,0.06)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <MeetingTabsBar
              totalMeetings={meetings.length}
              selectedIndex={selectedMeetingIndex}
              onSelectIndex={(idx) =>
                requestDiscardConfirm(() => {
                  setSelectedMeetingIndex(idx);
                  applyMeetingToForm(meetings[idx]);
                })
              }
              onAddNew={() => createNewMeetingFromTemplate()}
              showCancelNew={Boolean(meetings[selectedMeetingIndex]?.isNew)}
              onCancelNew={() => {
                requestDiscardConfirm(() => {
                  const updated = meetings.filter((_, idx) => idx !== selectedMeetingIndex);
                  setMeetings(updated);
                  const nextIndex = updated.length > 0 ? 0 : 0;
                  setSelectedMeetingIndex(nextIndex);
                  if (updated[0]) {
                    applyMeetingToForm(updated[0]);
                  } else {
                    applyMeetingToForm({
                      meetingKey: "meeting1",
                      form: {
                        meetingOverview: initialMeetingOverview,
                        investmentSnapshot: initialInvestmentSnapshot,
                        businessStrategy: initialBusinessStrategy,
                        capitalStructure: initialCapitalStructure,
                      },
                      isNew: true,
                    });
                  }
                });
              }}
              container={false}
            />
            <MeetingEditorActions
              isEditing={isEditing}
              submitting={submitting}
              onEdit={startEdit}
              onSave={handleSubmit}
              onCancel={handleCancel}
              onReset={handleReset}
              container={false}
            />
          </Box>
        </Paper>
      ) : null}

      <MeetingStatusPanels
        noDataFound={noDataFound}
        loading={loadingMeetings}
        onCreateNew={() => createNewMeetingFromTemplate(true)}
      />

      {!loadingMeetings && !shouldShowEmptyState ? (
        <>
          {status ? (
            <Alert severity={status.kind} onClose={() => setStatus(null)}>
              {status.message}
            </Alert>
          ) : null}

          <MeetingNoteForm
            meetingOverview={meetingOverview}
            setMeetingOverview={setMeetingOverview}
            investmentSnapshot={investmentSnapshot}
            setInvestmentSnapshot={setInvestmentSnapshot}
            businessStrategy={businessStrategy}
            setBusinessStrategy={setBusinessStrategy}
            capitalStructure={capitalStructure}
            setCapitalStructure={setCapitalStructure}
            isEditing={isEditing}
          />
        </>
      ) : null}

      <UnsavedChangesDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onDiscard={handleConfirmDiscard}
      />
    </Stack>
  );
};

export default UnlistedDealMeetingNotesMain;
