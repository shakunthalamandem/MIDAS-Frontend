import CheckIcon from "@mui/icons-material/Check"
import {
  Box,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  Typography
} from "@mui/material"
import axios from "axios"
import { useEffect, useState } from "react"
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
import IPOWriteUpMetaDataTrends from "./IPOWriteUpMetaData/IPOWriteUpMetaDataTrends"
import IPOWriteUpMetaDataValuationAnalysis from "./IPOWriteUpMetaData/IPOWriteUpMetaDataValuationAnalysis"

interface DealWriteupResponse {
  ticker: string
  pricing_date: string | null
  deal_id: number | null
  sector: string
  region: string
  deal_type: string
  issuer_name: string
  metadata: Record<string, any>
}

interface FebIPOWriteUpDashboardMainProps {
  basicDealDetails: BasicDealDetails
}

const FebIPOWriteUpDashboardMain: React.FC<FebIPOWriteUpDashboardMainProps> = ({
  basicDealDetails
}) => {
  const sections = [
    { id: "deal-info", label: "Deal Info" },
    { id: "deal-indication", label: "Deal Indication" },
    { id: "market-strategy", label: "Market Strategy" },
    { id: "business-overview", label: "Business Overview" },
    { id: "key-metrics", label: "Key Metrics" },
    { id: "financial-highlights", label: "Financial Highlights" },
    { id: "comps", label: "Comps" },
    { id: "trends", label: "Trends" },
    { id: "valuation-analysis", label: "Valuation Analysis" },
    { id: "red-flag", label: "Red Flag" },
    { id: "final-verdict", label: "Final Verdict" }
  ]

  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [writeupData, setWriteupData] = useState<DealWriteupResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDealWriteup = async () => {
      try {
        const res = await axios.post<DealWriteupResponse>("/api/get_deal_writeup/", {
          ticker: basicDealDetails.ticker
        })
        setWriteupData(res.data)
      } catch (err) {
        console.error("Error fetching deal writeup", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDealWriteup()
  }, [basicDealDetails.ticker])

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId)
    const target = document.getElementById(sectionId)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (loading) {
    return <Typography>Loading IPO write-up…</Typography>
  }

  const meta = writeupData?.metadata

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
        gap: { xs: 2, md: 3 },
        alignItems: "start"
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f5",
          background: "#f7f9ff",
          boxShadow: "0 12px 24px rgba(32, 70, 150, 0.08)",
          position: { md: "sticky" },
          top: { md: 24 }
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            IPO Write-up
          </Typography>
          <List sx={{ p: 0, display: "grid", gap: 0.5 }}>
            {sections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <ListItemButton
                  key={section.id}
                  selected={isActive}
                  onClick={() => handleNavClick(section.id)}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    background: isActive ? "#e7edff" : "transparent",
                    border: isActive
                      ? "1px solid #c8d6ff"
                      : "1px solid transparent"
                  }}
                >
                  <ListItemText
                    primary={section.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 600
                    }}
                  />
                  {isActive && (
                    <CheckIcon sx={{ color: "#4c6fff", fontSize: 18 }} />
                  )}
                </ListItemButton>
              )
            })}
          </List>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box id="deal-info" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataDealInfo basicDealDetails={basicDealDetails} metadata={meta} />
        </Box>
        <Box id="deal-indication" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataDealIndication basicDealDetails={basicDealDetails} metadata={meta} />
        </Box>
        <Box id="market-strategy" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataMarketStatergy basicDealDetails={basicDealDetails} metadata={meta} />
        </Box>
        <Box id="business-overview" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataBusinessOverview basicDealDetails={basicDealDetails} metadata={meta} />
        </Box>
        <Box id="key-metrics" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataKeyMetrics basicDealDetails={basicDealDetails} metadata={meta} />
        </Box>
        <Box id="financial-highlights" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataFinancialHighlights basicDealDetails={basicDealDetails} />
        </Box>
        <Box id="trends" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataTrends basicDealDetails={basicDealDetails} />
        </Box>
        <Box id="comps" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataComps basicDealDetails={basicDealDetails} />
        </Box>
        <Box id="valuation-analysis" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataValuationAnalysis basicDealDetails={basicDealDetails} metadata={meta} />
        </Box>
        <Box id="red-flag" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataRedFlag basicDealDetails={basicDealDetails} metadata={meta} />
        </Box>
        <Box id="final-verdict" sx={{ scrollMarginTop: 96 }}>
          <IPOWriteUpMetaDataFinalVerdict basicDealDetails={basicDealDetails} metadata={meta} />
        </Box>
      </Box>
    </Box>
  )
}

export default FebIPOWriteUpDashboardMain