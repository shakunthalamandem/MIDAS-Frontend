import React from "react"
import { BasicDealDetails } from "../types/DealInformation"
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material"

interface IPOWriteUpMetaDataSectionCardProps {
  title: string
  basicDealDetails: BasicDealDetails
  accentColor?: string
  showSummary?: boolean
  showTitle?: boolean
  showNotes?: boolean
  children?: React.ReactNode
}

const IPOWriteUpMetaDataSectionCard: React.FC<
  IPOWriteUpMetaDataSectionCardProps
> = ({
  title,
  basicDealDetails,
  showTitle = true,
  // accentColor = "#dadadaff",
  showSummary = true,
  showNotes = true,
  children
}) => {
  const headingColor = "#1d2b5a"
  const summaryItems = [
    { label: "Ticker", value: basicDealDetails.ticker },
    { label: "Region", value: basicDealDetails.region },
    { label: "Deal ID", value: basicDealDetails.deal_id },
    { label: "Deal Type", value: basicDealDetails.deal_type }
  ]

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e1e7f5",
        background: "#ffffff",
        boxShadow: "0 12px 28px rgba(32, 70, 150, 0.12)",
        position: "relative",
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          // background: accentColor
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, pl: { xs: 3, md: 3.5 } }}>
        <Stack spacing={2.5}>
          {showTitle ? (
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: headingColor, textAlign: "center" }}
            >
              {title}
            </Typography>
          ) : null}

          {showSummary ? (
            <Grid container spacing={2}>
              {summaryItems.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.label}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      background: "#eef4ff",
                      border: "1px solid #d6e1ff",
                      p: 2,
                      minHeight: 82,
                      boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)"
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#5c6c8a", fontWeight: 600 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#101d45", mt: 0.5 }}
                    >
                      {item.value ?? "--"}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : null}

          {children ? <Box>{children}</Box> : null}

          {showNotes ? (
            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid #e0e6f5",
                background: "#f5f8ff",
                p: { xs: 2, md: 2.5 }
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#2b3a67", fontWeight: 600, mb: 1 }}
                  >
                    Notes
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Add notes for this section"
                    size="small"
                    sx={{
                      background: "#ffffff",
                      borderRadius: 1.5,
                      "& .MuiOutlinedInput-root": { borderRadius: 1.5 }
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#2b3a67", fontWeight: 600, mb: 1 }}
                  >
                    Follow Up Questions
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Capture follow up questions"
                    size="small"
                    sx={{
                      background: "#ffffff",
                      borderRadius: 1.5,
                      "& .MuiOutlinedInput-root": { borderRadius: 1.5 }
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default IPOWriteUpMetaDataSectionCard
