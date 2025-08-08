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
import { cardColors } from "./UtilsIPODashboard";
import introImage from "../../Assets/images/monashee_page1.png";
import outroImage from "../../Assets/images/monashee_pdf_footer.jpg";
import monasheeLogo from "../../Assets/images/monashee_logo.png";
import IPODashboardPage1 from "./IPODashboardMain/IPODashboardPage1";
import IPODashboardPage2 from "./IPODashboardMain/IPODashboardPage2";
import IPODashboardPage3 from "./IPODashboardMain/IPODashboardPage3";
import IPODashboardPage4 from "./IPODashboardMain/IPODashboardPage4";


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

  const pages = ["ipo-dashboard-page1", "ipo-dashboard-page2", "ipo-dashboard-page3", "ipo-dashboard-page4"];

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

    // ✅ Add Front Page (Intro image + formatted text)
    const introImg = new Image();
    introImg.src = introImage;

    await new Promise<void>((resolve) => {
      introImg.onload = () => {
        pdf.addImage(introImg, "JPEG", 0, 0, pdfWidth, pdfHeight);

        const margin = 10;
        const color = [0, 32, 96]; // #002060

        if (ipoData?.company_name && ipoData?.exchange && ipoData?.ticker_name) {
          const companyName = ipoData.company_name;
          const exchangeTicker = `(${ipoData.exchange}: ${ipoData.ticker_name})`;
          const pricingDate = ipoData.pricing_date
      

          const startY = 20;

          // Company Name
          pdf.setFontSize(18);
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.text(
            companyName,
            pdfWidth - margin - pdf.getTextWidth(companyName),
            startY
          );

          // Exchange and Ticker
          pdf.setFontSize(18);
          pdf.text(
            exchangeTicker,
            pdfWidth - margin - pdf.getTextWidth(exchangeTicker),
            startY + 10
          );

          // Pricing Date
          if (pricingDate) {
            pdf.setFontSize(12);
            pdf.text(
              pricingDate,
              pdfWidth - margin - pdf.getTextWidth(pricingDate),
              startY + 20
            );
          }
        }

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

    // ✅ Render each dashboard page
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

      pdf.addPage();

      // ➤ Logo top-right
      const logoWidth = 40;
      const logoHeight = 12;
      const logoX = pdfWidth - logoWidth - 10;
      const logoY = 10;

      pdf.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

      // ➤ Blue line below logo
      const lineY = logoY + logoHeight + 2;
      pdf.setDrawColor(0, 32, 96);
      pdf.setLineWidth(1);
      pdf.line(10, lineY, pdfWidth - 10, lineY);

      // ➤ Add canvas image
      const marginTop = lineY + 5;
      const imageWidth = pdfWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, marginTop, imageWidth, imageHeight);

      // ➤ Add footer
      const footerY = pdfHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Data as of  2025. Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.",
        10,
        footerY,
        { maxWidth: pdfWidth - 20 }
      );

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(128);
      pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, pdfHeight - 10, { align: "center" });
    }

    // ✅ Restore original accordion states
    setExpandedPanels(originalPanels);
    await waitForDOMUpdate();

    // ✅ Outro Page
    const outroImg = new Image();
    outroImg.src = outroImage;
    await new Promise<void>((resolve) => {
      outroImg.onload = () => {
        pdf.addPage();
        pdf.addImage(outroImg, "JPEG", 0, 0, pdfWidth, pdfHeight);

        // ➤ Add footer
        const footerY = pdfHeight - 20;
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          "Data as of  2025. Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.",
          10,
          footerY,
          { maxWidth: pdfWidth - 20 }
        );

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(128);
        pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, pdfHeight - 10, { align: "center" });

        resolve();
      };
    });

    // ✅ Save the PDF
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
          <IPODashboardPage1
  ipoData={ipoData}
  allIpoTickers={allIpoTickers}
  selectedTicker={selectedTicker || ""}
  searchText={searchText}
  setSelectedTicker={setSelectedTicker}
  setSearchText={setSearchText}
  handleExportPDF={handleExportPDF}
  pdfLoading={pdfLoading}
/>

<IPODashboardPage2
  ipoData={ipoData}
  selectedTicker={selectedTicker || ""}
  setIpoData={setIpoData}
  renderEditableCard={renderEditableCard}
/>

<IPODashboardPage3
  renderEditableCard={renderEditableCard}
/>

<IPODashboardPage4
  selectedTicker={selectedTicker || ""}
  ipoData={ipoData}
  showAIComparison={showAIComparison}
  handleAIComparisonClick={handleAIComparisonClick}
/>

          </>
        )}
      </Box>
    </>
  );
};

export default IPODashboardMain;
