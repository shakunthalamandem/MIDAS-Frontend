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
import IPOWriteUpMetaDataKeyMetricsNew from "./IPOWriteUpMetaData/IPOWriteUpMetaDataKeyMetricsNew"

interface WriteUpData {
  ticker_name: string;
  exchange: string;
  company_name: string;
  pricing_date: string;
  deal_size: number;
  industry: string;
  shares_offered: number;
  nosh: number;
  established_year: number;
  lower_bound: number;
  upper_bound: number;
  filed_date: string;
  term_date: string;
  trade_date: string;
  bookrunners: string[];
}

type FebIPOWriteUpPdfContentProps = {
  basicDealDetails: BasicDealDetails
  sectionCardSx: Record<string, unknown>
  rootId: string
  writeUpData?: WriteUpData | null
}

const FebIPOWriteUpPdfContent: React.FC<FebIPOWriteUpPdfContentProps> = ({
  basicDealDetails,
  sectionCardSx,
  rootId,
  writeUpData
}) => {
  const pdfPages = useMemo(
    () => [
      {
        id: "page-1",
        sections: [
          { id: "deal-info", content: <IPOWriteUpMetaDataDealInfo basicDealDetails={basicDealDetails} writeUpData={writeUpData} /> },
          {
            id: "market-strategy",
            content: <IPOWriteUpMetaDataMarketStatergy basicDealDetails={basicDealDetails} />
          },
          { id: "ai-indication", content: <IPOWriteUpMetaDataDealIndication basicDealDetails={basicDealDetails} writeUpData={writeUpData} /> }
        ]
      },
      {
        id: "page-2",
        sections: [
          { id: "business-overview", content: <IPOWriteUpMetaDataBusinessOverview basicDealDetails={basicDealDetails} pdfMode={true} /> }
        ]
      },
      {
        id: "page-3",
        sections: [
          { id: "key-metrics", content: <IPOWriteUpMetaDataKeyMetricsNew basicDealDetails={basicDealDetails} /> }

        ]
      },
      {
        id: "page-4",
        sections: [
                    {
            id: "financial-highlights",
            content: <IPOWriteUpMetaDataFinancialHighlights basicDealDetails={basicDealDetails} />
          },
          { id: "comps", content: <IPOWriteUpMetaDataComps basicDealDetails={basicDealDetails} /> },

        ]
      },
      {
        id: "page-5",
        sections: [
            {
              id: "valuation-analysis",
              content: <IPOWriteUpMetaDataValuationAnalysis basicDealDetails={basicDealDetails} pdfMode={true} />
            }
        ]
      },
            {
        id: "page-6",
        sections: [

          { id: "red-flag", content: <IPOWriteUpMetaDataRedFlag basicDealDetails={basicDealDetails} /> }
        ]
      },
                  {
        id: "page-7",
        sections: [

          { id: "final-verdict", content: <IPOWriteUpMetaDataFinalVerdict basicDealDetails={basicDealDetails} /> }
        ]
      }
    ],
    [basicDealDetails, writeUpData]
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

export default FebIPOWriteUpPdfContent
