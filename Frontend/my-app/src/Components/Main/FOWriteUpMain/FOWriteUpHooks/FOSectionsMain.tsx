import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
  InputAdornment,
  Container,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FOComparisionTableMain from "../FOWriteSections/FOComparisionTableMain";
import FOFinancialHighlights from "../FOWriteSections/FOFinancialHighlights";
import FOSummaryDataSection from "./FOSummaryDataSection";
import { format } from "date-fns";
import introImage from "../../../../Assets/images/monashee_page1.png";
import monasheeLogo from "../../../../Assets/images/monashee_logo.png";

interface FOSectionsMainProps {
  ticker: string;
  deal_id: string;
  selected: { ticker: string; deal_id: string } | null;
  setSelected: React.Dispatch<
    React.SetStateAction<{ ticker: string; deal_id: string } | null>
  >;
}

interface TickerData {
  ticker: string;
  company_name?: string; // optional
  pricing_date?: string | null;
  deal_id: string;
  exchange?: string | null;
  expected_listing_date?: string | null;
}

const FOSectionsMain: React.FC<FOSectionsMainProps> = ({
  ticker,
  deal_id,
  selected,
  setSelected,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [pdfLoading, setPdfLoading] = useState(false);
  const [ipoData, setIpoData] = useState<TickerData | null>(null);
  const [sortedTickers, setSortedTickers] = useState<TickerData[]>([]);
  const [searchText, setSearchText] = useState<string>(ticker);

  // 🔹 Fetch ticker list for search
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fo_writeup_distinct_tickers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data: TickerData[] = await response.json();
        setSortedTickers(data);
      } catch (error) {
        console.error("Failed to fetch tickers:", error);
      }
    };

    fetchTickers();
  }, [apiUrl, token]);

  // 🔹 Fetch selected ticker details using POST
  const fetchIpoDetails = async (tickerSymbol: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/fowriteup_ticker_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker: tickerSymbol }),
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data: TickerData = await response.json();
      console.log("IPO Data Response:", data);
      setIpoData(data);
    } catch (error) {
      console.error("Failed to fetch IPO details:", error);
    }
  };

  // 🔹 Load IPO details when ticker or selected changes
  useEffect(() => {
    if (selected?.ticker) {
      fetchIpoDetails(selected.ticker);
      setSearchText(selected.ticker);
    } else if (ticker) {
      fetchIpoDetails(ticker);
    }
  }, [selected, ticker]);

  // Export Monashee-style PDF (A4, HD cover, header/footer, disclaimer)
  const handleExportPDF = async () => {
    setPdfLoading(true);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const pages = ["fo-page1", "fo-page2"];

    const wait = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms));

    try {
      // Data-as-of text
      let dataAsOfText = "";
      if (ipoData?.pricing_date) {
        try {
          const d = new Date(ipoData.pricing_date);
          dataAsOfText = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
        } catch {}
      }

      // Preload logo
      const logo = new Image();
      logo.src = monasheeLogo;
      await new Promise<void>((resolve) => { logo.onload = () => resolve(); });

      // Intro page (HD)
      const cover = new Image();
      cover.src = introImage;
      await new Promise<void>((resolve) => {
        cover.onload = () => {
          // PNG for better quality
          pdf.addImage(cover, "PNG", 0, 0, pdfWidth, pdfHeight);

          // Overlay basic company info (right aligned)
          const margin = 10;
          const color = [0, 32, 96];
          if (ipoData?.company_name && ipoData?.exchange && ipoData?.ticker) {
            const company = ipoData.company_name;
            const exchangeTicker = `(${ipoData.exchange ?? ""}: ${ipoData.ticker})`;
            const pricingDate = ipoData.pricing_date ?? "";
            const startY = 40;
            pdf.setFontSize(20);
            pdf.setTextColor(color[0], color[1], color[2]);
            pdf.text(company, pdfWidth - margin - pdf.getTextWidth(company), startY);
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

      // Header/footer helpers
      const drawHeader = () => {
        const logoW = 40, logoH = 12, logoX = pdfWidth - logoW - 10, logoY = 10;
        pdf.addImage(logo, "JPEG", logoX, logoY, logoW, logoH, undefined, "FAST");
        const lineY = logoY + logoH + 2;
        pdf.setDrawColor(0, 32, 96);
        pdf.setLineWidth(1);
        pdf.line(10, lineY, pdfWidth - 10, lineY);
        return lineY + 5;
      };
      const drawFooter = () => {
        const marginX = 10;
        const footerTopY = pdfHeight - 22;
        pdf.setDrawColor(0, 32, 96);
        pdf.setLineWidth(1);
        pdf.line(marginX, footerTopY - 4, pdfWidth - marginX, footerTopY - 4);
        pdf.setFontSize(7);
        pdf.setTextColor(100);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Data as of ${dataAsOfText}. Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`,
          marginX,
          footerTopY,
          { maxWidth: pdfWidth - marginX * 2 }
        );
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(128);
        pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, pdfHeight - 10, { align: "center" });
      };

      // Render content sections with slicing and overlap
      await wait(300);
      const mmPerPxFor = (canvas: HTMLCanvasElement) => pdfWidth / canvas.width;
      const headerTopY = (() => { const logoH = 12, logoY = 10; return logoY + logoH + 2 + 5; })();
      const footerReserveMm = 28;

      for (const id of pages) {
        const el = document.getElementById(id);
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          scrollY: -window.scrollY,
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
        });

        const mmPerPx = mmPerPxFor(canvas);
        const availableHeightMm = Math.max(10, pdfHeight - headerTopY - footerReserveMm);
        const availableHeightPx = availableHeightMm / mmPerPx;

        let yOffsetPx = 0;
        const overlapPx = 12;
        while (yOffsetPx < canvas.height) {
          const sliceHeightPx = Math.min(availableHeightPx, canvas.height - yOffsetPx);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.ceil(sliceHeightPx);
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(canvas, 0, yOffsetPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
          }
          const slice = sliceCanvas.toDataURL("image/jpeg", 0.9);

          pdf.addPage();
          const contentTopY = drawHeader();
          const sliceHeightMm = sliceHeightPx * mmPerPx;
          pdf.addImage(slice, "JPEG", 0, contentTopY, pdfWidth, sliceHeightMm, undefined, "FAST");
          drawFooter();

          const nextOffset = yOffsetPx + sliceHeightPx - overlapPx;
          yOffsetPx = nextOffset > yOffsetPx ? nextOffset : yOffsetPx + sliceHeightPx;
        }
      }

      // Disclaimer page (text-based, multi-page safe)
      const addDisclaimerHeader = () => {
        const logoW = 40, logoH = 12, logoX = pdfWidth - logoW - 10, logoY = 10;
        pdf.addImage(logo, "JPEG", logoX, logoY, logoW, logoH, undefined, "FAST");
        const lineY = logoY + logoH + 2;
        pdf.setDrawColor(0, 32, 96);
        pdf.setLineWidth(1);
        pdf.line(10, lineY, pdfWidth - 10, lineY);
        const titleY = lineY + 6;
        const marginX = 12;
        pdf.setTextColor(0, 32, 96);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("Disclaimer", marginX, titleY);
        return { marginX, startY: titleY + 10 };
      };

      const disclaimerText = (
        "The information contained herein has been compiled by Monashee internally and may be based on unaudited data from the relevant funds' books and records, and hypothetical information that has not been verified or reconciled by such funds' administrator. As such, the information contained herein should not serve as any kind of basis for any investment decision.\n\n" +
        "This document does not constitute advice or a recommendation or offer to sell or a solicitation to deal in any security or financial product. It is provided for information purposes only and on the understanding that the recipient has sufficient knowledge and experience to be able to understand and make their own evaluation of the proposals and services described herein, any risks associated therewith and any related legal, tax, accounting or other material considerations. To the extent that the reader has any questions regarding the applicability of any specific issue discussed above to their specific portfolio or situation, prospective investors are encouraged to contact Monashee Investment Management or consult with the professional advisor of their choosing.\n\n" +
        "Certain information contained herein has been obtained from third party sources and such information has not been independently verified by Monashee Investment Management. No representation, warranty, or undertaking, expressed or implied, is given to the accuracy or completeness of such information by Monashee Investment Management or any other person. While such sources are believed to be reliable. Monashee Investment Management does not assume any responsibility for the accuracy or completeness of such information. Monashee Investment Management does not undertake any obligation to update the information contained herein as of any future date.\n\n" +
        "Except where otherwise indicated, the information contained in this presentation is based on matters as they exist as of the date of preparation of such material and not as of the date of distribution or any future date. Recipients should not rely on this material in making any future investment decision.\n\n" +
        "This presentation is confidential, is intended only for the person to whom it has been directly provided and under no circumstances may a copy be shown, copied, transmitted or otherwise be given to any person other than the authorized recipient without the prior written consent of Monashee Investment Management.\n\n" +
        "There is no guarantee that the investment objectives will be achieved. Moreover, the past performance is not a guarantee or indicator of future results.\n\n" +
        "Certain information contained herein constitutes \"forward-looking statements,\" which can be identified by the use of forward-looking terminology such as \"may,\" \"will.\" \"should,\" \"expect,\" \"anticipate,\" \"project,\" \"estimate,\" \"intend,\" \"continue,\" or \"believe.\" or the negatives thereof or other variations thereon or comparable terminology. Due to various risks and uncertainties, actual events, results or actual performance may differ materially from those reflected or contemplated in such forward-looking statements. Nothing contained herein may be relied upon as a guarantee, promise, assurance or a representation as to the future"
      );

      pdf.addPage();
      const { marginX, startY } = addDisclaimerHeader();
      const maxWidth = pdfWidth - marginX * 2;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10.5);
      pdf.setTextColor(60);
      const lines: string[] = (pdf as any).splitTextToSize(disclaimerText, maxWidth);
      const lineHeightMm = (pdf.getFontSize() * 0.3528) * 1.2;
      let y = startY;
      const bottomLimit = pdfHeight - 28;
      let i = 0;
      while (i < lines.length) {
        const canFit = Math.max(1, Math.floor((bottomLimit - y) / lineHeightMm));
        const chunk = lines.slice(i, i + canFit);
        pdf.text(chunk, marginX, y, { maxWidth });
        i += canFit;
        if (i < lines.length) {
          drawFooter();
          pdf.addPage();
          const header = addDisclaimerHeader();
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10.5);
          pdf.setTextColor(60);
          y = header.startY;
        }
      }

      // Final footer and save
      drawFooter();
      pdf.save(`${ipoData?.ticker || "FO"}_FO_Report.pdf`);
    } catch (err) {
      console.error("FO PDF export failed", err);
    } finally {
      setPdfLoading(false);
    }
  };

const handleAutocompleteChange = (_: any, newValue: TickerData | null) => {
  if (newValue) {
    setSelected({ ticker: newValue.ticker, deal_id: newValue.deal_id });
  }
};


  return (
    <>
      {/* 🔹 Header Section */}
      <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Company Info and Button */}
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h6" color="#026269" sx={{ fontWeight: 600 }}>
            {ipoData
              ? `${ipoData.company_name ?? "Unknown Company"} (${ipoData.ticker ?? "N/A"} | ${
                  ipoData.exchange ?? "N/A"
                })`
              : "Loading..."}
          </Typography>

          <Button
            variant="contained"
            onClick={handleExportPDF}
            sx={{
              backgroundColor: "#002060",
              color: "#ffffff",
              textTransform: "none",
              px: 3,
              py: 1,
              minWidth: "180px",
              boxShadow: 2,
              '&:hover': { backgroundColor: '#093b99' }
            }}
            disabled={pdfLoading}
            startIcon={pdfLoading ? <CircularProgress color="inherit" size={18} /> : null}
          >
            {pdfLoading ? "Generating..." : "Export PDF"}
          </Button>
        </Box>

        {/* 🔹 Search Autocomplete */}
        <Autocomplete
          size="small"
          options={sortedTickers}
          getOptionLabel={(option) => {
            let formattedDate = "N/A";
            if (option.pricing_date) {
              try {
                formattedDate = format(new Date(option.pricing_date), "dd MMM yyyy");
              } catch {
                formattedDate = option.pricing_date || "N/A";
              }
            }
            return `${option.ticker} (${formattedDate})`;
          }}
          value={sortedTickers.find((t) => t.ticker === selected?.ticker) || null}
          onChange={handleAutocompleteChange}
          inputValue={searchText}
          onInputChange={(_, newInputValue) => setSearchText(newInputValue)}
          sx={{ width: { xs: "100%", sm: "300px" } }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search ticker..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Box>
      </Container>

      {/* 🔹 Sections */}
      <div id="fo-page1">
        <FOSummaryDataSection ticker={selected?.ticker || ""} deal_id={selected?.deal_id || ""} />
      </div>
      <div id="fo-page2">
        <FOFinancialHighlights ticker={selected?.ticker || ""} deal_id={selected?.deal_id || ""} />
        <FOComparisionTableMain ticker={selected?.ticker || ""} deal_id={selected?.deal_id || ""} />
      </div>
    </>
  );
};

export default FOSectionsMain;
