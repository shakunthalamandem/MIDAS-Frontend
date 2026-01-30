import { Stack, Typography, Chip } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataMarketStatergyProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataMarketStatergy: React.FC<
  IPOWriteUpMetaDataMarketStatergyProps
> = ({ basicDealDetails, metadata }) => {
  return (

      <Stack spacing={1.5}>
        <Typography variant="body2">
          <strong>Market Analysis:</strong>{" "}
          {metadata?.market_analysis_category ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Growth Catalysts:</strong>{" "}
          {metadata?.growth_catalysts_category ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Secular Trends:</strong>{" "}
          {metadata?.secular_trends_category ?? "—"}
        </Typography>

        <Stack direction="row" spacing={1} mt={1}>
          {metadata?.market_analysis_color && (
            <Chip
              label={`Market: ${metadata.market_analysis_color}`}
              size="small"
              color="success"
            />
          )}
          {metadata?.growth_catalysts_color && (
            <Chip
              label={`Catalysts: ${metadata.growth_catalysts_color}`}
              size="small"
              color="success"
            />
          )}
          {metadata?.secular_trends_color && (
            <Chip
              label={`Trends: ${metadata.secular_trends_color}`}
              size="small"
              color="success"
            />
          )}
        </Stack>
      </Stack>
  )
}

export default IPOWriteUpMetaDataMarketStatergy
