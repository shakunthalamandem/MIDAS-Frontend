import React, { useMemo } from "react"
import { Box, Card, CardContent } from "@mui/material"
import { BasicDealDetails } from "./types/DealInformation"
import IPOWriteUpMetaDataBusinessOverview from "./IPOWriteUpMetaData/IPOWriteUpMetaDataBusinessOverview"
import IPOWriteUpMetaDataComps from "./IPOWriteUpMetaData/IPOWriteUpMetaDataComps"
import IPOWriteUpMetaDataDealIndication from "./IPOWriteUpMetaData/IPOWriteUpMetaDataDealIndication"
import IPOWriteUpMetaDataDealInfo from "./IPOWriteUpMetaData/IPOWriteUpMetaDataDealInfo"
import IPOWriteUpMetaDataFinalVerdict from "./IPOWriteUpMetaData/IPOWriteUpMetaDataFinalVerdict"
import IPOWriteUpMetaDataFinancialHighlights from "./IPOWriteUpMetaData/IPOWriteUpMetaDataFinancialHighlights"
import IPOWriteUpMetaDataKeyMetrics from "./IPOWriteUpMetaData/IPOWriteUpMetaDataKeyMetrics"
import IPOWriteUpMetaDataMarketStatergy from "./IPOWriteUpMetaData/IPOWriteUpMetaDataMarketStatergy"
import IPOWriteUpMetaDataRedFlag from "./IPOWriteUpMetaData/IPOWriteUpMetaDataRedFlag"
import IPOWriteUpMetaDataValuationAnalysis from "./IPOWriteUpMetaData/IPOWriteUpMetaDataValuationAnalysis"

type FebIPOWriteUpPdfContentProps = {
  basicDealDetails: BasicDealDetails
  sectionCardSx: Record<string, unknown>
  rootId: string
}

const FebIPOWriteUpPdfContent: React.FC<FebIPOWriteUpPdfContentProps> = ({
  basicDealDetails,
  sectionCardSx,
  rootId
}) => {
  const pdfPages = useMemo(
    () => [
      {
        id: "page-1",
        sections: [
          { id: "deal-info", content: <IPOWriteUpMetaDataDealInfo basicDealDetails={basicDealDetails} /> },
          {
            id: "market-strategy",
            content: <IPOWriteUpMetaDataMarketStatergy basicDealDetails={basicDealDetails} />
          },
          { id: "deal-indication", content: <IPOWriteUpMetaDataDealIndication basicDealDetails={basicDealDetails} /> }
        ]
      },
      {
        id: "page-2b",
        sections: [
          { id: "business-overview", content: <IPOWriteUpMetaDataBusinessOverview basicDealDetails={basicDealDetails} pdfMode={true} /> }
        ]
      },
      {
        id: "page-3",
        sections: [
          { id: "key-metrics", content: <IPOWriteUpMetaDataKeyMetrics basicDealDetails={basicDealDetails} /> },
          {
            id: "financial-highlights",
            content: <IPOWriteUpMetaDataFinancialHighlights basicDealDetails={basicDealDetails} />
          }
        ]
      },
      {
        id: "page-4",
        sections: [
          { id: "comps", content: <IPOWriteUpMetaDataComps basicDealDetails={basicDealDetails} /> },
          {
            id: "valuation-analysis",
            content: <IPOWriteUpMetaDataValuationAnalysis basicDealDetails={basicDealDetails} />
          }
        ]
      },
      {
        id: "page-5",
        sections: [
          { id: "red-flag", content: <IPOWriteUpMetaDataRedFlag basicDealDetails={basicDealDetails} /> },
          { id: "final-verdict", content: <IPOWriteUpMetaDataFinalVerdict basicDealDetails={basicDealDetails} /> }
        ]
      }
    ],
    [basicDealDetails]
  )

  return (
    <Box
      id={rootId}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
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
              gap: 3,
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
                  mx: "auto"
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
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

export default FebIPOWriteUpPdfContent
