import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useParams } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

import IPODashboardHeader from "./IPODashboardHeader";
import IPODashboardCardRatings from "./IPODashboardCardRatings";
import FinancialForecastTable from "./IPOFinancialTableMain";
import IPODashboardMainTable from "./IPODashboardMainTable";
import { cardColors, cardSections, cardStyle } from "./UtilsIPODashboard";
import IPOAITickersMain from "./Hooks/IPOAITickersMain";
import introImage from "../../Assets/images/frontend_page.jpg";
import outroImage from "../../Assets/images/footer_lastpage.jpg";
import monasheeLogo from "../../Assets/images/monashee_logo.png";


const getOrdinalSuffix = (n: number): string => {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
};

const IPODashboardMain: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const [ipoData, setIpoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [allIpoTickers, setAllIpoTickers] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(ticker || "");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string[]>>({});
  const [showAIComparison, setShowAIComparison] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  useEffect(() => {
    const fetchAllIpoTickers = async () => {
      try {
        const savedTicker = localStorage.getItem("selected_ticker");
        setSelectedTicker(savedTicker || "");
        const response = await fetch(`${apiUrl}/api/ipo_dashboard_tickers/`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch IPO tickers");
        const data = await response.json();
        setAllIpoTickers(data.distinct_tickers || []);
      } catch (err) {
        console.error("Ticker fetch failed", err);
      }
    };
    fetchAllIpoTickers();
  }, []);

  const handleAIComparisonClick = () => {
    setShowAIComparison(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ ticker: selectedTicker || "" }),
        });

        if (!response.ok) throw new Error("Failed to fetch IPO data");
        const jsonData = await response.json();

        const dateFields = ["pricing_date", "filed_date", "term_date", "trade_date"];
        const formattedData = { ...jsonData };
        dateFields.forEach((field) => {
          if (formattedData[field]) {
            formattedData[field] = formatDate(formattedData[field]);
          }
        });

        const keys = [
          "business_overview",
          "key_highlights",
          "strengths",
          "concerns",
          "principal_stockholders_preipo",
          "key_management_personnel",
        ];

        const editModes: Record<string, boolean> = {};
        const contents: Record<string, string[]> = {};
        keys.forEach((key) => {
          editModes[key] = false;
          const fieldValue = formattedData[key];
          if (typeof fieldValue === "string") {
            contents[key] = fieldValue
              .split("\n")
              .map((line: string) => line.replace(/^•\s*/, "").trim())
              .filter(Boolean);
          } else {
            contents[key] = Array.isArray(fieldValue) ? fieldValue : [];
          }
        });

        setEditMode(editModes);
        setEditedContent(contents);
        setIpoData(formattedData);
      } catch (err) {
        console.error("IPO data fetch failed", err);
        setError("Failed to fetch IPO data");
      } finally {
        setLoading(false);
      }
    };

    if (selectedTicker) fetchData();
  }, [selectedTicker]);
