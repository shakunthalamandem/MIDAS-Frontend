import { Stack, Typography, Chip } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataFinalVerdictProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataFinalVerdict: React.FC<
  IPOWriteUpMetaDataFinalVerdictProps
> = ({ basicDealDetails, metadata }) => {
  return (

      <Stack spacing={1.5}>
        <Typography variant="body2">
          <strong>Overall Recommendation:</strong>{" "}
          {metadata?.final_verdict ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Investment Stance:</strong>{" "}
          {metadata?.investment_stance ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Risk–Reward Assessment:</strong>{" "}
          {metadata?.risk_reward_summary ?? "—"}
        </Typography>

        {metadata?.verdict_rating && (
          <Chip
            label={`Verdict: ${metadata.verdict_rating}`}
            size="small"
            color={
              metadata.verdict_rating === "Negative"
                ? "error"
                : metadata.verdict_rating === "Neutral"
                ? "warning"
                : "success"
            }
          />
        )}
      </Stack>
  )
}

export default IPOWriteUpMetaDataFinalVerdict
