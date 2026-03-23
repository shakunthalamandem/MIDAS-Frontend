import React, { useMemo } from "react";
import { Paper, Typography } from "@mui/material";
import MeetingDealNoteCreate from "../Main/DealMeetingNotes/MeetingDealNoteCreate";
import type { DealSearchResult } from "../Main/DealMeetingNotes/DealMeetingNotesMain";
import DashboardStateCard from "./DashboardStateCard";

type NewDashboardLifeCycleMeetingNotesProps = {
  ticker?: string | null;
  pricingDate?: string | null;
  dealType?: string | null;
};

const NewDashboardLifeCycleMeetingNotes: React.FC<
  NewDashboardLifeCycleMeetingNotesProps
> = ({ ticker, pricingDate, dealType }) => {
  const selectedDeal = useMemo<DealSearchResult | null>(() => {
    const requiresPricingDate = (dealType || "").toUpperCase() === "FO";
    if (!ticker || (requiresPricingDate && !pricingDate)) return null;
    return {
      ticker,
      pricingDate: pricingDate ?? undefined,
      dealType: dealType ?? undefined,
    };
  }, [ticker, pricingDate, dealType]);

  if (!selectedDeal) {
    return (
      <DashboardStateCard
        variant="missing-field"
        title="Meeting notes cannot be loaded"
        message="A valid ticker is required. For Follow-On (FO) deals, a pricing date is also required."
        context={[
          { label: "Ticker", value: ticker || undefined },
          { label: "Deal Type", value: dealType || undefined },
        ]}
      />
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
