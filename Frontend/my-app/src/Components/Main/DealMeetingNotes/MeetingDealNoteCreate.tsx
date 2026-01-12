import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { DealSearchResult } from "./DealMeetingNotesMain";
import MeetingNoteForm, {
  type MeetingOverview,
  type InvestmentSnapshot,
  type BusinessStrategy,
  type CapitalStructure,
} from "./MeetingNoteForm";

type Status =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

export const initialMeetingOverview: MeetingOverview = {
  ticker: "",
  name: "",
  date: "",
  location: "",
  reason: "",
  broker: "",
  attendees: "",
};

export const initialInvestmentSnapshot: InvestmentSnapshot = {
  oneLineSummary: "",
  executiveSummary: "",
  keyLevel: "",
  possibleSize: "",
  results: "",
};

export const initialBusinessStrategy: BusinessStrategy = {
  meetingNotes: "",
  catalysts: "",
  likelihoodPrimaryRaise: "",
  reasonForRaise: "",
  opportunisticDeal: "",
};

export const initialCapitalStructure: CapitalStructure = {
  potentialSellers: "",
  ipoLockupExpiry: "",
  lastDealLockupExpiry: "",
  historicalSellers: "",
  followUpQuestions: "",
  managementEmailFeedback: "",
  bankerFollowUpFeedback: "",
};

