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
import { cardColors, formatDate } from "./UtilsIPODashboard";
import introImage from "../../Assets/images/monashee_page1.png";
import outroImage from "../../Assets/images/Disclaimer.jpg";
import monasheeLogo from "../../Assets/images/monashee_logo.png";
import IPODashboardPage1 from "./IPODashboardMain/IPODashboardPage1";
import IPODashboardPage2 from "./IPODashboardMain/IPODashboardPage2";
import IPODashboardPage3 from "./IPODashboardMain/IPODashboardPage3";
import IPODashboardPage4 from "./IPODashboardMain/IPODashboardPage4";
import EditableCard from "./Hooks/EditableCard";
import WriteUpIPODashbaord from "../IPOwriteUp/IPOWriteUpDashboard/WriteUpIPODashbaord";
import NoDataPopup from "../../Pages/NoDataPopup";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";



interface TickerOption {
  ticker_name: string;
  pricing_date: string;
}



const IPODashboardMain: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const [ipoData, setIpoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [allIpoTickers, setAllIpoTickers] = useState<TickerOption[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(ticker || "");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string[]>>({});
  const [showAIComparison, setShowAIComparison] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});
  const location = useLocation();
const fromTickerClick = location.state?.fromTickerClick || false;
const [noDataPopupOpen, setNoDataPopupOpen] = useState(false);
const navigate = useNavigate();




  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });
  const handleNoDataConfirm = () => {
  navigate("/equity/ipo_dashboard", { replace: true });
};

useEffect(() => {
  if (ticker) {
    setSearchText(ticker);
  }
}, [ticker]);


