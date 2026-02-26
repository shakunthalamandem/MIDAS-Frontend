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

interface AIPortfolioReviewPDFExporterProps {
  exportContainerId: string;
  fileName?: string;
  reportTitle?: string;
  reportDate?: string;
  aum?: string;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const AIPortfolioReviewPDFExporter: React.FC<
  AIPortfolioReviewPDFExporterProps
> = ({
  exportContainerId,
  fileName = "AI_Portfolio_Review.pdf",
  reportTitle = "US Portfolio Review",
  reportDate = "",
  aum = "",
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

    // Save original scroll and styles
    const originalScrollTop = container.scrollTop;
    const originalOverflow = container.style.overflow;
    const originalHeight = container.style.height;
    const originalMaxHeight = container.style.maxHeight;

    try {
      // Expand the container so ALL sections are visible for capture
      container.style.overflow = "visible";
      container.style.height = "auto";
      container.style.maxHeight = "none";

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 500))
      );

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginX = 4;
      const contentWidth = pdfWidth - marginX * 2;
      const bottomMargin = 10;
      const headerHeight = 20;

      const drawPageHeader = () => {
        pdf.setFillColor(0, 32, 96);
        pdf.rect(0, 0, pdfWidth, headerHeight, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(255, 255, 255);
        pdf.text(reportTitle, marginX, 8);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(180, 200, 230);
        const subtitle = [reportDate, aum ? `AUM: ${aum}` : ""]
          .filter(Boolean)
          .join("  |  ");
        if (subtitle) {
          pdf.text(subtitle, marginX, 14);
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
        pdf.text(`Generated: ${timestamp}`, pdfWidth - marginX, 14, {
          align: "right",
        });

        pdf.setDrawColor(16, 185, 129);
        pdf.setLineWidth(0.8);
        pdf.line(0, headerHeight, pdfWidth, headerHeight);

        pdf.setTextColor(0, 0, 0);
        return headerHeight + 3;
      };

      // Capture a section to canvas
      const captureSection = async (section: HTMLElement) => {
        const captureWidth = Math.max(section.scrollWidth, 1100);
        const canvas = await html2canvas(section, {
          scale: 2.5,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          width: captureWidth,
          windowWidth: captureWidth,
          windowHeight: section.scrollHeight * 2,
        });
        return canvas;
      };

      // Place an image that may span multiple pages by slicing the canvas
      const addImageToPages = (
        canvas: HTMLCanvasElement,
        startY: number
      ): number => {
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // If it fits on the current page, just place it
        if (startY + imgHeight <= pdfHeight - bottomMargin) {
          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          pdf.addImage(
            imgData,
            "JPEG",
            marginX,
            startY,
            imgWidth,
            imgHeight
          );
          return startY + imgHeight + 2;
        }

        // Otherwise, slice into page-height chunks
        const pxPerMm = canvas.height / imgHeight;
        let remainingCanvasHeight = canvas.height;
        let canvasY = 0;
        let currentY = startY;

        while (remainingCanvasHeight > 0) {
          const availableMm = pdfHeight - bottomMargin - currentY;
          const availablePx = Math.floor(availableMm * pxPerMm);
          const sliceHeight = Math.min(availablePx, remainingCanvasHeight);
          const sliceMm = sliceHeight / pxPerMm;

          // If remaining content is tiny (< 12mm), skip creating a new page for it
          const remainingAfterSliceMm = (remainingCanvasHeight - sliceHeight) / pxPerMm;
          const isLastSlice = remainingCanvasHeight <= availablePx;

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

          const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.95);
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
            // Don't create a new page for tiny remaining content (< 12mm)
            if (remainingAfterSliceMm < 12) {
              break;
            }
            pdf.addPage();
            currentY = drawPageHeader();
          } else {
            currentY = currentY + sliceMm + 2;
          }
        }

        return currentY;
      };

      // Collect all visible sections
      const allSections = Array.from(
        container.querySelectorAll<HTMLElement>(".pdf-section")
      ).filter((s) => s.offsetHeight > 0);

      const totalSections = allSections.length;

      let currentY = drawPageHeader();

      for (let i = 0; i < allSections.length; i++) {
        const section = allSections[i];
        const sectionName =
          section.getAttribute("data-section-key") || `Section ${i + 1}`;

        setStatusText(`Capturing: ${sectionName.replace(/_/g, " ")}`);
        setProgress(Math.round(((i + 1) / totalSections) * 90));

        await wait(200);
        const canvas = await captureSection(section);

        // Check if we need a new page before this section
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        const remainingSpace = pdfHeight - bottomMargin - currentY;

        // Start a new page if:
        // - Less than 40mm left (not enough for a meaningful section start)
        // - OR section is small enough to fit on a fresh page but not on remaining space
        if (
          (remainingSpace < 40 && imgHeight > remainingSpace) ||
          (remainingSpace < 50 && imgHeight > remainingSpace && imgHeight <= pdfHeight - bottomMargin - (headerHeight + 3))
        ) {
          pdf.addPage();
          currentY = drawPageHeader();
        }

        currentY = addImageToPages(canvas, currentY);
      }

      // Remove trailing blank page if last page has barely any content
      const totalPages = pdf.getNumberOfPages();
      if (totalPages > 1 && currentY <= headerHeight + 10) {
        pdf.deletePage(totalPages);
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
          pdfHeight - 4,
          { align: "right" }
        );

        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(
          marginX,
          pdfHeight - 8,
          pdfWidth - marginX,
          pdfHeight - 8
        );

        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.text("MIDAS - AI Portfolio Review", marginX, pdfHeight - 4);
      }

      setStatusText("Downloading PDF...");
      setProgress(100);
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      // Restore original container styles
      container.style.overflow = originalOverflow;
      container.style.height = originalHeight;
      container.style.maxHeight = originalMaxHeight;
      container.scrollTop = originalScrollTop;

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
          backgroundColor: "#002060",
          color: "#fff",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "12px",
          borderRadius: "20px",
          px: 2,
          py: 0.7,
          "&:hover": {
            backgroundColor: "#001540",
          },
          "&.Mui-disabled": {
            backgroundColor: "rgba(0,32,96,0.3)",
            color: "rgba(255,255,255,0.5)",
          },
        }}
      >
        {loading ? "Generating..." : "Export PDF"}
      </Button>

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

export default AIPortfolioReviewPDFExporter;
