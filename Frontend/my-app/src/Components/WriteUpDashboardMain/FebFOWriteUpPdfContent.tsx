import React, { useMemo } from "react"
import { Box, Card, CardContent } from "@mui/material"
import { BasicDealDetails } from "./types/DealInformation"
import { FOWriteUpApiResponse } from "./types/FOWriteUpData"

import FOWriteUpMetaDataDealInfo from "./FoWriteUpMetaData/FOWriteUpMetaDataDealInfo"
import FOWriteUpMetaDataAIIndication from "./FoWriteUpMetaData/FOWriteUpMetaDataAIIndication"
import FOWriteUpMetaDataBusinessOverview from "./FoWriteUpMetaData/FOWriteUpMetaDataBusinessOverview"
import FOWriteUpMetaDataKeyRisks from "./FoWriteUpMetaData/FOWriteUpMetaDataKeyRisks"
import FOWriteUpMetaDataInvestmentHighlights from "./FoWriteUpMetaData/FOWriteUpMetaDataInvestmentHighlights"
import FOWriteUpMetaDataValuationAnalysis from "./FoWriteUpMetaData/FOWriteUpMetaDataValuationAnalysis"
import FOWriteUpMetaDataFinancialHighlights from "./FoWriteUpMetaData/FOWriteUpMetaDataFinancialHighlights"
import FOWriteUpMetaDataComps from "./FoWriteUpMetaData/FOWriteUpMetaDataComps"

type FebFOWriteUpPdfContentProps = {
  basicDealDetails: BasicDealDetails
  sectionCardSx: Record<string, unknown>
  rootId: string
  foWriteUpData?: FOWriteUpApiResponse | null
}

const FebFOWriteUpPdfContent: React.FC<FebFOWriteUpPdfContentProps> = ({
  basicDealDetails,
  sectionCardSx,
  rootId,
  foWriteUpData
}) => {
  const pdfPages = useMemo(
    () => [
      {
        id: "fo-page-1",
        sections: [
          {
            id: "deal-info",
            content: (
              <FOWriteUpMetaDataDealInfo
                ticker={basicDealDetails.ticker}
                tradingDetails={{ ...foWriteUpData?.trading_details, pricing_date: foWriteUpData?.deal_information?.pricing_date }}
                sharePricePerformance={foWriteUpData?.share_price_performance}
                useOfProceeds={foWriteUpData?.deal_information?.use_of_proceeds}
                trackRecord={foWriteUpData?.deal_information?.track_record}
              />
            )
          },
          {
            id: "ai-indication",
            content: (
              <FOWriteUpMetaDataAIIndication
                basicDealDetails={basicDealDetails}
              />
            )
          }
        ]
      },
      {
        id: "fo-page-2",
        sections: [
          {
            id: "business-overview",
            content: (
              <FOWriteUpMetaDataBusinessOverview
                ticker={basicDealDetails.ticker}
                data={foWriteUpData?.business_details}
              />
            )
          }
        ]
      },
      {
        id: "fo-page-3",
        sections: [
          {
            id: "key-risks",
            content: (
              <FOWriteUpMetaDataKeyRisks
                ticker={basicDealDetails.ticker}
                data={foWriteUpData?.key_risks}
              />
            )
          },
          {
            id: "investment-highlights",
            content: (
              <FOWriteUpMetaDataInvestmentHighlights
                ticker={basicDealDetails.ticker}
                data={foWriteUpData?.investment_highlights}
              />
            )
          }
        ]
      },
      {
        id: "fo-page-4",
        sections: [
          {
            id: "valuation-analysis",
            content: (
              <FOWriteUpMetaDataValuationAnalysis
                ticker={basicDealDetails.ticker}
                data={foWriteUpData?.valuation_writeup}
              />
            )
          }
        ]
      },
      {
        id: "fo-page-5",
        sections: [
          {
            id: "financial-highlights",
            content: (
              <FOWriteUpMetaDataFinancialHighlights
                basicDealDetails={basicDealDetails}
              />
            )
          }
        ]
      },
      {
        id: "fo-page-6",
        sections: [
          {
            id: "comps",
            content: (
              <FOWriteUpMetaDataComps
                basicDealDetails={basicDealDetails}
              />
            )
          }
        ]
      }
    ],
    [basicDealDetails, foWriteUpData]
  )

  return (
    <Box
      id={rootId}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        alignItems: "center",
        width: "100%"
      }}
    >
      {pdfPages.map((page, pageIndex) => (
        <Box
          key={page.id}
          id={page.id}
          className="mdr-pdf-section"
          data-pdf-break-before={pageIndex > 0 ? "true" : "false"}
          sx={{ width: "100%" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              alignItems: "center",
              width: "100%"
            }}
          >
            {page.sections.map((section) => (
              <Card
                key={section.id}
                sx={{
                  ...sectionCardSx,
                  width: "100%",
                  maxWidth: 1200,
                  mx: "auto",
                  background: "linear-gradient(135deg, #f0f5ff, #ffffff)",
                  border: "1px solid #E6ECF5",
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  {section.content}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default FebFOWriteUpPdfContent