useEffect(() => {
  const fetchAllIpoTickers = async () => {
    try {
      const savedTicker = localStorage.getItem("selected_ticker");

      if (ticker) {
        setSelectedTicker(ticker);
      } else if (savedTicker) {
        setSelectedTicker(savedTicker);
      }

      const response = await fetch(`${apiUrl}/api/ipo_dashboard_tickers/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch IPO tickers");
      const data = await response.json();
      setAllIpoTickers(data || []);
    } catch (err) {
      console.error("Ticker fetch failed", err);
    }
  };
  fetchAllIpoTickers();
}, [ticker]);

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

        if (!response.ok) {
  if (fromTickerClick) {
    setNoDataPopupOpen(true);
  }
  throw new Error("Failed to fetch IPO data");
}

;
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


// Generate the Monashee PDF report


// Export with dynamic pagination so variable content fits into the PDF cleanly
const handleExportPDFPaginated = async () => {
  setPdfLoading(true);

  const pages = ["ipo-dashboard-page1", "ipo-dashboard-page2", "ipo-dashboard-page3", "ipo-dashboard-page4"];

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const waitForDOMUpdate = (delay = 300) => new Promise<void>((resolve) => setTimeout(resolve, delay));

  try {
    // Compute data-as-of text
    let dataAsOfText = "";
    if (ipoData?.pricing_date) {
      const cleanDateStr = ipoData.pricing_date.replace(/(\d+)(st|nd|rd|th)/, "$1");
      const dateObj = new Date(cleanDateStr);
      const month = dateObj.toLocaleString("default", { month: "short" });
      const year = dateObj.getFullYear();
      dataAsOfText = `${month} ${year}`;
    }

    // Preload logo
    const logoImg = new Image();
    logoImg.src = monasheeLogo;
    await new Promise<void>((resolve) => { logoImg.onload = () => resolve(); });

    // Intro page
    const introImg = new Image();
    introImg.src = introImage;
    await new Promise<void>((resolve) => {
      introImg.onload = () => {
        // Use PNG and no fast compression to preserve HD quality
        pdf.addImage(introImg, "PNG", 0, 0, pdfWidth, pdfHeight);

        const margin = 10;
        const color = [0, 32, 96];
        if (ipoData?.company_name && ipoData?.exchange && ipoData?.ticker_name) {
          const companyName = ipoData.company_name;
          const exchangeTicker = `(${ipoData.exchange}: ${ipoData.ticker_name})`;
          const pricingDate = ipoData.pricing_date;
          const startY = 40;
          pdf.setFontSize(20);
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.text(companyName, pdfWidth - margin - pdf.getTextWidth(companyName), startY);
          pdf.setFontSize(18);
          pdf.text(exchangeTicker, pdfWidth - margin - pdf.getTextWidth(exchangeTicker), startY + 14);
          if (pricingDate) {
            pdf.setFontSize(12);
            pdf.text(pricingDate, pdfWidth - margin - pdf.getTextWidth(pricingDate), startY + 28);
          }
        }
        resolve();
      };
    });

    // Expand accordions for full capture
    const originalPanels = { ...expandedPanels };
    const allKeys = Object.keys(editedContent);
    const expandedAll: Record<string, boolean> = {};
    allKeys.forEach((key) => (expandedAll[key] = true));
    setExpandedPanels(expandedAll);
    await waitForDOMUpdate(500);

    const drawHeader = () => {
      const logoWidth = 40; // mm
      const logoHeight = 12; // mm
      const logoX = pdfWidth - logoWidth - 10;
      const logoY = 10;
      pdf.addImage(logoImg, "JPEG", logoX, logoY, logoWidth, logoHeight, undefined, "FAST");
      const lineY = logoY + logoHeight + 2;
      pdf.setDrawColor(0, 32, 96);
      pdf.setLineWidth(1);
      pdf.line(10, lineY, pdfWidth - 10, lineY);
      return lineY + 5;
    };

    const drawFooter = () => {
      const marginX = 10;
      const footerTextTopY = pdfHeight - 22;
      // Blue line at the top of the footer
      pdf.setDrawColor(0, 32, 96);
      pdf.setLineWidth(1);
      pdf.line(marginX, footerTextTopY - 4, pdfWidth - marginX, footerTextTopY - 4);
      // Footer text
      pdf.setFontSize(7);
      pdf.setTextColor(100);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Data as of ${dataAsOfText}. Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`,
        marginX,
        footerTextTopY,
        { maxWidth: pdfWidth - marginX * 2 }
      );
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(128);
      pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, pdfHeight - 10, { align: "center" });
    };

    for (let i = 0; i < pages.length; i++) {
      const element = document.getElementById(pages[i]);
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imageWidthMm = pdfWidth; // fill page width
      const mmPerPx = imageWidthMm / canvas.width;
      const headerTopY = (() => {
        const logoHeight = 12;
        const logoY = 10;
        const lineY = logoY + logoHeight + 2;
        return lineY + 5;
      })();
      const footerReserveMm = 28;
      const availableHeightMm = Math.max(10, pdfHeight - headerTopY - footerReserveMm);
      const availableHeightPx = availableHeightMm / mmPerPx;

      let yOffsetPx = 0;
      while (yOffsetPx < canvas.height) {
        const sliceHeightPx = Math.min(availableHeightPx, canvas.height - yOffsetPx);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceHeightPx);
        const ctx = sliceCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            yOffsetPx,
            canvas.width,
            sliceHeightPx,
            0,
            0,
            canvas.width,
            sliceHeightPx
          );
        }
        const sliceImg = sliceCanvas.toDataURL("image/jpeg", 0.9);

        pdf.addPage();
        const contentTopY = drawHeader();
        const sliceHeightMm = (sliceHeightPx as number) * mmPerPx;
        pdf.addImage(sliceImg, "JPEG", 0, contentTopY, imageWidthMm, sliceHeightMm, undefined, "FAST");
        drawFooter();

        yOffsetPx += sliceHeightPx;

      }
    }

    // Restore accordions
    setExpandedPanels(originalPanels);
    await waitForDOMUpdate();

    // Outro page (render disclaimer text instead of image)
    pdf.addPage();
    const marginX = 12;
    // Header
    const headerLogoWidth = 40;
    const headerLogoHeight = 12;
    const headerLogoX = pdfWidth - headerLogoWidth - 10;
    const headerLogoY = 10;
    const logoImgFinal = new Image();
    logoImgFinal.src = monasheeLogo;
    await new Promise<void>((resolve) => { logoImgFinal.onload = () => resolve(); });
    pdf.addImage(logoImgFinal, "JPEG", headerLogoX, headerLogoY, headerLogoWidth, headerLogoHeight, undefined, "FAST");
    const headerLineY = headerLogoY + headerLogoHeight + 2;
    pdf.setDrawColor(0, 32, 96);
    pdf.setLineWidth(1);
    pdf.line(10, headerLineY, pdfWidth - 10, headerLineY);

    // Title
    const titleY = headerLineY + 6; // keep title closer to header area
    pdf.setTextColor(0, 32, 96);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Disclaimer", marginX, titleY);
    // Removed extra underline to avoid double lines at top

    // Body text
    const bodyY = titleY + 10;
    const disclaimerText =
      "This report is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation of an offer to buy any security. Data is derived from sources believed to be reliable, including company filings and management, but is not guaranteed for accuracy or completeness. Opinions and estimates reflect our judgment as of the date of this material and are subject to change without notice. Past performance is not indicative of future results. Investing involves risk, including the possible loss of principal.\n\n" +
      "This document is confidential and intended solely for the designated recipient. Distribution, reproduction, or disclosure, in whole or in part, without the prior written consent of Monashee Investment Management is strictly prohibited. Any projections, forecasts, or forward-looking statements are inherently uncertain and actual outcomes may differ materially.\n\n" +
      "By accepting this document, you agree to maintain its confidentiality and to use it only for the purpose for which it was provided. Do not copy. Do not distribute.";

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(60);
    pdf.text(disclaimerText, marginX, bodyY, { maxWidth: pdfWidth - marginX * 2 });

    // Footer with blue line at top
    const footerTextTopY2 = pdfHeight - 22;
    pdf.setDrawColor(0, 32, 96);
    pdf.setLineWidth(1);
    pdf.line(10, footerTextTopY2 - 4, pdfWidth - 10, footerTextTopY2 - 4);
    pdf.setFontSize(7);
    pdf.setTextColor(100);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Data as of ${dataAsOfText}. Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`,
      marginX,
      footerTextTopY2,
      { maxWidth: pdfWidth - marginX * 2 }
    );
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(128);
    pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, pdfHeight - 10, { align: "center" });

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

  return (
    <>
    <NoDataPopup
  open={noDataPopupOpen}
  onClose={() => setNoDataPopupOpen(false)}
  onConfirm={handleNoDataConfirm}
/>

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

      <WriteUpIPODashbaord />

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
  handleExportPDF={handleExportPDFPaginated}
  pdfLoading={pdfLoading}
/>

<IPODashboardPage2
  ipoData={ipoData}
  selectedTicker={selectedTicker || ""}
  setIpoData={setIpoData}
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
