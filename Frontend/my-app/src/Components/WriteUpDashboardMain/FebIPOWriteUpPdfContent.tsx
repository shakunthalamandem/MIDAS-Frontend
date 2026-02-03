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
  const pdfSections = useMemo(
    () => [
      { id: "deal-info", content: <IPOWriteUpMetaDataDealInfo basicDealDetails={basicDealDetails} /> },
      { id: "deal-indication", content: <IPOWriteUpMetaDataDealIndication basicDealDetails={basicDealDetails} /> },
      { id: "business-overview", content: <IPOWriteUpMetaDataBusinessOverview basicDealDetails={basicDealDetails} /> },
      { id: "key-metrics", content: <IPOWriteUpMetaDataKeyMetrics basicDealDetails={basicDealDetails} /> },
      { id: "financial-highlights", content: <IPOWriteUpMetaDataFinancialHighlights basicDealDetails={basicDealDetails} /> },
      { id: "comps", content: <IPOWriteUpMetaDataComps basicDealDetails={basicDealDetails} /> },
      { id: "valuation-analysis", content: <IPOWriteUpMetaDataValuationAnalysis basicDealDetails={basicDealDetails} /> },
      { id: "red-flag", content: <IPOWriteUpMetaDataRedFlag basicDealDetails={basicDealDetails} /> },
      { id: "final-verdict", content: <IPOWriteUpMetaDataFinalVerdict basicDealDetails={basicDealDetails} /> }
    ],
    [basicDealDetails]
  )

  const pdfSectionPairs = useMemo(() => {
    const pairs: Array<typeof pdfSections> = []
    for (let i = 0; i < pdfSections.length; i += 2) {
      pairs.push(pdfSections.slice(i, i + 2))
    }
    return pairs
  }, [pdfSections])

  return (
    <Box id={rootId} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {pdfSectionPairs.map((pair, pairIndex) => (
        <Box key={`pdf-pair-${pairIndex}`} className="mdr-pdf-section">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {pair.map((section) => (
              <Card key={section.id} sx={sectionCardSx}>
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
