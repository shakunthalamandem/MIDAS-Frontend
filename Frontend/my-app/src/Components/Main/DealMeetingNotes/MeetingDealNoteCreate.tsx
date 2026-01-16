import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Paper, Stack } from "@mui/material";
import type { DealSearchResult } from "./DealMeetingNotesMain";
import MeetingNoteForm from "./MeetingNoteForm";
import type {
  MeetingOverview,
  InvestmentSnapshot,
  BusinessStrategy,
  CapitalStructure,
} from "./MeetingNoteFormTypes";
import MeetingTabsBar from "./MeetingTabsBar";
import MeetingStatusPanels from "./MeetingStatusPanels";
import MeetingEditorActions from "./MeetingEditorActions";
import UnsavedChangesDialog from "./UnsavedChangesDialog";

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
  bankerAttendees: "",
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
  attachments: [],
  keyValueAmount: "",
  keyValueComparator: "greater",
  keyValueAutomate: false,
  emailRecipients: "",
  managementEmailFeedback: "",
  bankerFollowUpFeedback: "",
  emailSendToManagement: false,
  emailSendToBanker: false,
  emailSendToInternalTeam: false,
  emailSendToDealCaptain: false,
  emailIncludeInEmail: false,
  emailIncludeOneLineSummary: false,
  emailIncludeExecutiveSummary: false,
  emailIncludeMeetingNotes: false,
  emailIncludeKeyLevels: false,
  emailIncludeDealSize: false,
  emailIncludeFollowUpQuestion: false,
  ipoLockupExpiryAutomate: false,
  ipoLockupExpiryEmailTwoWeeks: false,
  ipoLockupExpiryEmailOnDay: false,
  lastDealLockupExpiryAutomate: false,
  lastDealLockupExpiryEmailTwoWeeks: false,
  lastDealLockupExpiryEmailOnDay: false,
  resultsAutomate: false,
  resultsEmailTwoWeeks: false,
  resultsEmailOnDay: false,
  opportunisticDealEmailOnTrigger: false,
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
  const [currentMeetingKey, setCurrentMeetingKey] = useState<string>("meeting1");
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [noDataFound, setNoDataFound] = useState(false);
  const shouldShowEmptyState = noDataFound && meetings.length === 0;
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

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
        ticker: (overview?.ticker || record?.ticker || selectedDeal?.ticker || "").toUpperCase(),
        name: overview?.name || "",
        date: overview?.date || record?.pricing_date || selectedDeal?.pricingDate || "",
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
        managementEmailFeedback: overview?.management_email_follow_up_feedback || "",
        bankerFollowUpFeedback: overview?.banker_email_follow_up_call_feedback || "",
        emailSendToManagement: toBool(overview?.email_send_to_management),
        emailSendToBanker: toBool(overview?.email_send_to_banker),
        emailSendToInternalTeam: toBool(overview?.email_send_to_internal_team),
        emailSendToDealCaptain: toBool(overview?.email_send_to_deal_captain),
        emailIncludeInEmail: toBool(overview?.email_include_in_email),
        emailIncludeOneLineSummary: toBool(overview?.email_include_one_line_summary),
        emailIncludeExecutiveSummary: toBool(overview?.email_include_executive_summary),
        emailIncludeMeetingNotes: toBool(overview?.email_include_meeting_notes),
        emailIncludeKeyLevels: toBool(overview?.email_include_key_levels),
        emailIncludeDealSize: toBool(overview?.email_include_deal_size),
        emailIncludeFollowUpQuestion: toBool(overview?.email_include_follow_up_question),
        ipoLockupExpiryAutomate: toBool(overview?.ipo_lockup_expiry_automate),
        ipoLockupExpiryEmailTwoWeeks: toBool(overview?.ipo_lockup_expiry_email_two_weeks),
        ipoLockupExpiryEmailOnDay: toBool(overview?.ipo_lockup_expiry_email_on_day),
        lastDealLockupExpiryAutomate: toBool(overview?.last_deal_lockup_expiry_automate),
        lastDealLockupExpiryEmailTwoWeeks: toBool(
          overview?.last_deal_lockup_expiry_email_two_weeks
        ),
        lastDealLockupExpiryEmailOnDay: toBool(
          overview?.last_deal_lockup_expiry_email_on_day
        ),
        resultsAutomate: toBool(overview?.results_automate),
        resultsEmailTwoWeeks: toBool(overview?.results_email_two_weeks),
        resultsEmailOnDay: toBool(overview?.results_email_on_day),
        opportunisticDealEmailOnTrigger: toBool(overview?.opportunistic_deal_email_on_trigger),
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
          setCurrentMeetingKey("meeting1");
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

    if (!meetingOverview.name.trim()) {
      setStatus({ kind: "error", message: "Meeting name is required." });
      return;
    }

    if (!meetingOverview.date.trim()) {
      setStatus({ kind: "error", message: "Meeting date is required." });
      return;
    }

    if (!pricingDate) {
      setStatus({ kind: "error", message: "Pricing date is required (from search selection)." });
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
      management_email_follow_up_feedback: capitalStructure.managementEmailFeedback,
      banker_email_follow_up_call_feedback: capitalStructure.bankerFollowUpFeedback,
      email_send_to_management: capitalStructure.emailSendToManagement,
      email_send_to_banker: capitalStructure.emailSendToBanker,
      email_send_to_internal_team: capitalStructure.emailSendToInternalTeam,
      email_send_to_deal_captain: capitalStructure.emailSendToDealCaptain,
      email_include_in_email: capitalStructure.emailIncludeInEmail,
      email_include_one_line_summary: capitalStructure.emailIncludeOneLineSummary,
      email_include_executive_summary: capitalStructure.emailIncludeExecutiveSummary,
      email_include_meeting_notes: capitalStructure.emailIncludeMeetingNotes,
      email_include_key_levels: capitalStructure.emailIncludeKeyLevels,
      email_include_deal_size: capitalStructure.emailIncludeDealSize,
      email_include_follow_up_question: capitalStructure.emailIncludeFollowUpQuestion,
      email_recipients: capitalStructure.emailRecipients,
      ipo_lockup_expiry_automate: capitalStructure.ipoLockupExpiryAutomate,
      ipo_lockup_expiry_email_two_weeks: capitalStructure.ipoLockupExpiryEmailTwoWeeks,
      ipo_lockup_expiry_email_on_day: capitalStructure.ipoLockupExpiryEmailOnDay,
      last_deal_lockup_expiry_automate: capitalStructure.lastDealLockupExpiryAutomate,
      last_deal_lockup_expiry_email_two_weeks:
        capitalStructure.lastDealLockupExpiryEmailTwoWeeks,
      last_deal_lockup_expiry_email_on_day: capitalStructure.lastDealLockupExpiryEmailOnDay,
      results_automate: capitalStructure.resultsAutomate,
      results_email_two_weeks: capitalStructure.resultsEmailTwoWeeks,
      results_email_on_day: capitalStructure.resultsEmailOnDay,
      opportunistic_deal_email_on_trigger: capitalStructure.opportunisticDealEmailOnTrigger,
    };

    const payload: any = {
      ticker: normalizedTicker,
      fs_ticker: selectedDeal?.fsTicker ?? null,
      pricing_date: pricingDate,
      deal_id: selectedDeal?.dealId ?? null,
      sector: selectedDeal?.sector ?? null,
      region: selectedDeal?.region ?? null,
      deal_type: selectedDeal?.dealType ?? null,
      fo_type: selectedDeal?.foType ?? null,
      ipo_type: selectedDeal?.ipoType ?? null,
      issuer_name: selectedDeal?.issuerName ?? meetingOverview.name ?? null,
      deal_captain: selectedDeal?.dealCaptain ?? null,
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
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 999,
          border: "1px solid #d8deef",
          backgroundColor: "rgba(0,32,96,0.06)",
          "@keyframes slideIn": {
            from: { opacity: 0, transform: "translateY(-6px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          animation: "slideIn 0.3s ease",
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

export default MeetingDealNoteCreate;
