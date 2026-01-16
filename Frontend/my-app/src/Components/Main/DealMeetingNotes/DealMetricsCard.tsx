import React from "react";
import { Box, Paper, Stack } from "@mui/material";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import type { BusinessStrategy, CapitalStructure, InvestmentSnapshot } from "./MeetingNoteFormTypes";
import { LabeledMultiSelectField, LabeledTextField } from "./MeetingNoteFormFields";
import { headerBg, sectionCardSx, SectionHeader } from "./MeetingNoteFormShared";

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

type DealMetricsCardProps = {
  investmentSnapshot: InvestmentSnapshot;
  setInvestmentSnapshot: React.Dispatch<React.SetStateAction<InvestmentSnapshot>>;
  businessStrategy: BusinessStrategy;
  setBusinessStrategy: React.Dispatch<React.SetStateAction<BusinessStrategy>>;
  capitalStructure: CapitalStructure;
  setCapitalStructure: React.Dispatch<React.SetStateAction<CapitalStructure>>;
  isEditing: boolean;
};

const DealMetricsCard: React.FC<DealMetricsCardProps> = ({
  investmentSnapshot,
  setInvestmentSnapshot,
  businessStrategy,
  setBusinessStrategy,
  capitalStructure,
  setCapitalStructure,
  isEditing,
}) => (
  <Paper sx={{ ...sectionCardSx, minHeight: { xs: 420, md: 460 } }}>
    <Box
      sx={{
        backgroundColor: headerBg,
        borderRadius: 1.5,
        py: 0.75,
        px: 1,
      }}
    >
      <SectionHeader icon={<AnalyticsOutlinedIcon fontSize="small" />} title="Deal Metrics" />
    </Box>
    <Stack spacing={1} sx={{ padding: 2 }}>
      <LabeledTextField
        label="Possible Deal Size"
        value={investmentSnapshot.possibleSize}
        onChange={(val) => setInvestmentSnapshot((prev) => ({ ...prev, possibleSize: val }))}
        isEditing={isEditing}
      />
            <LabeledTextField
        label="Historical sellers"
        value={capitalStructure.historicalSellers}
        onChange={(val) => setCapitalStructure((prev) => ({ ...prev, historicalSellers: val }))}
        isEditing={isEditing}
      />
      <LabeledMultiSelectField
        label="Reason"
        value={businessStrategy.reasonForRaise}
        onChange={(val) => setBusinessStrategy((prev) => ({ ...prev, reasonForRaise: val }))}
        options={reasonOptions}
        isEditing={isEditing}
      />
      <LabeledMultiSelectField
        label="Opportunistic Deal"
        value={businessStrategy.opportunisticDeal}
        onChange={(val) => setBusinessStrategy((prev) => ({ ...prev, opportunisticDeal: val }))}
        options={["Yes", "No"]}
        isEditing={isEditing}
      />
      <LabeledMultiSelectField
        label="Catalyst"
        value={businessStrategy.catalysts}
        onChange={(val) => setBusinessStrategy((prev) => ({ ...prev, catalysts: val }))}
        options={catalystOptions}
        isEditing={isEditing}
      />
      <LabeledMultiSelectField
        label="Potential sellers"
        value={capitalStructure.potentialSellers}
        onChange={(val) => setCapitalStructure((prev) => ({ ...prev, potentialSellers: val }))}
        options={potentialSellerOptions}
        isEditing={isEditing}
      />

    </Stack>
  </Paper>
);

export default DealMetricsCard;
