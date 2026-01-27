import React, { useMemo, useState } from "react";
import { Alert, Paper, Stack, Typography } from "@mui/material";
import MeetingNoteForm from "./MeetingNoteForm";
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

const UnlistedDealMeetingNotesMain: React.FC = () => {
  const sampleMeetingOverview = useMemo<MeetingOverview>(
    () => ({
      ...initialMeetingOverview,
      ticker: "UNLS",
      name: "Unlisted Strategy Session",
      date: "2026-01-14",
      location: "New York, NY",
      reason: "Pre-IPO investor update and capital planning",
      broker: "Midas Capital",
      attendees: "CEO, CFO, Head of Strategy",
      bankerAttendees: "Lead Banker, Associate",
    }),
    []
  );

  const sampleInvestmentSnapshot = useMemo<InvestmentSnapshot>(
    () => ({
      ...initialInvestmentSnapshot,
      oneLineSummary: "Leader in vertical SaaS with recurring revenue growth.",
      executiveSummary:
        "Management focused on pricing expansion and mid-market penetration while maintaining 85%+ gross margins.",
      keyLevel: "Support at 24.50, resistance at 31.00",
      possibleSize: "$150M to $200M primary",
      results: "Diligence materials to be shared within two weeks.",
    }),
    []
  );

  const sampleBusinessStrategy = useMemo<BusinessStrategy>(
    () => ({
      ...initialBusinessStrategy,
      meetingNotes:
        "Discussed go-to-market acceleration and potential secondary liquidity for early investors.",
      catalysts: "Upcoming product launch in Q2 and enterprise partnerships.",
      likelihoodPrimaryRaise: "Medium",
      reasonForRaise: "Fund international expansion and strategic hires.",
      opportunisticDeal: "Selective block trade if valuation improves.",
    }),
    []
  );

  const sampleCapitalStructure = useMemo<CapitalStructure>(
    () => ({
      ...initialCapitalStructure,
      potentialSellers: "Early VC funds and a founder liquidity program.",
      ipoLockupExpiry: "2026-10-15",
      lastDealLockupExpiry: "2025-08-01",
      historicalSellers: "Seed investors partially exited in 2024.",
      followUpQuestions: "Clarify secondary allocation mechanics and timing.",
      attachments: [],
      keyValueAmount: "25",
      keyValueComparator: "greater",
      keyValueAutomate: true,
      emailRecipients: "coverage@midas.com; syndicate@midas.com",
      ipoLockupExpiryAutomate: false,
      lastDealLockupExpiryAutomate: false,
      resultsAutomate: false,
    }),
    []
  );

  const [meetingOverview, setMeetingOverview] = useState(sampleMeetingOverview);
  const [investmentSnapshot, setInvestmentSnapshot] = useState(sampleInvestmentSnapshot);
  const [businessStrategy, setBusinessStrategy] = useState(sampleBusinessStrategy);
  const [capitalStructure, setCapitalStructure] = useState(sampleCapitalStructure);

  return (
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
          Unlisted Meeting Notes (Sample Data)
        </Typography>
        <Alert severity="info">
          Sample data is shown for unlisted deals. Hook the unlisted APIs when ready.
        </Alert>
        <MeetingNoteForm
          meetingOverview={meetingOverview}
          setMeetingOverview={setMeetingOverview}
          investmentSnapshot={investmentSnapshot}
          setInvestmentSnapshot={setInvestmentSnapshot}
          businessStrategy={businessStrategy}
          setBusinessStrategy={setBusinessStrategy}
          capitalStructure={capitalStructure}
          setCapitalStructure={setCapitalStructure}
          isEditing={false}
        />
      </Stack>
    </Paper>
  );
};

export default UnlistedDealMeetingNotesMain;
