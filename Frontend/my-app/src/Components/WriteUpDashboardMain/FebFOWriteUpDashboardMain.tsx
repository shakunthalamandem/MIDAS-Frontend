import CheckIcon from "@mui/icons-material/Check"
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Typography
} from "@mui/material"
import { useCallback, useEffect, useMemo, useState } from "react"
import { BasicDealDetails } from "./types/DealInformation"
import { FOWriteUpApiResponse } from "./types/FOWriteUpData"

import FOWriteUpMetaDataAIIndication from "./FoWriteUpMetaData/FOWriteUpMetaDataAIIndication"
import FOWriteUpMetaDataBusinessOverview from "./FoWriteUpMetaData/FOWriteUpMetaDataBusinessOverview"
import FOWriteUpMetaDataComps from "./FoWriteUpMetaData/FOWriteUpMetaDataComps"
import FOWriteUpMetaDataDealInfo from "./FoWriteUpMetaData/FOWriteUpMetaDataDealInfo"
import FOWriteUpMetaDataFinancialHighlights from "./FoWriteUpMetaData/FOWriteUpMetaDataFinancialHighlights"
import FOWriteUpMetaDataInvestmentHighlights from "./FoWriteUpMetaData/FOWriteUpMetaDataInvestmentHighlights"
import FOWriteUpMetaDataKeyRisks from "./FoWriteUpMetaData/FOWriteUpMetaDataKeyRisks"
import FOWriteUpMetaDataValuationAnalysis from "./FoWriteUpMetaData/FOWriteUpMetaDataValuationAnalysis"
import FebFOWriteUpPdfContent from "./FebFOWriteUpPdfContent"
import FEBFOWriteUpPdfExporter from "./FEBFOWriteUpPdfExporter"

interface FebFOWriteUpDashboardMainProps {
  basicDealDetails: BasicDealDetails
}


const FebFOWriteUpDashboardMain: React.FC<FebFOWriteUpDashboardMainProps> = ({
  basicDealDetails
}) => {
  const [foWriteUpData, setFoWriteUpData] = useState<FOWriteUpApiResponse | null>(null);
  const [foDataLoading, setFoDataLoading] = useState(false);

  // Fetch FO WriteUp details via POST API
  const fetchFoWriteUpData = useCallback(async () => {
    const { ticker } = basicDealDetails;
    if (!ticker) return;

    setFoDataLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/api/fo_writeup_details/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker }),
      });

      if (response.ok) {
        const data = await response.json();
        setFoWriteUpData(data);
      } else {
        console.error("Failed to fetch FO writeup data");
      }
    } catch (error) {
      console.error("Error fetching FO writeup data:", error);
    } finally {
      setFoDataLoading(false);
    }
  }, [basicDealDetails]);

  useEffect(() => {
    fetchFoWriteUpData();
  }, [fetchFoWriteUpData]);


  const sections = useMemo(
    () => [
      { id: "deal-info", label: "Deal Info" },
      { id: "ai-indication", label: "Proprietary Model Indication" },
      { id: "business-overview", label: "Business Overview" },
      { id: "key-risks", label: "Key Risks" },
      { id: "investment-highlights", label: "Investment Highlights" },
      { id: "valuation-analysis", label: "Valuation Analysis" },
      { id: "financial-highlights", label: "Financial Highlights" },
      { id: "comps", label: "Comparative Multiples" },
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
            FO Write-up
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <FEBFOWriteUpPdfExporter
              targetId={pdfRootId}
              headerTitle="IPO Write-up"
              fileName={pdfFileName}
              onTogglePdfMode={setPdfMode}
              buttonLabel="Generate Monashee PDF"
              loadingLabel="Generating..."
              className="pdf-hidden"
              ticker={basicDealDetails?.ticker}
              pricingDate={foWriteUpData?.deal_information?.pricing_date || basicDealDetails?.pricing_date}
              issuerName={foWriteUpData?.deal_information?.company_name || basicDealDetails?.issuer_name}
              exchange={foWriteUpData?.deal_information?.exchange || basicDealDetails?.exchange}
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
          <FebFOWriteUpPdfContent
            basicDealDetails={basicDealDetails}
            sectionCardSx={sectionCardSx}
            rootId={pdfRootId}
            foWriteUpData={foWriteUpData}
          />
        ) : foDataLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Card id="deal-info" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <FOWriteUpMetaDataDealInfo
                  ticker={basicDealDetails.ticker}
                  tradingDetails={{ ...foWriteUpData?.trading_details, pricing_date: foWriteUpData?.deal_information?.pricing_date }}
                  sharePricePerformance={foWriteUpData?.share_price_performance}
                  useOfProceeds={foWriteUpData?.deal_information?.use_of_proceeds}
                  trackRecord={foWriteUpData?.deal_information?.track_record}
                  onUpdate={fetchFoWriteUpData}
                />
              </CardContent>
            </Card>

            <Card id="ai-indication" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <FOWriteUpMetaDataAIIndication
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>

            <Card id="business-overview" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <FOWriteUpMetaDataBusinessOverview
                  ticker={basicDealDetails.ticker}
                  data={foWriteUpData?.business_details}
                  onUpdate={fetchFoWriteUpData}
                />
              </CardContent>
            </Card>

            <Card id="key-risks" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <FOWriteUpMetaDataKeyRisks
                  ticker={basicDealDetails.ticker}
                  data={foWriteUpData?.key_risks}
                  onUpdate={fetchFoWriteUpData}
                />
              </CardContent>
            </Card>

            <Card id="investment-highlights" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <FOWriteUpMetaDataInvestmentHighlights
                  ticker={basicDealDetails.ticker}
                  data={foWriteUpData?.investment_highlights}
                  onUpdate={fetchFoWriteUpData}
                />
              </CardContent>
            </Card>

            <Card id="valuation-analysis" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <FOWriteUpMetaDataValuationAnalysis
                  ticker={basicDealDetails.ticker}
                  data={foWriteUpData?.valuation_writeup}
                  onUpdate={fetchFoWriteUpData}
                />
              </CardContent>
            </Card>

            <Card id="financial-highlights" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <FOWriteUpMetaDataFinancialHighlights
                  basicDealDetails={basicDealDetails}
                />
              </CardContent>
            </Card>

            <Card id="comps" sx={sectionCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <FOWriteUpMetaDataComps basicDealDetails={basicDealDetails} />
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  )
}

export default FebFOWriteUpDashboardMain