export type FormState = {
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

type MeetingDealNoteCreateProps = {
  selectedDeal: DealSearchResult | null;
};

const MeetingDealNoteCreate: React.FC<MeetingDealNoteCreateProps> = ({ selectedDeal }) => {
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
  const [meetings, setMeetings] = useState<MeetingEntry[]>([]);
  const [selectedMeetingIndex, setSelectedMeetingIndex] = useState(0);
  const [currentMeetingId, setCurrentMeetingId] = useState<number | string | null>(null);
  const [currentMeetingKey, setCurrentMeetingKey] = useState<string>("meeting_overview");
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [noDataFound, setNoDataFound] = useState(false);
  const shouldShowEmptyState = noDataFound && meetings.length === 0;
  const [refreshKey, setRefreshKey] = useState(0);

  const getNextMeetingKey = () => {
    if (meetings.length === 0) return "meeting_overview";
    const regex = /^meeting_overview(\d+)?$/i;
    const maxIndex = meetings.reduce((max, entry) => {
      const match = entry.meetingKey.match(regex);
      if (!match) return max;
      const num = match[1] ? parseInt(match[1], 10) : 1;
      return Number.isNaN(num) ? max : Math.max(max, num);
    }, 1);
    const nextIndex = maxIndex + 1;
    return nextIndex === 1 ? "meeting_overview" : `meeting_overview${nextIndex}`;
  };

  const applyMeetingToForm = (entry: MeetingEntry) => {
    setMeetingOverview(entry.form.meetingOverview);
    setInvestmentSnapshot(entry.form.investmentSnapshot);
    setBusinessStrategy(entry.form.businessStrategy);
    setCapitalStructure(entry.form.capitalStructure);
    setCurrentMeetingId(entry.id ?? null);
    setCurrentMeetingKey(entry.meetingKey);
    setIsEditing(false);
    setBackupState(null);
  };

  const buildMeetingFromOverview = (
    overview: any,
    record: any,
    snapshot: any,
    strategy: any,
    capStruct: any
  ): MeetingEntry => ({
    id: record?.id ?? record?.pk ?? null,
    meetingKey: overview?.__key ?? "meeting_overview",
    form: {
      meetingOverview: {
        ticker: (record?.ticker || selectedDeal?.ticker || "").toUpperCase(),
        name: overview?.name || "",
        date: overview?.date || record?.pricing_date || selectedDeal?.pricingDate || "",
        location: overview?.location || "",
        reason: overview?.reason || "",
        broker: overview?.broker || "",
        attendees: overview?.attendees || "",
      },
      investmentSnapshot: {
        oneLineSummary: snapshot?.oneLineSummary || "",
        executiveSummary: snapshot?.executiveSummary || "",
        keyLevel: snapshot?.keyLevel || "",
        possibleSize: snapshot?.possibleSize || "",
        results: snapshot?.results || "",
      },
      businessStrategy: {
        meetingNotes: strategy?.meetingNotes || "",
        catalysts: strategy?.catalysts || "",
        likelihoodPrimaryRaise: strategy?.likelihoodPrimaryRaise || "",
        reasonForRaise: strategy?.reasonForRaise || "",
        opportunisticDeal: strategy?.opportunisticDeal || "",
      },
      capitalStructure: {
        potentialSellers: capStruct?.potentialSellers || "",
        ipoLockupExpiry: capStruct?.ipoLockupExpiry || "",
        lastDealLockupExpiry: capStruct?.lastDealLockupExpiry || "",
        historicalSellers: capStruct?.historicalSellers || "",
        followUpQuestions: capStruct?.followUpQuestions || "",
        managementEmailFeedback: capStruct?.managementEmailFeedback || "",
        bankerFollowUpFeedback: capStruct?.bankerFollowUpFeedback || "",
      },
    },
    isNew: false,
  });

  const normalizeRecordToMeetings = (record: any): MeetingEntry[] => {
    const desc = record?.description || {};
    const snapshot = desc.investment_snapshot || {};
    const strategy = desc.business_strategy || {};
    const capStruct = desc.capital_structure || {};

    // Collect any meeting_overview-like entries (meeting_overview, meeting_overview2, ...)
    const overviewEntries = Object.entries(desc).filter(
      ([key]) => key.toLowerCase().startsWith("meeting_overview")
    );

    if (overviewEntries.length === 0) {
      return [buildMeetingFromOverview({}, record, snapshot, strategy, capStruct)];
    }

    return overviewEntries.map(([key, overview]) =>
      buildMeetingFromOverview({ ...(overview as any), __key: key }, record, snapshot, strategy, capStruct)
    );
  };

  // Autofill ticker and date when selected from search, but keep other fields intact.
  useEffect(() => {
    if (!selectedDeal?.ticker) return;
    setMeetingOverview((prev) => ({
      ...prev,
      ticker: selectedDeal.ticker.toUpperCase(),
      date: selectedDeal.pricingDate || prev.date,
    }));
  }, [selectedDeal]);

  // Fetch existing meeting notes for the selected ticker + pricing_date.
  useEffect(() => {
    const ticker = selectedDeal?.ticker?.trim();
    const pricingDate = selectedDeal?.pricingDate;
    if (!apiUrl || !ticker || !pricingDate) return;

    const controller = new AbortController();
    const loadNotes = async () => {
      try {
        setLoadingMeetings(true);
        setStatus(null);
        setNoDataFound(false);
        const response = await fetch(`${apiUrl}/api/get_deal_meeting_notes/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, pricing_date: pricingDate }),
          signal: controller.signal,
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
          setCurrentMeetingKey("meeting_overview");
          setLoadingMeetings(false);
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
        if (err.name === "AbortError") return;
        console.error("Failed to load meeting notes:", err);
        setStatus({ kind: "error", message: err?.message || "Unable to load meeting notes." });
      } finally {
        setLoadingMeetings(false);
      }
    };

    loadNotes();
    return () => controller.abort();
  }, [apiUrl, selectedDeal, token, refreshKey]);

  const createNewMeetingFromTemplate = (resetExisting = false) => {
    const meetingKey = getNextMeetingKey();
    const templateMeeting: MeetingEntry = {
      meetingKey,
      form: {
        meetingOverview: {
          ...initialMeetingOverview,
          ticker: selectedDeal?.ticker?.toUpperCase() || "",
          date: selectedDeal?.pricingDate || "",
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
    setCurrentMeetingKey("meeting_overview");
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
    const pricingDate = selectedDeal?.pricingDate || meetingOverview.date || "";

    if (!normalizedTicker) {
      setStatus({ kind: "error", message: "Ticker is required (select from search)." });
      return;
    }

    if (!pricingDate) {
      setStatus({ kind: "error", message: "Pricing date is required (from search selection)." });
      return;
    }

    const payload = {
      ticker: normalizedTicker,
      pricing_date: pricingDate,
      description: {
        [currentMeetingKey]: {
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

    if (!isNewMeeting && currentMeetingId) {
      (payload as any).id = currentMeetingId;
    }

    const endpoint = shouldCreate
      ? `${apiUrl}/api/create_deal_meeting_notes/`
      : `${apiUrl}/api/update_deal_meeting_notes/`;

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
      setRefreshKey((key) => key + 1);
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
      {meetings.length > 0 ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          {meetings.map((_, idx) => (
            <Button
              key={`meeting-${idx}`}
              variant={idx === selectedMeetingIndex ? "contained" : "outlined"}
              onClick={() => {
                setSelectedMeetingIndex(idx);
                applyMeetingToForm(meetings[idx]);
              }}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                px: 2,
                background:
                  idx === selectedMeetingIndex
                    ? "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)"
                    : undefined,
                color: idx === selectedMeetingIndex ? "#fff" : undefined,
                borderColor: idx === selectedMeetingIndex ? "transparent" : "#0062ff",
              }}
            >
              {`Meeting ${idx + 1}`}
            </Button>
          ))}
          <Button
            variant="outlined"
            onClick={() => createNewMeetingFromTemplate()}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              px: 2,
              borderColor: "#f28c28",
                color: "#f28c28",
              }}
            >
              + New Meeting Note
            </Button>
          {meetings[selectedMeetingIndex]?.isNew ? (
            <Button
              variant="text"
              color="error"
              onClick={() => {
                const updated = meetings.filter((_, idx) => idx !== selectedMeetingIndex);
                setMeetings(updated);
                const nextIndex = updated.length > 0 ? 0 : 0;
                setSelectedMeetingIndex(nextIndex);
                if (updated[0]) {
                  applyMeetingToForm(updated[0]);
                } else {
                  applyMeetingToForm({
                    meetingKey: "meeting_overview",
                    form: {
                      meetingOverview: initialMeetingOverview,
                      investmentSnapshot: initialInvestmentSnapshot,
                      businessStrategy: initialBusinessStrategy,
                      capitalStructure: initialCapitalStructure,
                    },
                    isNew: true,
                  });
                }
              }}
              sx={{ textTransform: "none" }}
            >
              Cancel New Meeting
            </Button>
          ) : null}
        </Stack>
      ) : null}

      {noDataFound ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            borderColor: "rgba(0,80,200,0.25)",
            background: "linear-gradient(90deg, rgba(0,98,255,0.06), rgba(0,194,162,0.06))",
          }}
        >
          <Stack spacing={1.5} direction={{ xs: "column", sm: "row" }} alignItems="center">
            <Stack flex={1} spacing={0.5}>
              <Typography fontWeight={700} color="#002060">
                Meeting notes do not exist for this ticker.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new meeting note using the latest template.
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={() => createNewMeetingFromTemplate(true)}
              sx={{
                background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
                color: "#fff",
                borderRadius: 999,
                px: 2.5,
                textTransform: "none",
              }}
            >
              Create Meeting Note
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {loadingMeetings ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            borderColor: "rgba(0,80,200,0.15)",
            background: "rgba(0,32,96,0.03)",
            textAlign: "center",
          }}
        >
          <Typography fontWeight={700} color="#002060">
            Loading meeting notes...
          </Typography>
        </Paper>
      ) : null}

      {!loadingMeetings && !shouldShowEmptyState ? (
        <>
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
    </Stack>
  );
};

export default MeetingDealNoteCreate;
