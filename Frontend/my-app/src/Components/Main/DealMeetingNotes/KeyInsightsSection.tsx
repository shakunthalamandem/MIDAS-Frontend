import React from "react";
import { Box, Button, Divider, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import type { BusinessStrategy, CapitalStructure, InvestmentSnapshot } from "./MeetingNoteFormTypes";
import { headingColor, headerBg, readOnlyFieldSx, sectionCardSx, uiFontFamily, SectionHeader } from "./MeetingNoteFormShared";

type KeyInsightsSectionProps = {
  investmentSnapshot: InvestmentSnapshot;
  setInvestmentSnapshot: React.Dispatch<React.SetStateAction<InvestmentSnapshot>>;
  businessStrategy: BusinessStrategy;
  setBusinessStrategy: React.Dispatch<React.SetStateAction<BusinessStrategy>>;
  capitalStructure: CapitalStructure;
  setCapitalStructure: React.Dispatch<React.SetStateAction<CapitalStructure>>;
  isEditing: boolean;
};

type InsightFieldOptions = {
  maxHeight?: number;
};

const KeyInsightsSection: React.FC<KeyInsightsSectionProps> = ({
  investmentSnapshot,
  setInvestmentSnapshot,
  businessStrategy,
  setBusinessStrategy,
  capitalStructure,
  setCapitalStructure,
  isEditing,
}) => {
  const renderInsightField = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    placeholder?: string,
    options?: InsightFieldOptions
  ) => {
    const textareaMaxHeight = options?.maxHeight ?? 120;

    return (
      <Grid container spacing={1} alignItems="center" sx={{ px: { xs: 0.5, md: 1 }, py: 0.5 }}>
        <Grid item xs={12} md={2}>
          <Typography
            fontWeight={600}
            color={headingColor}
            sx={{ textAlign: { xs: "left", md: "left" }, fontFamily: uiFontFamily }}
          >
            {label}
          </Typography>
        </Grid>
        <Grid item xs={12} md={10}>
          <TextField
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            placeholder={placeholder}
            InputProps={{
              readOnly: !isEditing,
              sx: {
                fontFamily: uiFontFamily,
                "& textarea": {
                  minHeight: 44,
                  maxHeight: textareaMaxHeight,
                  overflow: "auto",
                },
              },
            }}
            multiline
            minRows={1}
            maxRows={4}
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 1,
              width: "100%",
              ...readOnlyFieldSx,
              "& .MuiInputBase-input": {
                fontFamily: uiFontFamily,
              },
            }}
          />
        </Grid>
      </Grid>
    );
  };

  const renderAttachmentField = (
    label: string,
    files: File[],
    onChange: (nextFiles: File[]) => void
  ) => {
    const names = files.length ? files.map((file) => file.name).join(", ") : "No files selected";

    return (
      <Grid container spacing={1} alignItems="center" sx={{ px: { xs: 0.5, md: 1 }, py: 0.5 }}>
        <Grid item xs={12} md={2}>
          <Typography
            fontWeight={600}
            color={headingColor}
            sx={{ textAlign: { xs: "left", md: "left" }, fontFamily: uiFontFamily }}
          >
            {label}
          </Typography>
        </Grid>
        <Grid item xs={12} md={10}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "flex-start", md: "center" }}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              disabled={!isEditing}
              sx={{ fontFamily: uiFontFamily, textTransform: "none" }}
            >
              Upload attachments
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => onChange(Array.from(e.target.files || []))}
              />
            </Button>
            <Typography color="#1a2b5a" sx={{ fontFamily: uiFontFamily }}>
              {names}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  return (
    <Paper sx={sectionCardSx}>
      <Box
        sx={{
          backgroundColor: headerBg,
          borderRadius: 1.5,
          py: 0.75,
          px: 1,
        }}
      >
        <SectionHeader icon={<LightbulbOutlinedIcon fontSize="small" />} title="Key Insights" />
      </Box>
      <Stack spacing={1} sx={{ padding: 2 }}>
        {renderInsightField(
          "One-line Summary",
          investmentSnapshot.oneLineSummary,
          (val) => setInvestmentSnapshot((prev) => ({ ...prev, oneLineSummary: val })),
          "One-line summary"
        )}
        <Divider sx={{ borderColor: "#d9deeb" }} />
        {renderInsightField(
          "Executive Summary",
          investmentSnapshot.executiveSummary,
          (val) => setInvestmentSnapshot((prev) => ({ ...prev, executiveSummary: val })),
          "Executive summary"
        )}
        <Divider sx={{ borderColor: "#d9deeb" }} />
        {renderInsightField(
          "Meeting Notes",
          businessStrategy.meetingNotes,
          (val) => setBusinessStrategy((prev) => ({ ...prev, meetingNotes: val })),
          "Meeting notes",
          { maxHeight: 500 }
        )}
        <Divider sx={{ borderColor: "#d9deeb" }} />
        {renderInsightField(
          "Follow-up Questions",
          capitalStructure.followUpQuestions,
          (val) => setCapitalStructure((prev) => ({ ...prev, followUpQuestions: val })),
          "Follow-up questions"
        )}
        <Divider sx={{ borderColor: "#d9deeb" }} />
        {renderAttachmentField("Attachments", capitalStructure.attachments, (nextFiles) =>
          setCapitalStructure((prev) => ({ ...prev, attachments: nextFiles }))
        )}
      </Stack>
    </Paper>
  );
};

export default KeyInsightsSection;
