import React from "react";
import { Divider, Grid, Stack } from "@mui/material";
import type {
  BusinessStrategy,
  CapitalStructure,
  InvestmentSnapshot,
  MeetingOverview,
} from "./MeetingNoteFormTypes";
import MeetingInfoCard from "./MeetingInfoCard";
import AttendeesCard from "./AttendeesCard";
import DealMetricsCard from "./DealMetricsCard";
import KeyInsightsSection from "./KeyInsightsSection";
import EmailAutomationSection from "./EmailAutomationSection";

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
}) => (
  <Stack spacing={2}>
    <Divider />
    <Grid
      container
      spacing={1}
      columnSpacing={{ xs: 1, md: 1 }}
      rowSpacing={{ xs: 1, md: 1 }}
      alignItems="stretch"
    >
      <Grid item xs={12} md={4} sx={{ display: "flex" }}>
        <MeetingInfoCard
          meetingOverview={meetingOverview}
          setMeetingOverview={setMeetingOverview}
          isEditing={isEditing}
        />
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: "flex" }}>
        <AttendeesCard
          meetingOverview={meetingOverview}
          setMeetingOverview={setMeetingOverview}
          investmentSnapshot={investmentSnapshot}
          setInvestmentSnapshot={setInvestmentSnapshot}
          capitalStructure={capitalStructure}
          setCapitalStructure={setCapitalStructure}
          isEditing={isEditing}
        />
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: "flex", mb: { xs: 2, md: 0 } }}>
        <DealMetricsCard
          investmentSnapshot={investmentSnapshot}
          setInvestmentSnapshot={setInvestmentSnapshot}
          businessStrategy={businessStrategy}
          setBusinessStrategy={setBusinessStrategy}
          capitalStructure={capitalStructure}
          setCapitalStructure={setCapitalStructure}
          isEditing={isEditing}
        />
      </Grid>
    </Grid>
    <KeyInsightsSection
      investmentSnapshot={investmentSnapshot}
      setInvestmentSnapshot={setInvestmentSnapshot}
      businessStrategy={businessStrategy}
      setBusinessStrategy={setBusinessStrategy}
      capitalStructure={capitalStructure}
      setCapitalStructure={setCapitalStructure}
      isEditing={isEditing}
    />
    <EmailAutomationSection
      capitalStructure={capitalStructure}
      setCapitalStructure={setCapitalStructure}
      isEditing={isEditing}
    />
  </Stack>
);

export default MeetingNoteForm;
