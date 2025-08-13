import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Box,
  Typography,
  CircularProgress,

} from "@mui/material";
import { useParams } from "react-router-dom";

import axios from "axios";
import { cardColors } from "./UtilsIPODashboard";
import introImage from "../../Assets/images/monashee_page1.png";
import outroImage from "../../Assets/images/monashee_pdf_footer.jpg";
import monasheeLogo from "../../Assets/images/monashee_logo.png";
import IPODashboardPage1 from "./IPODashboardMain/IPODashboardPage1";
import IPODashboardPage2 from "./IPODashboardMain/IPODashboardPage2";
import IPODashboardPage3 from "./IPODashboardMain/IPODashboardPage3";
import IPODashboardPage4 from "./IPODashboardMain/IPODashboardPage4";
import EditableCard from "./Hooks/EditableCard";


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
    // ✅ Prepare dynamic "Data as of" text
    let dataAsOfText = "";
    if (ipoData?.pricing_date) {
      const dateObj = new Date(ipoData.pricing_date);
      const month = dateObj.toLocaleString("default", { month: "short" }); // "Aug"
      const year = dateObj.getFullYear(); // 2025
      dataAsOfText = `${month} ${year}`;
    }

    // ✅ Load Logo
    const logoImg = new Image();
    logoImg.src = monasheeLogo;
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
    });

    // ✅ Add Front Page
    const introImg = new Image();
    introImg.src = introImage;

    await new Promise<void>((resolve) => {
      introImg.onload = () => {
        pdf.addImage(introImg, "JPEG", 0, 0, pdfWidth, pdfHeight);

        const margin = 10;
        const color = [0, 32, 96];

        if (ipoData?.company_name && ipoData?.exchange && ipoData?.ticker_name) {
          const companyName = ipoData.company_name;
          const exchangeTicker = `(${ipoData.exchange}: ${ipoData.ticker_name})`;
          const pricingDate = ipoData.pricing_date;

          const startY = 40;

      // Company Name
      pdf.setFontSize(16);
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(
        companyName,
        pdfWidth - margin - pdf.getTextWidth(companyName),
        startY
      );

      // Exchange and Ticker
      pdf.setFontSize(16);
      pdf.text(
        exchangeTicker,
        pdfWidth - margin - pdf.getTextWidth(exchangeTicker),
        startY + 12 // You can tweak this too
      );

      // Pricing Date
      if (pricingDate) {
        pdf.setFontSize(11);
        pdf.text(
          pricingDate,
          pdfWidth - margin - pdf.getTextWidth(pricingDate),
          startY + 24
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

      const logoWidth = 40;
      const logoHeight = 12;
      const logoX = pdfWidth - logoWidth - 10;
      const logoY = 10;

      pdf.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

      const lineY = logoY + logoHeight + 2;
      pdf.setDrawColor(0, 32, 96);
      pdf.setLineWidth(1);
      pdf.line(10, lineY, pdfWidth - 10, lineY);

      const marginTop = lineY + 5;
      const imageWidth = pdfWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, marginTop, imageWidth, imageHeight);

      // ✅ Footer with dynamic date
      const footerY = pdfHeight - 20;
      pdf.setFontSize(6);
      pdf.setTextColor(100);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        ` Data as of ${dataAsOfText} Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`,
        10,
        footerY,
        { maxWidth: pdfWidth - 20 }
      );

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(128);
      pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, pdfHeight - 10, { align: "center" });
    }

    // ✅ Restore original accordion states
    setExpandedPanels(originalPanels);
    await waitForDOMUpdate();

    // ✅ Outro Page with same footer
    const outroImg = new Image();
    outroImg.src = outroImage;
    await new Promise<void>((resolve) => {
      outroImg.onload = () => {
        pdf.addPage();
        pdf.addImage(outroImg, "JPEG", 0, 0, pdfWidth, pdfHeight);

        const footerY = pdfHeight - 20;
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          ` Data as of ${dataAsOfText} Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`,
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
  renderEditableCard={(section, index) => (
    <EditableCard
      section={section}
      index={index}
      cardColors={cardColors}
      ipoData={ipoData}
      editMode={editMode}
      editedContent={editedContent}
      expandedPanels={expandedPanels}
      setExpandedPanels={setExpandedPanels}
      setEditMode={setEditMode}
      handleSaveCard={handleSaveCard}
      handleCancelCard={handleCancelCard}
      handleAddItem={handleAddItem}
      handleDeleteItem={handleDeleteItem}
      handleItemChange={handleItemChange}
    />
  )}
/>
<IPODashboardPage3
  renderEditableCard={(section, index) => (
    <EditableCard
      section={section}
      index={index}
      cardColors={cardColors}
      ipoData={ipoData}
      editMode={editMode}
      editedContent={editedContent}
      expandedPanels={expandedPanels}
      setExpandedPanels={setExpandedPanels}
      setEditMode={setEditMode}
      handleSaveCard={handleSaveCard}
      handleCancelCard={handleCancelCard}
      handleAddItem={handleAddItem}
      handleDeleteItem={handleDeleteItem}
      handleItemChange={handleItemChange}
    />
  )}
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
