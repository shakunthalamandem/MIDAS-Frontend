import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
};

type MeetingEntry = {
  id?: number | string;
  meetingKey: string;
  form: FormState;
  isNew?: boolean;
};

type SearchOption = {
  ticker: string;
  pricingDate?: string;
  name?: string;
  dealType?: string;
  dealId?: string | number;
  id?: number | string;
};

const UnlistedDealMeetingNotesMain: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = useMemo(() => localStorage.getItem("access_token"), []);

  const [tickerInput, setTickerInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<SearchOption | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
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

  const defaultMeetingNotes = [
    "Dtech A/H IPO candidate TTW meeting with HSBC....",
    "",
    "Attending:",
    "- Cynthia Chen (Chairlady)",
    "- Jessie Lian (CEO)",
    "- Olivia Chen (PR Senior Manager)",
    "- Joy Jiang (IR Manager)",
    "",
    "- Li Wang (HSBC MD)",
    "",
    "Summary:",
    "- Best in class fully vertically integrated precision manufacturer, aiming for A/H listing in H1 2026",
    "- H1 2025 revenue up 27% YoY with gross margin expanding to >40% (from historical 30%+) and ROE at 12.4%",
    "- Revenue growth driven by AI server demand and market-share gains in PCB drilling bits. No 1 globally with 29% mkt share >120M units/month.",
    "- Vertical integration powers cost advantage. 95% of production equipment built in-house (at 30% the cost of imported alternatives)",
    "- This enables faster capacity expansion than competitors and recent capex investments have just one-year payback",
    "- International revenue growth has huge potential, up from 1.4% in 2022, to 8.8% H1 2025",
    "- Thailand facility now does 40M units/month capacity",
    "- German acquisition (MPK Camera, 2025) added high end technology and helped penetrate European market",
    "- Hong Kong listing will accelerate overseas expansion, M&A and global talent incentives",
    "- Automation roadmap targets one-third headcount reduction by 2027-2028, positioning the company for projected 2029-2030 industry downturn",
    "",
    "Full meeting notes....",
    "Company Background:",
    "- 30 years in PCB and advanced manufacturing, first branch opened in 2002",
    "- Went public in 2022, accelerating international expansion",
    "- Expanded into Grinding and polishing, functional film and Intelligent Equipment",
    "",
    "Divisions:",
    "- PCB Drilling Bits (Primary Revenue Driver)",
    "- Global market leader with 29% market share, expected to exceed 30% in 2025",
    "- Produces over 120 million geodes monthly",
    "- Covers 70%+ of top 100 PCB manufacturers globally, including 9 of top 10",
    "- High demand from AI server manufacturing requiring longer, more resilient bits for harder boards",
    "",
    "Other Lines:",
    "- Functional films for automotive, new energy vehicles, glass surfaces, and touch controls",
    "- Polishing/grinding materials with 70% gross margins, including non-woven and ceramic-based grinding wheels",
    "- CNC and smart equipment, recently launching intelligent drill bit storage systems, laser drilling machines, and coating equipment",
    "- Industry-leading intelligent drill geode storage system strengthens customer stickiness",
    "",
    "Organization:",
    "- 4,000 employees including 400+ technical engineers and R&D personnel",
    "- Headcount elevated due to capacity expansion phase",
    "- Expected significant reduction by 2027-2028 through automation and intelligent manufacturing",
    "- Multiple independent business units with separate financial accounting and incentive mechanisms",
    "- Core culture: no product operates at a loss or without growth; aim for top-three position in every category entered, many targeting number-one",
    "",
    "Vertical Integration:",
    "- Identified equipment manufacturing as bottleneck when entering PCB drilling bit market in 2005-2006",
    "- Built production equipment in-house due to limited capital",
    "- Current equipment precision and efficiency exceed imported standards at 30% of cost",
    "- Produces approximately 30 units monthly versus Swiss competitor's 100 units annually",
    "- Achieved global number-one position by 2020, surpassing Japanese competitors with 40-60 years of production history",
    "- Maintained strong manufacturing capability during 2020 COVID disruptions when competitors faced supply issues",
    "- 95% of production equipment developed in-house; only 5% outsourced for general machine beds",
    "- Applied same strategy to grinding wheels",
    "- Partnered with 3M to develop non-woven fabric capabilities after identifying material sourcing as critical bottleneck",
    "- Now produces ceramic grinding wheels in-house, including ceramic powder and sintering processes",
    "",
    "Strategic Approach:",
    "- Philosophy: analyze supply chain to identify single critical bottleneck, then assess if company can control it",
    "- During downturns, competitors engage in price wars while company increases automation and jointly develops new high-margin products with customers",
    "- Only three companies can provide volume, cost-efficient products for demanding AI server specs: DTEC, Jinzhou (state-owned with limited expansion capability), and Union Tool Japan (limited capacity expansion speed)",
    "- DTEC best positioned to capture growth due to equipment manufacturing capability and private company flexibility",
    "",
    "Market Position:",
    "- PCB industry consolidating; top 5 players account for 75%+ of geode market",
    "- In 2023 downturn, domestic competitors declined 20% while Dtech grew 20%!",
    "- Competitors cannot match capacity expansion speed; company captures majority of industry growth",
    "",
    "Financial Performance:",
    "- Revenue CAGR 2022-2024: approximately 40%",
    "- H1 2025 YoY growth accelerating: 27%, driven by AI server boom and market share gains",
    "- Gross margins historically above 30%, expected to exceed 40% in 2025",
    "- ROE currently 12.4% for H1 2025 (up from approximately 9% in 2023)",
    "- Recent capex (2026-2027) can achieve payback within one year at latest pricing!",
    "- Company doesn't publicly market strong ROE to avoid concerning customers",
    "",
    "International Expansion Plans:",
    "- Thailand facility produces approximately 40 million units monthly",
    "- Overseas revenue increased from 1.4% in 2022 to 8.8% in H1 2025",
    "- Expansion helps avoid tariffs",
    "- Acquired German company MPK Camera in 2025, gaining leading technology, distribution, clients, and brand for high-end European market",
    "- Established technology center in Germany",
    "- Major customers across Europe, Korea, Japan, Thailand, Vietnam, and Malaysia",
    "",
    "Growth Strategy:",
    "- Deepen portfolio across tools, materials, and equipment",
    "- Invest in talent, technology innovation, selective acquisitions, and global expansion",
    "- Expand domestic and overseas capacity",
    "- Prepare for potential 2029-2030 downturn by maintaining high margins on high-end products while reducing human cost by one-third on standard products through automation",
    "",
    "Hong Kong Listing Rationale:",
    "- Provides global capital markets access for international expansion and acquisitions, enabling quick fundraising when opportunities arise",
    "- Attracts high-quality international shareholders to improve governance",
    "- Enables stock equity incentives for global talent (not available through domestic A-share listing)",
    "",
    "Leadership:",
    "- Jessie Wang started at age 16 in 1989 as production line worker - developed excellent company culture.",
    "- Advanced to team leader within one year, workshop director by ages 19-20",
    "- Transitioned to sales, learned Cantonese for circuit board industry work",
    "- Started trading company in 1997 with brother, operated for seven years before launching manufacturing factory in 2005",
    "- Brother provides technical expertise, complementing chairlady's marketing and business development strengths, excellent team.",
    "",
    "To do:",
    "- Peer fundamental analysis and comparisons in Midas",
    "- Feedback to HSBC",
    "- Timeline check",
    "- Email banker",
    "- Email management",
    "",
    "Follow up questions to Management:",
    "- Dividend payout ratio plan?",
    "- Acquisition focus, country or sector?",
    "- Key clients and concentration?",
    "- Recent pricing trends?",
  ].join("\n");

  const createDefaultMeeting = () => {
    const templateMeeting: MeetingEntry = {
      meetingKey: "meeting1",
      form: {
        meetingOverview: {
          ...initialMeetingOverview,
          ticker: "DTECH",
          name: "Dtech A/H IPO candidate TTW meeting with HSBC",
          date: "",
          location: "",
          reason: "",
          broker: "HSBC",
          attendees:
            "Cynthia Chen (Chairlady), Jessie Lian (CEO), Olivia Chen (PR Senior Manager), Joy Jiang (IR Manager)",
          bankerAttendees: "Li Wang (HSBC MD)",
        },
        investmentSnapshot: {
          ...initialInvestmentSnapshot,
          oneLineSummary:
            "Best in class fully vertically integrated precision manufacturer aiming for A/H listing in H1 2026.",
          executiveSummary:
            "H1 2025 revenue up 27% YoY with gross margin expanding to >40% and ROE at 12.4%.",
          results: "Peer fundamental analysis and comparisons in Midas\nFeedback to HSBC\nTimeline check\nEmail banker\nEmail management",
        },
        businessStrategy: {
          ...initialBusinessStrategy,
          meetingNotes: defaultMeetingNotes,
        },
        capitalStructure: {
          ...initialCapitalStructure,
          followUpQuestions:
            "Dividend payout ratio plan?\nAcquisition focus, country or sector?\nKey clients and concentration?\nRecent pricing trends?",
        },
      },
      isNew: true,
    };

    setMeetings([templateMeeting]);
    setSelectedMeetingIndex(0);
    setCurrentMeetingId(null);
    setCurrentMeetingKey("meeting1");
    applyMeetingToForm(templateMeeting);
    setIsEditing(true);
    setNoDataFound(false);
    setTickerInput("DTECH");
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

  useEffect(() => {
    if (!apiUrl) {
      setSearchError("REACT_APP_API_URL is not configured.");
      return;
    }

    const term = searchTerm.trim();

    const controller = new AbortController();
    const handle = window.setTimeout(() => {
      const fetchResults = async () => {
        setSearching(true);
        setSearchError(null);

        try {
          const params = new URLSearchParams();
          if (term) {
            params.set("ticker", term);
            params.set("company_name", term);
          }
          const query = params.toString() ? `?${params.toString()}` : "";
          const response = await fetch(`${apiUrl}/api/get_unlisted_deal_meeting/${query}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            signal: controller.signal,
          });

          if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Request failed with status ${response.status}`);
          }

          const json = await response.json();
          if (json?.message) {
            setSearchResults([]);
            return;
          }

          const payload = Array.isArray(json)
            ? json
            : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.results)
            ? json.results
            : [];

          const normalized = (payload as any[])
            .map((item) => ({
              ticker: (item?.ticker || item?.symbol || item?.fs_ticker || "").toUpperCase(),
              pricingDate: item?.pricing_date || item?.pricingDate || item?.pricingdate || "",
              name: item?.company_name || item?.issuer_name || item?.name || "",
              dealType: item?.deal_type || "",
              dealId: item?.deal_id ?? null,
              id: item?.id ?? item?.pk ?? null,
            }))
            .filter((item) => item.ticker);

          setSearchResults(normalized);
        } catch (err: any) {
          if (err.name === "AbortError") return;
          console.error("Error fetching unlisted meetings:", err);
          setSearchError("Unable to fetch unlisted meetings. Please try again.");
        } finally {
          setSearching(false);
        }
      };

      fetchResults();
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [apiUrl, token, searchTerm]);

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

  const loadNotes = async (tickerOverride?: string, pricingOverride?: string) => {
    if (!apiUrl) {
      setStatus({ kind: "error", message: "REACT_APP_API_URL is not set." });
      return;
    }

    const ticker = (tickerOverride ?? tickerInput).trim();
    const pricingDate = (pricingOverride ?? "").trim();
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
    const pricingDate = meetingOverview.date.trim();

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
            <Autocomplete
              options={searchResults}
              value={selectedOption}
              inputValue={searchTerm}
              loading={searching}
              autoHighlight
              getOptionLabel={(option) => {
                const dateLabel = option.pricingDate ? ` (${option.pricingDate})` : "";
                return `${option.ticker}${dateLabel}`;
              }}
              isOptionEqualToValue={(option, value) =>
                option.ticker === value.ticker &&
                (option.pricingDate ?? "") === (value.pricingDate ?? "")
              }
              onInputChange={(_, value, reason) => {
                if (reason === "input" || reason === "clear") {
                  setSearchTerm(value || "");
                  setSearchResults([]);
                  setSearchError(null);
                }
              }}
              onChange={(_, value) => {
                setSelectedOption(value);
                if (!value) return;
                setSearchTerm(value.ticker);
                const nextTicker = value.ticker.toUpperCase();
                const nextPricingDate = value.pricingDate || "";
                requestDiscardConfirm(() => {
                  setTickerInput(nextTicker);
                  setMeetingOverview((prev) => ({
                    ...prev,
                    ticker: nextTicker,
                    name: value.name || prev.name,
                  }));
                  loadNotes(nextTicker, nextPricingDate);
                });
              }}
              renderOption={(props, option) => (
                <li {...props} key={`${option.ticker}-${option.pricingDate ?? "na"}`}>
                  <Box display="flex" flexDirection="column">
                    <Typography fontWeight={700} sx={{ color: "#002060" }}>
                      {option.ticker}
                      {option.pricingDate ? ` (${option.pricingDate})` : ""}
                    </Typography>
                    {option.name || option.dealType ? (
                      <Typography variant="caption" color="text.secondary">
                        {[option.name, option.dealType].filter(Boolean).join(" • ")}
                      </Typography>
                    ) : null}
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Search unlisted meeting notes"
                  placeholder="Type ticker or company..."
                  sx={{ minWidth: 320 }}
                />
              )}
            />
            <Button
              variant="contained"
              onClick={() => requestDiscardConfirm(createDefaultMeeting)}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 3,
                background: "linear-gradient(90deg, #0062ff 0%, #00c2a2 100%)",
              }}
            >
              Create
            </Button>
          </Box>
          {searchError ? (
            <Typography variant="caption" color="error">
              {searchError}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Search existing unlisted meetings, or click Create to start a new note.
            </Typography>
          )}
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
                label="Heading"
                value={meetingOverview.name}
                onChange={(val) => setMeetingOverview((prev) => ({ ...prev, name: val }))}
                isEditing={isEditing}
                options={{ required: true }}
              />
              <LabeledTextField
                label="Attending (Management)"
                value={meetingOverview.attendees}
                onChange={(val) => setMeetingOverview((prev) => ({ ...prev, attendees: val }))}
                isEditing={isEditing}
              />
              <LabeledTextField
                label="Attending (Bankers)"
                value={meetingOverview.bankerAttendees}
                onChange={(val) =>
                  setMeetingOverview((prev) => ({ ...prev, bankerAttendees: val }))
                }
                isEditing={isEditing}
              />
              <LabeledTextField
                label="Summary"
                value={investmentSnapshot.executiveSummary}
                onChange={(val) =>
                  setInvestmentSnapshot((prev) => ({ ...prev, executiveSummary: val }))
                }
                isEditing={isEditing}
                options={{ multiline: true }}
              />
              <LabeledTextField
                label="Full Meeting Notes"
                value={businessStrategy.meetingNotes}
                onChange={(val) =>
                  setBusinessStrategy((prev) => ({ ...prev, meetingNotes: val }))
                }
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
