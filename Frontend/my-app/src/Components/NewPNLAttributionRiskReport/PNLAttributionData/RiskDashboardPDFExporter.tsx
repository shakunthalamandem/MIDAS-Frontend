import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Button,
  CircularProgress,
  Box,
  Dialog,
  DialogContent,
  Typography,
  LinearProgress,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

interface RiskDashboardPDFExporterProps {
  exportContainerId: string;
  fileName?: string;
  headerTitle?: string;
  fundName?: string;
  reportDate?: string;
  onBeforeExport?: () => Promise<void>;
  onAfterExport?: () => void;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const waitForRender = async () => {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await wait(800);
};

const RiskDashboardPDFExporter: React.FC<RiskDashboardPDFExporterProps> = ({
  exportContainerId,
  fileName = "Risk_PNL_Attribution_Report.pdf",
  headerTitle = "Risk & PNL Attribution Dashboard",
  fundName = "",
  reportDate = "",
  onBeforeExport,
  onAfterExport,
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const handleExportPDF = async () => {
    const container = document.getElementById(exportContainerId);
    if (!container) return;

    setLoading(true);
    setProgress(0);
    setStatusText("Preparing report layout...");

    try {
      // Load attribution data for PDF before switching to export mode
      if (onBeforeExport) {
        setStatusText("Loading attribution tables...");
        await onBeforeExport();
        await waitForRender();
      }

      container.classList.add("pdf-export-mode");
      await waitForRender();

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginX = 10;
      const contentWidth = pdfWidth - marginX * 2;
      const bottomMargin = 18;
      const headerHeight = 28;

      const drawPageHeader = () => {
        pdf.setFillColor(0, 32, 96);
        pdf.rect(0, 0, pdfWidth, headerHeight, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text(headerTitle, marginX, 12);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(180, 200, 230);
        const subtitle = [fundName, reportDate].filter(Boolean).join("  |  ");
        if (subtitle) {
          pdf.text(subtitle, marginX, 19);
        }

        pdf.setFontSize(7);
        pdf.setTextColor(150, 170, 200);
        const now = new Date();
        const timestamp = now.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        pdf.text(`Generated: ${timestamp}`, pdfWidth - marginX, 19, {
          align: "right",
        });

        pdf.setDrawColor(16, 185, 129);
        pdf.setLineWidth(0.8);
        pdf.line(0, headerHeight, pdfWidth, headerHeight);

        pdf.setTextColor(0, 0, 0);
        return headerHeight + 6;
      };

      // Available content height on a page (below header, above footer)
      const pageContentHeight = pdfHeight - (headerHeight + 6) - bottomMargin;

      // Capture a section to canvas
      const captureSection = async (section: HTMLElement) => {
        await wait(200);
        // Use a fixed wide width to prevent column cutoff
        const captureWidth = Math.max(section.scrollWidth, 1200);
        const canvas = await html2canvas(section, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          width: captureWidth,
          windowWidth: captureWidth,
        });
        return canvas;
      };

      // Place an image that may span multiple pages by slicing the canvas
      const addImageToPages = (
        canvas: HTMLCanvasElement,
        startY: number
      ): number => {
        const imgWidth = contentWidth;
        const imgHeight =
          (canvas.height * imgWidth) / canvas.width;

        // If it fits on the current page, just place it
        if (startY + imgHeight <= pdfHeight - bottomMargin) {
          const imgData = canvas.toDataURL("image/jpeg", 0.92);
          pdf.addImage(imgData, "JPEG", marginX, startY, imgWidth, imgHeight);
          return startY + imgHeight + 4;
        }

        // Otherwise, slice into page-height chunks
        const pxPerMm = canvas.height / imgHeight; // canvas pixels per mm
        let remainingCanvasHeight = canvas.height;
        let canvasY = 0;
        let currentY = startY;

        while (remainingCanvasHeight > 0) {
          const availableMm = pdfHeight - bottomMargin - currentY;
          const availablePx = Math.floor(availableMm * pxPerMm);
          const sliceHeight = Math.min(availablePx, remainingCanvasHeight);
          const sliceMm = sliceHeight / pxPerMm;

          // Create a slice canvas
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              canvasY,
              canvas.width,
              sliceHeight,
              0,
              0,
              canvas.width,
              sliceHeight
            );
          }

          const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.92);
          pdf.addImage(
            sliceData,
            "JPEG",
            marginX,
            currentY,
            imgWidth,
            sliceMm
          );

          canvasY += sliceHeight;
          remainingCanvasHeight -= sliceHeight;

          if (remainingCanvasHeight > 0) {
            pdf.addPage();
            currentY = drawPageHeader();
          } else {
            currentY = currentY + sliceMm + 4;
          }
        }

        return currentY;
      };

      // Collect all visible sections
      const allSections = Array.from(
        container.querySelectorAll<HTMLElement>(".pdf-section")
      ).filter((s) => s.offsetHeight > 0);

      const totalSections = allSections.length;

      // Group sections by data-pdf-page
      const pageGroups: { page: string; sections: HTMLElement[] }[] = [];
      let currentPageGroup = "";
      for (const section of allSections) {
        const page = section.getAttribute("data-pdf-page") || "";
        if (page !== currentPageGroup) {
          pageGroups.push({ page, sections: [section] });
          currentPageGroup = page;
        } else {
          pageGroups[pageGroups.length - 1].sections.push(section);
        }
      }

      let currentY = drawPageHeader();
      let processedCount = 0;

      for (let gi = 0; gi < pageGroups.length; gi++) {
        const group = pageGroups[gi];

        // Force new page for each new page group (except the first)
        if (gi > 0) {
          pdf.addPage();
          currentY = drawPageHeader();
        }

        for (let si = 0; si < group.sections.length; si++) {
          const section = group.sections[si];
          processedCount++;

          const sectionName = getSectionName(section, processedCount - 1);
          setStatusText(`Capturing: ${sectionName}`);
          setProgress(Math.round((processedCount / totalSections) * 90));

          const canvas = await captureSection(section);
          currentY = addImageToPages(canvas, currentY);
        }
      }

      // Add page numbers and footer
      setStatusText("Finalizing report...");
      setProgress(95);

      const pageCount = pdf.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        pdf.setPage(p);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `Page ${p} of ${pageCount}`,
          pdfWidth - marginX,
          pdfHeight - 8,
          { align: "right" }
        );

        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(
          marginX,
          pdfHeight - 14,
          pdfWidth - marginX,
          pdfHeight - 14
        );

        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.text(
          "MIDAS - Risk & PNL Attribution Report",
          marginX,
          pdfHeight - 8
        );
      }

      setStatusText("Downloading PDF...");
      setProgress(100);
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      container.classList.remove("pdf-export-mode");
      if (onAfterExport) onAfterExport();
      setLoading(false);
      setProgress(0);
      setStatusText("");
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleExportPDF}
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress size={16} sx={{ color: "#002060" }} />
          ) : (
            <PictureAsPdfIcon />
          )
        }
        sx={{
          backgroundColor: "#fff",
          color: "#002060",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "13px",
          borderRadius: "20px",
          px: 2.5,
          py: 0.8,
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.85)",
          },
          "&.Mui-disabled": {
            backgroundColor: "rgba(255,255,255,0.3)",
            color: "rgba(0,32,96,0.5)",
          },
        }}
      >
        {loading ? "Generating..." : "Export to PDF"}
      </Button>

      {/* Progress dialog */}
      <Dialog
        open={loading}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 10, 40, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            background: "linear-gradient(135deg, #002060, #001540)",
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={48} sx={{ color: "#10b981", mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ color: "#fff", fontWeight: 700, mb: 1 }}
          >
            Generating PDF Report
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}
          >
            {statusText}
          </Typography>
          <Box sx={{ px: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.15)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.5)",
                mt: 1,
                display: "block",
              }}
            >
              {progress}% complete
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

/** Identify a readable name for the section being captured */
function getSectionName(section: HTMLElement, index: number): string {
  if (section.classList.contains("attribution-pdf-tab")) {
    const label = section.querySelector(".risk-dashboard-section .MuiBox-root");
    if (label?.textContent) return label.textContent;
  }

  const title = section.querySelector(
    ".risk-dashboard-section-title, .attribution-title, .pnl-chart-title"
  );
  if (title?.textContent) return title.textContent;

  if (section.querySelector(".risk-dashboard-header")) return "Dashboard Header";

  const names = [
    "Dashboard Header",
    "Headline Risks",
    "Headline P&L",
    "Index Comparison",
    "Cumulative P&L Chart",
  ];
  return names[index] || `Section ${index + 1}`;
}

export default RiskDashboardPDFExporter;
