import React, { useMemo } from "react";
import { Paper, Typography } from "@mui/material";
import MeetingDealNoteCreate from "../Main/DealMeetingNotes/MeetingDealNoteCreate";
import type { DealSearchResult } from "../Main/DealMeetingNotes/DealMeetingNotesMain";

type NewDashboardLifeCycleMeetingNotesProps = {
  ticker?: string | null;
  pricingDate?: string | null;
};

const NewDashboardLifeCycleMeetingNotes: React.FC<
  NewDashboardLifeCycleMeetingNotesProps
> = ({ ticker, pricingDate }) => {
  const selectedDeal = useMemo<DealSearchResult | null>(() => {
    if (!ticker || !pricingDate) return null;
    return {
      ticker,
      pricingDate,
    };
  }, [ticker, pricingDate]);

  if (!selectedDeal) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: "center",
          borderRadius: 3,
          border: "1px dashed rgba(0,32,96,0.35)",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography fontWeight={700} color="#002060">
          Ticker and pricing date are required to view meeting notes.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "rgba(0,32,96,0.05)",
        border: "1px solid rgba(0,32,96,0.12)",
      }}
    >
      <MeetingDealNoteCreate selectedDeal={selectedDeal} />
    </Paper>
  );
};

export default NewDashboardLifeCycleMeetingNotes;
