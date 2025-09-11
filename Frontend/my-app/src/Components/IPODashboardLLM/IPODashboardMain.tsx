import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Box, Typography } from "@mui/material";

import axios from "axios";
import { cardColors, formatDate } from "./UtilsIPODashboard";
import introImage from "../../Assets/images/monashee_page1.png";
import monasheeLogo from "../../Assets/images/monashee_logo.png";
import IPODashboardPage1 from "./IPODashboardMain/IPODashboardPage1";
import IPODashboardPage2 from "./IPODashboardMain/IPODashboardPage2";
import IPODashboardPage3 from "./IPODashboardMain/IPODashboardPage3";
import IPODashboardPage4 from "./IPODashboardMain/IPODashboardPage4";
import EditableCard from "./Hooks/EditableCard";
import { useLocation } from "react-router-dom";

interface TickerOption {
  ticker_name: string;
  pricing_date: string;
}
interface IPODashboardMainProps {
  selectedTicker?: string; // Optional: may be passed or derived from URL
}

const IPODashboardMain: React.FC<IPODashboardMainProps> = ({
  selectedTicker,
}) => {
  // const { ticker: urlTicker } = useParams<{ ticker: string }>(); //
  const [ipoData, setIpoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [allIpoTickers, setAllIpoTickers] = useState<TickerOption[]>([]);
  // Manage local ticker state and sync with prop
  const [currentTicker, setCurrentTicker] = useState<string | null>(
    selectedTicker ?? null
  );
  const [pdfLoading, setPdfLoading] = useState(false);
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string[]>>(
    {}
  );
  const [showAIComparison, setShowAIComparison] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
    {}
  );
  const location = useLocation();
  const fromTickerClick = location.state?.fromTickerClick || false;
  const [noDataPopupOpen, setNoDataPopupOpen] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });
  //   const handleNoDataConfirm = () => {
  //   navigate("/equity/ipo_dashboard", { replace: true });
  // };

  // Keep local ticker in sync with incoming prop
  useEffect(() => {
    if (selectedTicker !== undefined) {
      setCurrentTicker(selectedTicker ?? null);
      setSearchText(selectedTicker ?? "");
    }
  }, [selectedTicker]);

  useEffect(() => {
    const fetchAllIpoTickers = async () => {
      try {
        // const savedTicker = localStorage.getItem("selected_ticker");

        // if (selectedTicker) {
        //   // setSelectedTicker(selectedTicker);
        // } else if (savedTicker) {
        //   setSelectedTicker(savedTicker);
        // }

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
    // Fetch tickers once; not dependent on selected ticker
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          body: JSON.stringify({ ticker: currentTicker || "" }),
        });

        if (!response.ok) {
          if (fromTickerClick) {
            setNoDataPopupOpen(true);
          }
          throw new Error("Failed to fetch IPO data");
        }
        const jsonData = await response.json();

        const dateFields = [
          "pricing_date",
          "filed_date",
          "term_date",
          "trade_date",
        ];
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

    if (currentTicker) fetchData();
  }, [currentTicker]);

  // Generate the Monashee PDF report

  // Export with dynamic pagination so variable content fits into the PDF cleanly
  const handleExportPDFPaginated = async () => {
    setPdfLoading(true);

    const pages = [
      "ipo-dashboard-page1",
      "ipo-dashboard-page2",
      "ipo-dashboard-page3",
      "ipo-dashboard-page4",
    ];

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [600, 420],
      compress: true,
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const waitForDOMUpdate = (delay = 300) =>
      new Promise<void>((resolve) => setTimeout(resolve, delay));

    try {
      // Compute data-as-of text
      let dataAsOfText = "";
      if (ipoData?.pricing_date) {
        const cleanDateStr = ipoData.pricing_date.replace(
          /(\d+)(st|nd|rd|th)/,
          "$1"
        );
        const dateObj = new Date(cleanDateStr);
        const month = dateObj.toLocaleString("default", { month: "short" });
        const year = dateObj.getFullYear();
        dataAsOfText = `${month} ${year}`;
      }

      // Preload logo
      const logoImg = new Image();
      logoImg.src = monasheeLogo;
      await new Promise<void>((resolve) => {
        logoImg.onload = () => resolve();
      });

      // Intro page
      const introImg = new Image();
      introImg.src = introImage;
      await new Promise<void>((resolve) => {
        introImg.onload = () => {
          // Use PNG and no fast compression to preserve HD quality
          pdf.addImage(introImg, "PNG", 0, 0, pdfWidth, pdfHeight);

          const margin = 10;
          const color = [0, 32, 96];
          if (
            ipoData?.company_name &&
            ipoData?.exchange &&
            ipoData?.ticker_name
          ) {
            const companyName = ipoData.company_name;
            const exchangeTicker = `(${ipoData.exchange}: ${ipoData.ticker_name})`;
            const pricingDate = ipoData.pricing_date;
            const startY = 40;
            pdf.setFontSize(20);
            pdf.setTextColor(color[0], color[1], color[2]);
            pdf.text(
              companyName,
              pdfWidth - margin - pdf.getTextWidth(companyName),
              startY
            );
            pdf.setFontSize(18);
            pdf.text(
              exchangeTicker,
              pdfWidth - margin - pdf.getTextWidth(exchangeTicker),
              startY + 14
            );
            if (pricingDate) {
              pdf.setFontSize(12);
              pdf.text(
                pricingDate,
                pdfWidth - margin - pdf.getTextWidth(pricingDate),
                startY + 28
              );
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
        pdf.addImage(
          logoImg,
          "JPEG",
          logoX,
          logoY,
          logoWidth,
          logoHeight,
          undefined,
          "FAST"
        );
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
        pdf.line(
          marginX,
          footerTextTopY - 4,
          pdfWidth - marginX,
          footerTextTopY - 4
        );
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
        pdf.text(
          "Do not copy. Do not distribute.",
          pdfWidth / 2,
          pdfHeight - 10,
          { align: "center" }
        );
      };

      // Hide UI controls (IconButtons, expanders) so they don't appear in PDF
      const hiddenEls: Array<{ el: HTMLElement; prev: string }> = [];
      const toHide = document.querySelectorAll<HTMLElement>(
        '.MuiIconButton-root, [data-expander="true"]'
      );
      toHide.forEach((el) => {
        hiddenEls.push({ el, prev: el.style.visibility });
        el.style.visibility = "hidden";
      });

      for (let i = 0; i < pages.length; i++) {
        const element = document.getElementById(pages[i]);
        if (!element) continue;

        // Dynamic scale for sharpness on larger PDF size
        const elRect = element.getBoundingClientRect();
        const elCssWidth = elRect.width || element.scrollWidth || 1024;
        const targetDpi = 180;
        const targetPxWidth = (pdfWidth / 25.4) * targetDpi;
        const dynamicScale = Math.max(
          2,
          Math.min(4, targetPxWidth / elCssWidth)
        );

        const canvas = await html2canvas(element, {
          scale: dynamicScale,
          useCORS: true,
          scrollY: -window.scrollY,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          backgroundColor: "#ffffff",
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
        const availableHeightMm = Math.max(
          10,
          pdfHeight - headerTopY - footerReserveMm
        );
        const availableHeightPx = availableHeightMm / mmPerPx;

        let yOffsetPx = 0;
        while (yOffsetPx < canvas.height) {
          const sliceHeightPx = Math.min(
            availableHeightPx,
            canvas.height - yOffsetPx
          );
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
          const sliceImg = sliceCanvas.toDataURL("image/png");

          pdf.addPage();
          const contentTopY = drawHeader();
          const sliceHeightMm = (sliceHeightPx as number) * mmPerPx;
          pdf.addImage(
            sliceImg,
            "PNG",
            0,
            contentTopY,
            imageWidthMm,
            sliceHeightMm
          );
          drawFooter();

          yOffsetPx += sliceHeightPx;
        }
      }

      // Restore hidden UI controls
      hiddenEls.forEach(({ el, prev }) => (el.style.visibility = prev));
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
      await new Promise<void>((resolve) => {
        logoImgFinal.onload = () => resolve();
      });
      pdf.addImage(
        logoImgFinal,
        "JPEG",
        headerLogoX,
        headerLogoY,
        headerLogoWidth,
        headerLogoHeight,
        undefined,
        "FAST"
      );
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

      // Body text (multi-page safe)
      const bodyY = titleY + 10;
      const disclaimerText =
        "The information contained herein has been compiled by Monashee internally and may be based on unaudited data from the relevant funds' books and records, and hypothetical information that has not been verified or reconciled by such funds' administrator. As such, the information contained herein should not serve as any kind of basis for any investment decision.\n\n" +
        "This document does not constitute advice or a recommendation or offer to sell or a solicitation to deal in any security or financial product. It is provided for information purposes only and on the understanding that the recipient has sufficient knowledge and experience to be able to understand and make their own evaluation of the proposals and services described herein, any risks associated therewith and any related legal, tax, accounting or other material considerations. To the extent that the reader has any questions regarding the applicability of any specific issue discussed above to their specific portfolio or situation, prospective investors are encouraged to contact Monashee Investment Management or consult with the professional advisor of their choosing.\n\n" +
        "Certain information contained herein has been obtained from third party sources and such information has not been independently verified by Monashee Investment Management. No representation, warranty, or undertaking, expressed or implied, is given to the accuracy or completeness of such information by Monashee Investment Management or any other person. While such sources are believed to be reliable. Monashee Investment Management does not assume any responsibility for the accuracy or completeness of such information. Monashee Investment Management does not undertake any obligation to update the information contained herein as of any future date.\n\n" +
        "Except where otherwise indicated, the information contained in this presentation is based on matters as they exist as of the date of preparation of such material and not as of the date of distribution or any future date. Recipients should not rely on this material in making any future investment decision.\n\n" +
        "This presentation is confidential, is intended only for the person to whom it has been directly provided and under no circumstances may a copy be shown, copied, transmitted or otherwise be given to any person other than the authorized recipient without the prior written consent of Monashee Investment Management.\n\n" +
        "There is no guarantee that the investment objectives will be achieved. Moreover, the past performance is not a guarantee or indicator of future results.\n\n" +
        'Certain information contained herein constitutes "forward-looking statements," which can be identified by the use of forward-looking terminology such as "may," "will." "should," "expect," "anticipate," "project," "estimate," "intend," "continue," or "believe." or the negatives thereof or other variations thereon or comparable terminology. Due to various risks and uncertainties, actual events, results or actual performance may differ materially from those reflected or contemplated in such forward-looking statements. Nothing contained herein may be relied upon as a guarantee, promise, assurance or a representation as to the future';

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10.5);
      pdf.setTextColor(60);
      const maxWidth = pdfWidth - marginX * 2;
      const lines: string[] = (pdf as any).splitTextToSize(
        disclaimerText,
        maxWidth
      );
      const lineHeightMm = pdf.getFontSize() * 0.3528 * 1.2; // approx 1.2 line-height
      let yCursor = bodyY;
      const bottomLimit = pdfHeight - 28; // reserve for footer
      let idx = 0;
      while (idx < lines.length) {
        // Compute how many lines fit on this page
        const linesFit = Math.max(
          1,
          Math.floor((bottomLimit - yCursor) / lineHeightMm)
        );
        const chunk = lines.slice(idx, idx + linesFit);
        pdf.text(chunk, marginX, yCursor, { maxWidth });
        idx += linesFit;
        if (idx < lines.length) {
          // Draw footer, add page and repeat header + title for continuation
          drawFooter();
          pdf.addPage();
          // Recreate header and title for continuation
          const headerLogoWidthC = 40;
          const headerLogoHeightC = 12;
          const headerLogoXC = pdfWidth - headerLogoWidthC - 10;
          const headerLogoYC = 10;
          pdf.addImage(
            logoImgFinal,
            "JPEG",
            headerLogoXC,
            headerLogoYC,
            headerLogoWidthC,
            headerLogoHeightC,
            undefined,
            "FAST"
          );
          const headerLineYC = headerLogoYC + headerLogoHeightC + 2;
          pdf.setDrawColor(0, 32, 96);
          pdf.setLineWidth(1);
          pdf.line(10, headerLineYC, pdfWidth - 10, headerLineYC);
          pdf.setTextColor(0, 32, 96);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.text("Disclaimer", marginX, headerLineYC + 6);
          // Reset cursor for next page
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10.5);
          pdf.setTextColor(60);
          yCursor = headerLineYC + 16; // 6 for title offset + ~10 body spacing
        }
      }

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
      pdf.text(
        "Do not copy. Do not distribute.",
        pdfWidth / 2,
        pdfHeight - 10,
        { align: "center" }
      );

      pdf.save(`${currentTicker || "IPO"}_IPO_Report.pdf`);
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
      const payload = { ticker_name: currentTicker, [key]: formatted };
      await axios.patch(`${apiUrl}/api/writeup_data/`, payload, {
        headers: getAuthHeaders(),
      });

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

  return (
    <>
      {/* <NoDataPopup
  open={noDataPopupOpen}
  onClose={() => setNoDataPopupOpen(false)}
  onConfirm={handleNoDataConfirm}
/> */}

      <Box sx={{ px: 2 }}>
        {ipoData && (
          <>
            <IPODashboardPage1
              ipoData={ipoData}
              allIpoTickers={allIpoTickers}
              selectedTicker={currentTicker || ""}
              searchText={searchText}
              setSelectedTicker={setCurrentTicker}
              setSearchText={setSearchText}
              handleExportPDF={handleExportPDFPaginated}
              pdfLoading={pdfLoading}
            />

            <IPODashboardPage2
              ipoData={ipoData}
              selectedTicker={currentTicker || ""}
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
              selectedTicker={currentTicker || ""}
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
