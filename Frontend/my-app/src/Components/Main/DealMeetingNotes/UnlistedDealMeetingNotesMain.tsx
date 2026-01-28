import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import UnlistedMeetingSearch from "./UnlistedMeetingSearch";
import type { UnlistedMeetingSearchOptionData } from "./UnlistedMeetingSearchOption";
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
import { LabeledTextField } from "./MeetingNoteFormFields";

type Status =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

type FormState = {
  meetingOverview: MeetingOverview;
  investmentSnapshot: InvestmentSnapshot;
  businessStrategy: BusinessStrategy;
  capitalStructure: CapitalStructure;
  sectionNotes: SectionNotes;
};

type MeetingEntry = {
  id?: number | string;
  meetingKey: string;
  form: FormState;
  isNew?: boolean;
};

type SectionNotes = {
  companyBackground: string;
  divisions: string;
  otherLines: string;
  organization: string;
  verticalIntegration: string;
  strategicApproach: string;
  marketPosition: string;
  financialPerformance: string;
  internationalExpansionPlans: string;
  growthStrategy: string;
  hongKongListingRationale: string;
  leadership: string;
};

const UnlistedDealMeetingNotesMain: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = useMemo(() => localStorage.getItem("access_token"), []);

  const [companyNameInput, setCompanyNameInput] = useState("");
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [meetingOverview, setMeetingOverview] = useState<MeetingOverview>(initialMeetingOverview);
  const [investmentSnapshot, setInvestmentSnapshot] = useState<InvestmentSnapshot>(
    initialInvestmentSnapshot
  );
  const [businessStrategy, setBusinessStrategy] = useState<BusinessStrategy>(initialBusinessStrategy);
  const [capitalStructure, setCapitalStructure] = useState<CapitalStructure>(initialCapitalStructure);
  const [sectionNotes, setSectionNotes] = useState<SectionNotes>({
    companyBackground: "",
    divisions: "",
    otherLines: "",
    organization: "",
    verticalIntegration: "",
    strategicApproach: "",
    marketPosition: "",
    financialPerformance: "",
    internationalExpansionPlans: "",
    growthStrategy: "",
    hongKongListingRationale: "",
    leadership: "",
  });
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
  const headingConfig: Array<{ key: keyof SectionNotes; label: string }> = [
    { key: "companyBackground", label: "Company Background" },
    { key: "divisions", label: "Divisions" },
    { key: "otherLines", label: "Other Lines" },
    { key: "organization", label: "Organization" },
    { key: "verticalIntegration", label: "Vertical Integration" },
    { key: "strategicApproach", label: "Strategic Approach" },
    { key: "marketPosition", label: "Market Position" },
    { key: "financialPerformance", label: "Financial Performance" },
    { key: "internationalExpansionPlans", label: "International Expansion Plans" },
    { key: "growthStrategy", label: "Growth Strategy" },
    { key: "hongKongListingRationale", label: "Hong Kong Listing Rationale" },
    { key: "leadership", label: "Leadership" },
  ];

  const buildMeetingNotes = (sections: SectionNotes) => {
    const chunks = headingConfig
      .map(({ key, label }) => {
        const value = sections[key].trim();
        if (!value) return "";
        return `${label}:\n${value}`;
      })
      .filter(Boolean);
    return chunks.join("\n\n");
  };

  const parseMeetingNotes = (text: string): SectionNotes => {
    const normalized = (text || "").replace(/\r\n/g, "\n");
    const empty: SectionNotes = {
      companyBackground: "",
      divisions: "",
      otherLines: "",
      organization: "",
      verticalIntegration: "",
      strategicApproach: "",
      marketPosition: "",
      financialPerformance: "",
      internationalExpansionPlans: "",
      growthStrategy: "",
      hongKongListingRationale: "",
      leadership: "",
    };

    const matches = headingConfig
      .map(({ label, key }) => {
        const regex = new RegExp(`(^|\\n)\\s*${label}\\s*:?\\s*`, "i");
        const match = regex.exec(normalized);
        return match
          ? {
              key,
              start: match.index + (match[1]?.length ?? 0),
              end: match.index + match[0].length,
            }
          : null;
      })
      .filter(Boolean) as Array<{
      key: keyof SectionNotes;
      start: number;
      end: number;
    }>;

    if (matches.length === 0) {
      return {
        ...empty,
        companyBackground: normalized.trim(),
      };
    }

    const sorted = [...matches].sort((a, b) => a.start - b.start);
    const result = { ...empty };
    sorted.forEach((item, idx) => {
      const next = sorted[idx + 1];
      const sliceEnd = next ? next.start : normalized.length;
      const value = normalized.slice(item.end, sliceEnd).trim();
      result[item.key] = value;
    });

    return result;
  };

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
    setSectionNotes(entry.form.sectionNotes);
    if (entry.form.meetingOverview.companyName) {
      setSelectedCompanyName(entry.form.meetingOverview.companyName);
    }
    setCurrentMeetingId(entry.id ?? null);
    setCurrentMeetingKey(entry.meetingKey);
    setIsEditing(false);
    setBackupState(null);
    setHasUnsavedChanges(false);
  };
  const emptySectionNotes: SectionNotes = {
    companyBackground: "",
    divisions: "",
    otherLines: "",
    organization: "",
    verticalIntegration: "",
    strategicApproach: "",
    marketPosition: "",
    financialPerformance: "",
    internationalExpansionPlans: "",
    growthStrategy: "",
    hongKongListingRationale: "",
    leadership: "",
  };

  const buildMeetingFromOverview = (overview: any, record: any): MeetingEntry => {
    const metaOverview = overview?.meeting_overview || overview?.meetingOverview || {};
    const metaInvestment = overview?.investment_snapshot || overview?.investmentSnapshot || {};
    const metaBusiness = overview?.business_strategy || overview?.businessStrategy || {};
    const metaCapital = overview?.capital_structure || overview?.capitalStructure || {};
    const metaSection = overview?.section_notes || {};
    const attendeesValue = metaOverview?.attendees ?? overview?.attendees;
    const meetingNotesText = metaBusiness?.meeting_notes || overview?.meeting_notes || "";
    const parsedSectionNotes =
      Object.keys(metaSection || {}).length > 0
        ? { ...emptySectionNotes, ...metaSection }
        : parseMeetingNotes(meetingNotesText);

    return {
      id: record?.id ?? record?.pk ?? null,
      meetingKey: overview?.__key ?? "meeting1",
      form: {
        meetingOverview: {
          ticker: (metaOverview?.ticker || record?.ticker || overview?.ticker || "").toUpperCase(),
          companyName:
            metaOverview?.company_name ||
            record?.company_name ||
            overview?.company_name ||
            overview?.name ||
            "",
          name: metaOverview?.meeting_name || overview?.name || "",
          date:
            metaOverview?.pricing_date ||
            overview?.date ||
            record?.pricing_date ||
            "",
          location: metaOverview?.location || overview?.location || "",
          reason: metaOverview?.reason || overview?.reason || "",
          broker: metaOverview?.broker || overview?.broker || "",
          attendees: formatAttendeeGroup(attendeesValue, "management"),
          bankerAttendees: formatAttendeeGroup(attendeesValue, "banker"),
        },
        investmentSnapshot: {
          oneLineSummary: metaInvestment?.one_line_summary || overview?.one_line_summary || "",
          executiveSummary:
            metaInvestment?.executive_summary || overview?.executive_summary || "",
          keyLevel: metaInvestment?.key_level || overview?.key_level || "",
          possibleSize: metaInvestment?.possible_size || overview?.possible_size || "",
          results: metaInvestment?.results || overview?.results || "",
        },
        businessStrategy: {
          meetingNotes: metaBusiness?.meeting_notes || overview?.meeting_notes || "",
          catalysts: metaBusiness?.catalysts || overview?.catalyst || "",
          likelihoodPrimaryRaise:
            metaBusiness?.likelihood_of_primary_raise ||
            overview?.likelihood_of_primary_raise ||
            "",
          reasonForRaise: metaBusiness?.likelihood_reason || overview?.likelihood_reason || "",
          opportunisticDeal:
            metaBusiness?.possible_opportunistic_deal ||
            overview?.possible_opportunistic_deal ||
            "",
        },
        sectionNotes: parsedSectionNotes,
        capitalStructure: {
          potentialSellers: metaCapital?.potential_sellers || overview?.potential_sellers || "",
          ipoLockupExpiry: metaCapital?.ipo_lockup_expiry || overview?.ipo_lockup_expiry || "",
          lastDealLockupExpiry:
            metaCapital?.last_deal_lockup_expiry ||
            overview?.last_deal_lockup_expiry ||
            "",
          historicalSellers: metaCapital?.historical_sellers || overview?.historical_sellers || "",
          followUpQuestions:
            metaCapital?.follow_up_question_for_management ||
            overview?.follow_up_question_for_management ||
            "",
          attachments: [],
          keyValueAmount: metaCapital?.key_value_amount || overview?.key_value_amount || "",
          keyValueComparator:
            metaCapital?.key_value_comparator || overview?.key_value_comparator || "greater",
          keyValueAutomate: toBool(
            metaCapital?.key_value_automate ?? overview?.key_value_automate
          ),
          emailRecipients: metaCapital?.email_recipients || overview?.email_recipients || "",
          ipoLockupExpiryAutomate: toBool(
            metaCapital?.ipo_lockup_expiry_automate ?? overview?.ipo_lockup_expiry_automate
          ),
          lastDealLockupExpiryAutomate: toBool(
            metaCapital?.last_deal_lockup_expiry_automate ??
              overview?.last_deal_lockup_expiry_automate
          ),
          resultsAutomate: toBool(
            metaCapital?.results_automate ?? overview?.results_automate
          ),
        },
      },
      isNew: false,
    };
  };

  const normalizeRecordToMeetings = (record: any): MeetingEntry[] => {
    const meta = record?.meta_data || record?.description || {};
    const meetingEntries = Object.entries(meta).filter(([key]) =>
      key.toLowerCase().startsWith("meeting")
    );

    if (meetingEntries.length === 0) {
      if (Object.keys(meta || {}).length > 0) {
        return [buildMeetingFromOverview(meta, record)];
      }
      return [buildMeetingFromOverview({}, record)];
    }

    return meetingEntries.map(([key, overview]) =>
      buildMeetingFromOverview({ ...(overview as any), __key: key }, record)
    );
  };

  const createNewMeetingFromTemplate = (resetExisting = false, companyOverride?: string) => {
    const meetingKey = getNextMeetingKey();
    const normalizedCompany = (companyOverride || selectedCompanyName || companyNameInput).trim();
    const templateMeeting: MeetingEntry = {
      meetingKey,
      form: {
        meetingOverview: {
          ...initialMeetingOverview,
          companyName: normalizedCompany,
          date: "",
        },
        investmentSnapshot: initialInvestmentSnapshot,
        businessStrategy: initialBusinessStrategy,
        capitalStructure: initialCapitalStructure,
        sectionNotes: {
          companyBackground: "",
          divisions: "",
          otherLines: "",
          organization: "",
          verticalIntegration: "",
          strategicApproach: "",
          marketPosition: "",
          financialPerformance: "",
          internationalExpansionPlans: "",
          growthStrategy: "",
          hongKongListingRationale: "",
          leadership: "",
        },
      },
      isNew: true,
    };
    const updated = resetExisting ? [templateMeeting] : [...meetings, templateMeeting];
    setMeetings(updated);
    setSelectedMeetingIndex(updated.length - 1);
    setMeetingOverview(templateMeeting.form.meetingOverview);
    setInvestmentSnapshot(templateMeeting.form.investmentSnapshot);
    setBusinessStrategy(templateMeeting.form.businessStrategy);
    setCapitalStructure(templateMeeting.form.capitalStructure);
    setSectionNotes(templateMeeting.form.sectionNotes);
    setCurrentMeetingId(null);
    setCurrentMeetingKey(meetingKey);
    setIsEditing(true);
    setNoDataFound(false);
    setSelectedCompanyName(normalizedCompany);
  };

  const startEdit = () => {
    setBackupState({
      meetingOverview,
      investmentSnapshot,
      businessStrategy,
      capitalStructure,
      sectionNotes,
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
      setSectionNotes(backupState.sectionNotes);
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
    setSectionNotes({
      companyBackground: "",
      divisions: "",
      otherLines: "",
      organization: "",
      verticalIntegration: "",
      strategicApproach: "",
      marketPosition: "",
      financialPerformance: "",
      internationalExpansionPlans: "",
      growthStrategy: "",
      hongKongListingRationale: "",
      leadership: "",
    });
    setCurrentMeetingKey("meeting1");
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    if (!isEditing || !backupState) return;
    const isChanged =
      JSON.stringify(backupState.meetingOverview) !== JSON.stringify(meetingOverview) ||
      JSON.stringify(backupState.investmentSnapshot) !== JSON.stringify(investmentSnapshot) ||
      JSON.stringify(backupState.businessStrategy) !== JSON.stringify(businessStrategy) ||
      JSON.stringify(backupState.capitalStructure) !== JSON.stringify(capitalStructure) ||
      JSON.stringify(backupState.sectionNotes) !== JSON.stringify(sectionNotes);
    setHasUnsavedChanges(isChanged);
  }, [
    isEditing,
    backupState,
    meetingOverview,
    investmentSnapshot,
    businessStrategy,
    capitalStructure,
    sectionNotes,
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

  const loadNotesByCompany = async (companyOverride?: string) => {
    if (!apiUrl) {
      setStatus({ kind: "error", message: "REACT_APP_API_URL is not set." });
      return;
    }

    const companyName = (companyOverride ?? selectedCompanyName).trim();
    if (!companyName) {
      setStatus({ kind: "error", message: "Company name is required." });
      return;
    }

    try {
      setLoadingMeetings(true);
      setStatus(null);
      setNoDataFound(false);
      const response = await fetch(`${apiUrl}/api/unlisted_get_deal_meeting_by_company/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ company_name: companyName }),
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
        setSelectedCompanyName(companyName);
        return;
      }

      const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [data];
      const normalized = items.flatMap(normalizeRecordToMeetings);
      setMeetings(normalized);
      setSelectedMeetingIndex(0);
      if (normalized[0]) {
        applyMeetingToForm(normalized[0]);
      }
      setSelectedCompanyName(companyName);
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

    if (!meetingOverview.companyName.trim()) {
      setStatus({ kind: "error", message: "Company name is required." });
      return;
    }

    const meetingNotes = buildMeetingNotes(sectionNotes);
    const metaData = {
      meeting_overview: {
        ticker: meetingOverview.ticker,
        company_name: meetingOverview.companyName,
        meeting_name: meetingOverview.name,
        pricing_date: meetingOverview.date,
        location: meetingOverview.location,
        reason: meetingOverview.reason,
        broker: meetingOverview.broker,
        attendees: buildAttendeesPayload(
          meetingOverview.attendees,
          meetingOverview.bankerAttendees
        ),
      },
      investment_snapshot: {
        one_line_summary: investmentSnapshot.oneLineSummary,
        executive_summary: investmentSnapshot.executiveSummary,
        key_level: investmentSnapshot.keyLevel,
        possible_size: investmentSnapshot.possibleSize,
        results: investmentSnapshot.results,
      },
      business_strategy: {
        meeting_notes: meetingNotes,
        catalysts: businessStrategy.catalysts,
        likelihood_of_primary_raise: businessStrategy.likelihoodPrimaryRaise,
        likelihood_reason: businessStrategy.reasonForRaise,
        possible_opportunistic_deal: businessStrategy.opportunisticDeal,
      },
      capital_structure: {
        potential_sellers: capitalStructure.potentialSellers,
        ipo_lockup_expiry: capitalStructure.ipoLockupExpiry,
        last_deal_lockup_expiry: capitalStructure.lastDealLockupExpiry,
        historical_sellers: capitalStructure.historicalSellers,
        follow_up_question_for_management: capitalStructure.followUpQuestions,
        email_recipients: capitalStructure.emailRecipients,
        ipo_lockup_expiry_automate: capitalStructure.ipoLockupExpiryAutomate,
        last_deal_lockup_expiry_automate: capitalStructure.lastDealLockupExpiryAutomate,
        results_automate: capitalStructure.resultsAutomate,
      },
      section_notes: sectionNotes,
    };

    const payload: any = {
      company_name: meetingOverview.companyName.trim(),
      ticker: meetingOverview.ticker.trim() || null,
      pricing_date: meetingOverview.date.trim() || null,
      meta_data: {
        [currentMeetingKey]: metaData,
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
      await loadNotesByCompany(meetingOverview.companyName.trim());
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
        <UnlistedMeetingSearch
          apiUrl={apiUrl}
          token={token}
          onSelect={(value: UnlistedMeetingSearchOptionData) => {
            requestDiscardConfirm(() => {
              const nextCompany = value.name || "";
              setCompanyNameInput(nextCompany);
              setSelectedCompanyName(nextCompany);
              setMeetingOverview((prev) => ({
                ...prev,
                companyName: nextCompany || prev.companyName,
              }));
              setMeetings([]);
              setSelectedMeetingIndex(0);
              setCurrentMeetingId(null);
              setCurrentMeetingKey("meeting1");
              loadNotesByCompany(nextCompany);
            });
          }}
          onCreate={() =>
            requestDiscardConfirm(() => {
              const normalizedCompany = companyNameInput.trim();
              setSelectedCompanyName(normalizedCompany);
              createNewMeetingFromTemplate(true, normalizedCompany);
            })
          }
          onInputChange={(value) => {
            setCompanyNameInput(value);
          }}
        />
      </Paper>

      {selectedCompanyName ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 2,
            border: "1px solid rgba(0,32,96,0.12)",
            backgroundColor: "#fff",
          }}
        >
          <Typography sx={{ color: "#002060", fontWeight: 700 }}>
            {selectedCompanyName}
          </Typography>
        </Paper>
      ) : null}

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
                        sectionNotes: {
                          companyBackground: "",
                          divisions: "",
                          otherLines: "",
                          organization: "",
                          verticalIntegration: "",
                          strategicApproach: "",
                          marketPosition: "",
                          financialPerformance: "",
                          internationalExpansionPlans: "",
                          growthStrategy: "",
                          hongKongListingRationale: "",
                          leadership: "",
                        },
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
        onCreateNew={() => {
          const normalizedCompany = (selectedCompanyName || companyNameInput).trim();
          setSelectedCompanyName(normalizedCompany);
          createNewMeetingFromTemplate(true, normalizedCompany);
        }}
      />

      {!loadingMeetings && !shouldShowEmptyState ? (
        <>
          {status ? (
            <Alert severity={status.kind} onClose={() => setStatus(null)}>
              {status.message}
            </Alert>
          ) : null}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: "1px solid rgba(0,32,96,0.12)",
              backgroundColor: "#fff",
            }}
          >
            <Stack spacing={2}>
              <Typography sx={{ color: "#002060", fontWeight: 700 }}>
                Meeting Notes Form
              </Typography>
              <LabeledTextField
                label="Meeting Name"
                value={meetingOverview.name}
                onChange={(val) => setMeetingOverview((prev) => ({ ...prev, name: val }))}
                isEditing={isEditing}
              />
              <LabeledTextField
                label="Meeting Date"
                value={meetingOverview.date}
                onChange={(val) => setMeetingOverview((prev) => ({ ...prev, date: val }))}
                isEditing={isEditing}
                options={{ type: "date" }}
              />
              <LabeledTextField
                label="Attending"
                value={meetingOverview.attendees}
                onChange={(val) => setMeetingOverview((prev) => ({ ...prev, attendees: val }))}
                isEditing={isEditing}
              />
              <LabeledTextField
                label="Company Background"
                value={sectionNotes.companyBackground}
                onChange={(val) =>
                  setSectionNotes((prev) => ({ ...prev, companyBackground: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Divisions"
                value={sectionNotes.divisions}
                onChange={(val) => setSectionNotes((prev) => ({ ...prev, divisions: val }))}
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Other Lines"
                value={sectionNotes.otherLines}
                onChange={(val) => setSectionNotes((prev) => ({ ...prev, otherLines: val }))}
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Organization"
                value={sectionNotes.organization}
                onChange={(val) =>
                  setSectionNotes((prev) => ({ ...prev, organization: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Vertical Integration"
                value={sectionNotes.verticalIntegration}
                onChange={(val) =>
                  setSectionNotes((prev) => ({ ...prev, verticalIntegration: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Strategic Approach"
                value={sectionNotes.strategicApproach}
                onChange={(val) =>
                  setSectionNotes((prev) => ({ ...prev, strategicApproach: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Market Position"
                value={sectionNotes.marketPosition}
                onChange={(val) =>
                  setSectionNotes((prev) => ({ ...prev, marketPosition: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Financial Performance"
                value={sectionNotes.financialPerformance}
                onChange={(val) =>
                  setSectionNotes((prev) => ({ ...prev, financialPerformance: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="International Expansion Plans"
                value={sectionNotes.internationalExpansionPlans}
                onChange={(val) =>
                  setSectionNotes((prev) => ({
                    ...prev,
                    internationalExpansionPlans: val,
                  }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Growth Strategy"
                value={sectionNotes.growthStrategy}
                onChange={(val) =>
                  setSectionNotes((prev) => ({ ...prev, growthStrategy: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Hong Kong Listing Rationale"
                value={sectionNotes.hongKongListingRationale}
                onChange={(val) =>
                  setSectionNotes((prev) => ({ ...prev, hongKongListingRationale: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Leadership"
                value={sectionNotes.leadership}
                onChange={(val) => setSectionNotes((prev) => ({ ...prev, leadership: val }))}
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="To Do"
                value={investmentSnapshot.results}
                onChange={(val) =>
                  setInvestmentSnapshot((prev) => ({ ...prev, results: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Follow Up Questions"
                value={capitalStructure.followUpQuestions}
                onChange={(val) =>
                  setCapitalStructure((prev) => ({ ...prev, followUpQuestions: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
            </Stack>
          </Paper>
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
