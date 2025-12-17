import React, { useCallback, useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";

import axios from "axios";
import { cardColors, formatDate } from "./UtilsIPODashboard";
import introImage from "../../Assets/images/monashee_page1.png";
import monasheeLogo from "../../Assets/images/monashee_logo.png";
import IPODashboardPage1 from "./IPODashboardMain/IPODashboardPage1";
import IPODashboardPage2 from "./IPODashboardMain/IPODashboardPage2";
import IPODashboardPage3 from "./IPODashboardMain/IPODashboardPage3";
import IPODashboardPage4 from "./IPODashboardMain/IPODashboardPage4";
import EditableCard from "./Hooks/EditableCard";
import IPOComparablesAndAISection from "./IPOComparablesAndAISection";
import IPOFinancialForecastTableMain from "./IPOFinancialForecast/IPOFinancialForecastTableMain";
import { useLocation } from "react-router-dom";

interface TickerOption {
  ticker_name: string;
  pricing_date: string;
}
interface IPODashboardMainProps {
  selectedTicker?: string; // Optional: may be passed or derived from URL
  onLoadComplete?: (status: "success" | "error") => void;
}
type SectionKey = "core" | "page2" | "page3" | "page4";

const IPODashboardMain: React.FC<IPODashboardMainProps> = ({
  selectedTicker,
  onLoadComplete,
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
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
    {}
  );
  const location = useLocation();
  const fromTickerClick = location.state?.fromTickerClick || false;
  const [noDataPopupOpen, setNoDataPopupOpen] = useState(false);
  const [, setSectionsLoaded] = useState<Record<SectionKey, boolean>>({
    core: false,
    page2: false,
    page3: false,
    page4: false,
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  useEffect(() => {
    if (selectedTicker !== undefined) {
      setCurrentTicker(selectedTicker ?? null);
      setSearchText(selectedTicker ?? "");
    }
  }, [selectedTicker]);

  useEffect(() => {
    // Reset section tracking whenever a new ticker is selected
    setSectionsLoaded({
      core: false,
      page2: false,
      page3: false,
      page4: false,
    });
  }, [currentTicker]);

  const markSectionLoaded = useCallback(
    (section: SectionKey) => {
      setSectionsLoaded((prev) => {
        if (prev[section]) return prev;
        const updated = { ...prev, [section]: true };
        const allDone = Object.values(updated).every(Boolean);
        if (allDone) {
          onLoadComplete?.("success");
        }
        return updated;
      });
    },
    [onLoadComplete]
  );

  useEffect(() => {
    const fetchAllIpoTickers = async () => {
      try {
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
    
  }, []);

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
        markSectionLoaded("core");
        markSectionLoaded("page3"); // page 3 is static once base data is ready
        markSectionLoaded("page4"); // unlock row selection once base data is loaded
      } catch (err) {
        console.error("IPO data fetch failed", err);
        setError("Failed to fetch IPO data");
        onLoadComplete?.("error");
      } finally {
        setLoading(false);
      }
    };

    if (currentTicker) fetchData();
  }, [currentTicker, onLoadComplete]);

  // Generate the Monashee PDF report

  // Export with dynamic pagination so variable content fits into the PDF cleanly
  const handleExportPDFPaginated = async () => {
    setPdfLoading(true);
    const shouldIgnoreForPdf = (pageId: string) => (el: Element) => {
      const element = el as HTMLElement;
      if (element.classList?.contains("pdf-hidden")) return true;
      // Skip breakout sections unless we are specifically capturing that page id
      const breakout = element.getAttribute("data-pdf-breakout");
      if (breakout && pageId !== "ipo-dashboard-financial-metrics") return true;
      return false;
    };

    const pages = [
      "ipo-dashboard-page1", // Fair value, pricing, valuation
      "ipo-dashboard-page2", // Comparatives + performance metrics + financial forecasts
      "ipo-dashboard-financial-metrics", // Key Financial Metrics (only if toggled include)
      "ipo-dashboard-page4", // Differentiated summary + key metrics
      "ipo-dashboard-page3", // Business overview + supporting cards (last before disclaimer)
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
        const logoWidth = 55; // mm
        const logoHeight = 16.5; // mm
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

      // Give extra breathing room between captured slices and the footer so visuals don't collide
      const footerReserveMm = 36;
      const topSlicePaddingMm = 8;
      const bottomSlicePaddingMm = 10;
    const paginateCanvas = (canvas: HTMLCanvasElement) => {
      if (!canvas.width || !canvas.height) return; // avoid blank pages

      const imgWidth = pdfWidth;
      const mmPerPx = imgWidth / (canvas.width || 1);
      let consumedPx = 0;

        while (consumedPx < canvas.height) {
          pdf.addPage();
          const contentTopY = drawHeader();
          const availableHeight =
            pdfHeight -
            contentTopY -
            footerReserveMm -
            topSlicePaddingMm -
            bottomSlicePaddingMm;
          const slicePx = Math.max(
            1,
            Math.floor(availableHeight / mmPerPx)
          );
          const currentSlicePx = Math.min(
            slicePx,
            canvas.height - consumedPx
          );

          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = currentSlicePx;
          const sliceCtx = sliceCanvas.getContext("2d");
          if (sliceCtx) {
            sliceCtx.drawImage(
              canvas,
              0,
              consumedPx,
              canvas.width,
              currentSlicePx,
              0,
              0,
              canvas.width,
              currentSlicePx
            );
          }

          const sliceImg = sliceCanvas.toDataURL("image/png");
          const sliceHeightMm = currentSlicePx * mmPerPx;
          pdf.addImage(
            sliceImg,
            "PNG",
            0,
            contentTopY + topSlicePaddingMm,
            imgWidth,
            sliceHeightMm
          );
          drawFooter();
          consumedPx += currentSlicePx;
        }
      };

      // Lock PDF rendering to a consistent virtual viewport so browser zoom/viewport size
      // does not change the captured resolution.
      const captureViewportWidth = 1536; // matches MUI xl container width

      for (const pageId of pages) {
        const element = document.getElementById(pageId);
        if (!element) continue;

        const elementHeight =
          element.scrollHeight ||
          element.getBoundingClientRect().height ||
          0;
        if (!elementHeight) continue; // skip empty sections

        const targetDpi = 180;
        const targetPxWidth = (pdfWidth / 25.4) * targetDpi;
        const dynamicScale = Math.max(
          2,
          Math.min(4, targetPxWidth / captureViewportWidth)
        );
        const isPageOne = pageId === "ipo-dashboard-page1";

        const canvas = await html2canvas(element, {
          scale: isPageOne ? 2 : dynamicScale,
          useCORS: true,
          scrollY: -window.scrollY,
          // Force a stable, desktop-sized viewport for capture regardless of user zoom/viewport
          width: captureViewportWidth,
          windowWidth: captureViewportWidth,
          windowHeight: elementHeight,
          backgroundColor: "#ffffff",
          ignoreElements: shouldIgnoreForPdf(pageId),
          onclone: (doc) => {
            const cloned = doc.getElementById(pageId);
            if (cloned) {
              cloned.style.width = `${captureViewportWidth}px`;
              cloned.style.maxWidth = `${captureViewportWidth}px`;
              cloned.style.minWidth = `${captureViewportWidth}px`;
            }
          },
        });

        paginateCanvas(canvas);
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
      const headerLogoWidth = 55;
      const headerLogoHeight = 16.5;
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
          const headerLogoWidthC = 55;
          const headerLogoHeightC = 16.5;
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
              setIpoData={setIpoData}
              handleExportPDF={handleExportPDFPaginated}
              pdfLoading={pdfLoading}
            />

            {/* Page 2: comparatives + performance metrics + financial forecasts */}
            <div id="ipo-dashboard-page2">
              <Container maxWidth="xl" sx={{ mt: 4 }}>
                <IPOComparablesAndAISection
                  selectedData={{
                    ticker_name: ipoData?.ticker_name,
                    company_name: ipoData?.company_name,
                    exchange: ipoData?.exchange,
                    valuation: ipoData?.valuation || [],
                    valuation_image_url: ipoData?.valuation_image_url || "",
                  }}
                />
              </Container>

              <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <CardContent>
                    <IPOFinancialForecastTableMain
                      defaultTicker={currentTicker || ""}
                    />
                  </CardContent>
                </Card>
              </Container>
            </div>

            {/* Page 4: Differentiated Summary + Key Metrics */}
            <IPODashboardPage2
              ipoData={ipoData}
              selectedTicker={currentTicker || ""}
              setIpoData={setIpoData}
              onPageReady={() => markSectionLoaded("page2")}
            />

            {/* Page 3 (rendered last in DOM): Business overview and supporting cards */}
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

            {/* Page 4: Monashee score (and any additional key metrics) */}
            <IPODashboardPage4
              selectedTicker={currentTicker || ""}
              ipoData={ipoData}
              showAIComparison={false}
              handleAIComparisonClick={() => {}}
              onPageReady={() => markSectionLoaded("page4")}
            />
          </>
        )}
      </Box>
    </>
  );
};

export default IPODashboardMain;
