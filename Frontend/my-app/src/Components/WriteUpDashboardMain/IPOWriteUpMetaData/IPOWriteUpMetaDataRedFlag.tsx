import { Stack, Typography, Chip } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataRedFlagProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataRedFlag: React.FC<IPOWriteUpMetaDataRedFlagProps> = ({
  basicDealDetails,
  metadata
}) => {
  return (

      <Stack spacing={1.5}>
        <Typography variant="body2">
          <strong>Risk Analysis:</strong>{" "}
          {metadata?.red_flag_analysis ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Key Concerns:</strong> {metadata?.concerns ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Leverage Profile:</strong>{" "}
          {metadata?.leverage_profile_category ?? "—"}
        </Typography>

        {metadata?.leverage_profile_color && (
          <Chip
            label={`Leverage Risk: ${metadata.leverage_profile_color}`}
            size="small"
            color={
              metadata.leverage_profile_color === "red"
                ? "error"
                : metadata.leverage_profile_color === "yellow"
                ? "warning"
                : "success"
            }
          />
        )}
      </Stack>
  )
}

export default IPOWriteUpMetaDataRedFlag
