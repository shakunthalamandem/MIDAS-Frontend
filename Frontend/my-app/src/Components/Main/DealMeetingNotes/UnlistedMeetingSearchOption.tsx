import React from "react";
import { Box, Typography } from "@mui/material";

export type UnlistedMeetingSearchOptionData = {
  ticker: string;
  pricingDate?: string;
  name?: string;
  dealType?: string;
  dealId?: string | number;
  id?: number | string;
};

const UnlistedMeetingSearchOption: React.FC<{ option: UnlistedMeetingSearchOptionData }> = ({
  option,
}) => (
  <Box display="flex" flexDirection="column">
    <Typography fontWeight={700} sx={{ color: "#002060" }}>
      {option.ticker}
      {option.pricingDate ? ` (${option.pricingDate})` : ""}
    </Typography>
    {option.name || option.dealType ? (
      <Typography variant="caption" color="text.secondary">
        {[option.name, option.dealType].filter(Boolean).join(" - ")}
      </Typography>
    ) : null}
  </Box>
);

export default UnlistedMeetingSearchOption;
