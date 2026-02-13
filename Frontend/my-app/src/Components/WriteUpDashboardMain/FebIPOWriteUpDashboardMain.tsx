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
import { useEffect, useMemo, useState } from "react"
import { BasicDealDetails } from "./types/DealInformation"

import IPOWriteUpMetaDataBusinessOverview from "./IPOWriteUpMetaData/IPOWriteUpMetaDataBusinessOverview"
import IPOWriteUpMetaDataComps from "./IPOWriteUpMetaData/IPOWriteUpMetaDataComps"
import IPOWriteUpMetaDataDealIndication from "./IPOWriteUpMetaData/IPOWriteUpMetaDataDealIndication"
import IPOWriteUpMetaDataDealInfo from "./IPOWriteUpMetaData/IPOWriteUpMetaDataDealInfo"
import IPOWriteUpMetaDataFinalVerdict from "./IPOWriteUpMetaData/IPOWriteUpMetaDataFinalVerdict"
import IPOWriteUpMetaDataFinancialHighlights from "./IPOWriteUpMetaData/IPOWriteUpMetaDataFinancialHighlights"
import IPOWriteUpMetaDataKeyMetrics from "./IPOWriteUpMetaData/IPOWriteUpMetaDataKeyMetrics"
import IPOWriteUpMetaDataKeyMetricsNew from "./IPOWriteUpMetaData/IPOWriteUpMetaDataKeyMetricsNew"
import IPOWriteUpMetaDataMarketStatergy from "./IPOWriteUpMetaData/IPOWriteUpMetaDataMarketStatergy"
import IPOWriteUpMetaDataRedFlag from "./IPOWriteUpMetaData/IPOWriteUpMetaDataRedFlag"
import IPOWriteUpMetaDataValuationAnalysis from "./IPOWriteUpMetaData/IPOWriteUpMetaDataValuationAnalysis"
import FebIPOWriteUpPdfContent from "./FebIPOWriteUpPdfContent"
import FebIPOWriteUpPdfExporter from "./FebIPOWriteUpPdfExporter"

interface FebIPOWriteUpDashboardMainProps {
  basicDealDetails: BasicDealDetails
}

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

const FebIPOWriteUpDashboardMain: React.FC<FebIPOWriteUpDashboardMainProps> = ({
  basicDealDetails
}) => {
  const [writeUpData, setWriteUpData] = useState<WriteUpData | null>(null);

  // Fetch writeup_data API to get exchange and pricing_date
  useEffect(() => {
    const { ticker } = basicDealDetails;

    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ ticker }),
        });

        if (res.ok) {
          const data = await res.json();
          setWriteUpData(data);
        }
      } catch (error) {
        console.error('Error fetching writeup data:', error);
      }
    };

    fetchData();

    // Listen for ratings update event from Final Verdict
    const handleRatingsUpdate = () => {
      fetchData();
    };

    window.addEventListener('ratingsUpdated', handleRatingsUpdate);

    return () => {
      window.removeEventListener('ratingsUpdated', handleRatingsUpdate);
    };
  }, [basicDealDetails]);

  const sections = useMemo(
    () => [
      { id: "deal-info", label: "Deal Info" },
      { id: "market-strategy", label: " Fair Value Estimate and IOI" },
      // { id: "ai-indication", label: "Proprietary Model Indication" },
      { id: "business-overview", label: "Company Overview." },
      { id: "key-metrics", label: "Key Metrics" },
      { id: "financial-highlights", label: "Financial Highlights" },
      { id: "comps", label: "Comparative Multiples" },
      // { id: "trends", label: "Trends" },
      { id: "valuation-analysis", label: "Valuation " },
      { id: "red-flag", label: "Risk Assessment" },
      { id: "final-verdict", label: "Investment Summary" }
    ],
    []
  )

  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [pdfMode, setPdfMode] = useState(false)
  const sectionCardSx = {
    borderRadius: 3,
    border: "1px solid #edf0faff",
    background: "#c7d8f1",
    boxShadow: "0 10px 20px rgba(30, 41, 59, 0.08)",
    scrollMarginTop: 220
  }
  const pdfRootId = "feb-ipo-writeup-pdf-root"

  const fileSafeTicker = (basicDealDetails?.ticker || "IPO").toUpperCase()
  const todayIso = new Date().toISOString().slice(0, 10)
  const pdfFileName = `${fileSafeTicker}_${todayIso}.pdf`


  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId)
    const target = document.getElementById(sectionId)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (targets.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (activeEntry?.target?.id) {
          setActiveSection(activeEntry.target.id)
        }
      },
      {
        root: null,
        rootMargin: "-96px 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75]
      }
    )

    targets.forEach((target) => observer.observe(target))

    return () => observer.disconnect()
  }, [sections])

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
        gap: { xs: 2, md: 3 },
        alignItems: "start"
      }}
    >
      {/* Left Navigation */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f5",
          // background: "#eaeaff",
                      backgroundColor: "rgba(206, 225, 233, 0.92)",

          boxShadow: "0 12px 24px rgba(32, 70, 150, 0.08)",
          position: { md: "sticky" },
          top: { md: 300 },
          alignSelf: "start"
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2, textAlign: "center", color: "#1d2b5a" }}
          >
            IPO Write-up
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <FebIPOWriteUpPdfExporter
              targetId={pdfRootId}
              headerTitle="IPO Write-up"
              fileName={pdfFileName}
              onTogglePdfMode={setPdfMode}
              buttonLabel="Generate Monashee PDF"
              loadingLabel="Generating..."
              className="pdf-hidden"
              ticker={basicDealDetails?.ticker}
              pricingDate={writeUpData?.pricing_date || basicDealDetails?.pricing_date}
              issuerName={writeUpData?.company_name || basicDealDetails?.issuer_name}
              exchange={writeUpData?.exchange || basicDealDetails?.exchange}
            />
          </Box>

          <List sx={{ p: 0, display: "grid", gap: 0.1 }}>
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
                      fontSize: 13,
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

      {/* Right Content */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {pdfMode ? (
          <FebIPOWriteUpPdfContent
            basicDealDetails={basicDealDetails}
            sectionCardSx={sectionCardSx}
            rootId={pdfRootId}
            writeUpData={writeUpData}
          />
        ) : (
          <>
            <Card id="deal-info" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataDealInfo
                  basicDealDetails={basicDealDetails}
                  writeUpData={writeUpData}
                  onDataLoaded={setWriteUpData}
                />
              </CardContent>
            </Card>

            

            <Card id="market-strategy" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataMarketStatergy
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>

            {/* <Card id="ai-indication" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataDealIndication
                  basicDealDetails={basicDealDetails}
                  writeUpData={writeUpData}
                />
              </CardContent>
            </Card> */}

            <Card id="business-overview" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataBusinessOverview
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>

            <Card id="key-metrics" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataKeyMetricsNew
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>

            <Card id="financial-highlights" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataFinancialHighlights
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>
            {/* 
            <Box id="trends" sx={{ scrollMarginTop: 96 }}>
              <IPOWriteUpMetaDataTrends basicDealDetails={basicDealDetails} />
            </Box> */}

            <Card id="comps" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataComps basicDealDetails={basicDealDetails} />
              </CardContent>
            </Card>

            <Card id="valuation-analysis" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataValuationAnalysis
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>

            <Card id="red-flag" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataRedFlag
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>

            <Card id="final-verdict" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <IPOWriteUpMetaDataFinalVerdict
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  )
}

export default FebIPOWriteUpDashboardMain