const handleExportPDF = async () => {
  setPdfLoading(true);

  const pages = ["ipo-dashboard-page1", "ipo-dashboard-page2", "ipo-dashboard-page3","ipo-dashboard-page4"];

const pdf = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4",
});


  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const waitForDOMUpdate = (delay = 300) =>
    new Promise<void>((resolve) => setTimeout(resolve, delay));

  try {
    // ✅ Load Logo
    const logoImg = new Image();
    logoImg.src = monasheeLogo;
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
    });

    // ✅ Add Front Page (no logo)
    const introImg = new Image();
    introImg.src = introImage;
    await new Promise<void>((resolve) => {
      introImg.onload = () => {
        pdf.addImage(introImg, "JPEG", 0, 0, pdfWidth, pdfHeight);
        resolve();
      };
    });

    // ✅ Expand all accordions
    const originalPanels = { ...expandedPanels };
    const allKeys = Object.keys(editedContent);
    const expandedAll: Record<string, boolean> = {};
    allKeys.forEach((key) => (expandedAll[key] = true));
    setExpandedPanels(expandedAll);
    await waitForDOMUpdate(500);

    // ✅ Render each page with logo + line + content below
    for (let i = 0; i < pages.length; i++) {
      const element = document.getElementById(pages[i]);
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      // ➤ Draw on new page
      pdf.addPage();

      // ➤ Add logo top-right
      const logoWidth = 40;
      const logoHeight = 12;
      const logoX = pdfWidth - logoWidth - 10;
      const logoY = 10;

      pdf.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

      // ➤ Draw blue line under logo
      const lineY = logoY + logoHeight + 2;
      pdf.setDrawColor(0, 32, 96); // Monashee blue
      pdf.setLineWidth(1);
      pdf.line(10, lineY, pdfWidth - 10, lineY);

      // ➤ Content below the blue line
      const marginTop = lineY + 5; // give extra space after line

      // Calculate image size
      const imageWidth = pdfWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, marginTop, imageWidth, imageHeight);
    }

    // ✅ Restore original accordion state
    setExpandedPanels(originalPanels);
    await waitForDOMUpdate();

    // ✅ Outro Page (no logo)
    const outroImg = new Image();
    outroImg.src = outroImage;
    await new Promise<void>((resolve) => {
      outroImg.onload = () => {
        pdf.addPage();
        pdf.addImage(outroImg, "JPEG", 0, 0, pdfWidth, pdfHeight);
        resolve();
      };
    });

    pdf.save(`${selectedTicker}_IPO_Report.pdf`);
  } catch (error) {
    console.error("PDF export failed", error);
  } finally {
    setPdfLoading(false);
  }
};

  const handleSaveCard = async (key: string) => {
    try {
      const cleaned = editedContent[key].filter((item) => item.trim() !== "");
      const formatted = cleaned.map((item) => `• ${item}`).join("\n");
      const payload = { ticker_name: selectedTicker, [key]: formatted };
      await axios.patch(`${apiUrl}/api/writeup_data/`, payload, { headers: getAuthHeaders() });

      setIpoData((prev: any) => ({ ...prev, [key]: cleaned }));
      setEditMode((prev) => ({ ...prev, [key]: false }));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  const handleCancelCard = (key: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [key]: ipoData[key] || [],
    }));
    setEditMode((prev) => ({ ...prev, [key]: false }));
  };

  const handleAddItem = (key: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
  };

  const handleDeleteItem = (key: string, index: number) => {
    setEditedContent((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (key: string, index: number, value: string) => {
    const updated = [...editedContent[key]];
    updated[index] = value;
    setEditedContent((prev) => ({ ...prev, [key]: updated }));
  };

  const renderEditableCard = (section: any, index: number) => {
    const key = section.key;
    const content = ipoData[key];
    const isEditing = editMode[key];
    const isExpanded = expandedPanels[key] || false;

    return (
      <Grid item xs={12} key={key}>
        <Accordion
          expanded={isExpanded}
          onChange={() =>
            setExpandedPanels((prev) => ({ ...prev, [key]: !prev[key] }))
          }

          sx={{
            backgroundColor: cardColors[index % cardColors.length],
            borderRadius: 2,
            boxShadow: 3,
            "&::before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${key}-header`}>
            <Typography variant="h6" sx={{ color: "#002060", fontWeight: "bold", flex: 1 }}>
              {section.title}
            </Typography>
            {isEditing ? (
              <>
                <IconButton color="primary" onClick={() => handleSaveCard(key)} size="small">
                  <SaveIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleCancelCard(key)} size="small">
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => setEditMode((prev) => ({ ...prev, [key]: true }))} size="small">
              <EditIcon fontSize="small" />
              </IconButton>
            )}
          </AccordionSummary>

          <AccordionDetails>
            {isEditing ? (
              <Box>
                {editedContent[key]?.map((item, idx) => (
                  <Box key={idx} display="flex" alignItems="flex-start" mb={1}>
                    <Box sx={{ mr: 1, mt: 1 }}>
                      <FiberManualRecordIcon sx={{ fontSize: 8, color: "#002060" }} />
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      size="small"
                      value={item}
                      onChange={(e) => handleItemChange(key, idx, e.target.value)}
                      placeholder="Enter text..."
                      sx={{ mr: 1 }}
                    />
                    <IconButton color="error" onClick={() => handleDeleteItem(key, idx)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button startIcon={<AddIcon />} onClick={() => handleAddItem(key)} variant="outlined" size="small" sx={{ mt: 1 }}>
                  Add Item
                </Button>
              </Box>
            ) : (
              <List dense>
                {content?.map((item: string, idx: number) => (
                  <ListItem key={idx} sx={{ pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24, mt: "5px" }}>
                      <FiberManualRecordIcon sx={{ fontSize: 8, color: "#002060" }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "40px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to detailed Insights on IPO - {selectedTicker}
      </Typography>

      

      <Box sx={{ px: 2 }}>
        {ipoData && (
          <>
            <div id="ipo-dashboard-page1">
              <IPODashboardHeader
              ipoData={ipoData}
              allIpoTickers={allIpoTickers}
              selectedTicker={selectedTicker}
              searchText={searchText}
              setSelectedTicker={setSelectedTicker}
              setSearchText={setSearchText}
              onExportPDF={handleExportPDF}
              pdfLoading={pdfLoading}
            />
                        </div>

                            <div id="ipo-dashboard-page2">

              <IPODashboardCardRatings
                ipodata={ipoData}
                selectedTicker={selectedTicker || ""}
                setIpoData={setIpoData}
              />
                            <Container maxWidth="xl" sx={{ mb: 3 }}>

                   <Grid container spacing={2} sx={{ mb: 3 }}>
                  {cardSections.slice(0, 2).map((section, index) => (
                    <Grid item xs={12} md={6} key={section.key}>
                      {renderEditableCard(section, index)}
                    </Grid>
                  ))}
                </Grid>
                              </Container>

            </div>

            <div id="ipo-dashboard-page3">
              <Container maxWidth="xl" sx={{ mb: 3 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {cardSections.slice(2, 6).map((section, index) => (
                    <Grid item xs={12} md={6} key={section.key}>
                      {renderEditableCard(section, index)}
                    </Grid>
                  ))}
                </Grid>
                               {/* {cardSections.slice(4, 6).map((section, index) => (
                    <Grid item xs={12} md={6} key={section.key}>
                      {renderEditableCard(section, index + 4)}
                    </Grid>
                  ))} */}
              </Container>
            </div>

            <div id="ipo-dashboard-page4">
              <Container maxWidth="xl" sx={{ mb: 3 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
   
                  <Grid item xs={12} >
                    <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                      <FinancialForecastTable defaultTicker={selectedTicker || ""} />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ backgroundColor: "#f4f5f7", p: 2 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleAIComparisonClick}
                        sx={{ mb: 2 }}
                      >
                        AI Comparison
                      </Button>
                      <Typography variant="body1" gutterBottom color="#02517e">
                        AI Suggested Comparable Tickers
                      </Typography>
                      {showAIComparison && (
                        <IPOAITickersMain selectedData={ipoData} />
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                      <IPODashboardMainTable ticker={selectedTicker || ""} />
                    </Box>
                    <Typography sx={{ fontStyle: "italic", fontSize: "0.875rem", color: "gray" }}>
                      Source: Factset
                    </Typography>

                    
                  </Grid>
                </Grid>
              </Container>
            </div>
          </>
        )}
      </Box>
    </>
  );
};

export default IPODashboardMain;
