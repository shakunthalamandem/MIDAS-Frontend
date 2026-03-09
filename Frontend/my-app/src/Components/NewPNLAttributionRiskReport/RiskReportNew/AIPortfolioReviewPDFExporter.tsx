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
  reportTitle = "US Equity Portfolio AI Review",
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
        requestAnimationFrame(() => setTimeout(resolve, 600))
      );

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const marginX = 6;
      const contentWidth = pdfWidth - marginX * 2; // 198mm
      const bottomMargin = 12;
      const headerHeight = 22;
      const usableHeight = pdfHeight - bottomMargin; // 285mm

      // ═══════════════════════════════════════════
      // Branded page header (dark navy with accent)
      // ═══════════════════════════════════════════
      const drawPageHeader = (): number => {
        // Dark navy background
        pdf.setFillColor(0, 32, 96);
        pdf.rect(0, 0, pdfWidth, headerHeight, "F");

        // Green accent line at bottom of header
        pdf.setDrawColor(16, 185, 129);
        pdf.setLineWidth(0.8);
        pdf.line(0, headerHeight, pdfWidth, headerHeight);

        // Title (white, bold)
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255);
        pdf.text(reportTitle, marginX + 1, 9);

        // Subtitle: date · AUM
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(160, 190, 230);
        const subtitle = [reportDate, aum ? `AUM: ${aum}` : ""]
          .filter(Boolean)
          .join("  ·  ");
        if (subtitle) pdf.text(subtitle, marginX + 1, 15);

        // Timestamp right-aligned
        pdf.setFontSize(7);
        pdf.setTextColor(130, 160, 200);
        const timestamp = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        pdf.text(`Generated: ${timestamp}`, pdfWidth - marginX - 1, 15, {
          align: "right",
        });

        // CONFIDENTIAL badge right-aligned
        pdf.setFontSize(6.5);
        pdf.setTextColor(200, 170, 100);
        pdf.text("CONFIDENTIAL", pdfWidth - marginX - 1, 9, {
          align: "right",
        });

        pdf.setTextColor(0, 0, 0);
        return headerHeight + 4; // content starts 4mm below header
      };

      // ═══════════════════════════════════════════
      // Page footer with branding + page numbers
      // ═══════════════════════════════════════════
      const drawPageFooter = (pageNum: number, totalPages: number) => {
        // Subtle separator line
        pdf.setDrawColor(200, 210, 220);
        pdf.setLineWidth(0.3);
        pdf.line(marginX, pdfHeight - 9, pdfWidth - marginX, pdfHeight - 9);

        // Left: branding + disclaimer
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "MIDAS — AI Portfolio Review  ·  Do not copy. Do not distribute.",
          marginX,
          pdfHeight - 5
        );

        // Right: page number
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${pageNum} / ${totalPages}`, pdfWidth - marginX, pdfHeight - 5, {
          align: "right",
        });
      };

      // ═══════════════════════════════════════════
      // High-quality canvas capture (scale 3x)
      // ═══════════════════════════════════════════
      const captureSection = async (
        section: HTMLElement
      ): Promise<HTMLCanvasElement> => {
        const captureWidth = Math.max(
          section.scrollWidth,
          section.offsetWidth,
          1100
        );
        return html2canvas(section, {
          scale: 3,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          width: captureWidth,
          windowWidth: captureWidth,
          windowHeight: section.scrollHeight + 200,
        });
      };

      // ═══════════════════════════════════════════
      // Find safe page-break points at element
      // boundaries (prevents cutting through text,
      // cards, tables, etc.)
      // ═══════════════════════════════════════════
      const findSafeBreakPoints = (section: HTMLElement): number[] => {
        const sectionRect = section.getBoundingClientRect();
        const breakPoints: number[] = [];

        const walk = (parent: Element, depth: number) => {
          if (depth > 4) return;
          const children = parent.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            if (!child.getBoundingClientRect) continue;
            const rect = child.getBoundingClientRect();
            const bottom = Math.round(rect.bottom - sectionRect.top);
            // Only consider break points with some margin from edges
            if (bottom > 20 && bottom < section.scrollHeight - 20) {
              breakPoints.push(bottom);
            }
            walk(child, depth + 1);
          }
        };

        walk(section, 0);

        // Sort and deduplicate (remove points within 8px of each other)
        const unique = Array.from(new Set(breakPoints)).sort((a, b) => a - b);
        const filtered: number[] = [];
        for (const bp of unique) {
          if (filtered.length === 0 || bp - filtered[filtered.length - 1] >= 8) {
            filtered.push(bp);
          }
        }
        return filtered;
      };

      // ═══════════════════════════════════════════
      // Smart image placement with intelligent
      // page breaks at element boundaries
      // ═══════════════════════════════════════════
      const addImageSmartBreak = (
        canvas: HTMLCanvasElement,
        startY: number,
        sectionEl: HTMLElement,
        sectionLabel: string
      ): number => {
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pxPerMm = canvas.height / imgHeight; // canvas pixels per mm
        const freshStart = headerHeight + 4;

        // ── Case 1: Section fits entirely on the current page ──
        if (startY + imgHeight <= usableHeight) {
          const imgData = canvas.toDataURL("image/jpeg", 0.98);
          pdf.addImage(imgData, "JPEG", marginX, startY, imgWidth, imgHeight);
          return startY + imgHeight + 5;
        }

        // ── Case 2: Doesn't fit here, but fits on a fresh page ──
        if (imgHeight <= usableHeight - freshStart) {
          pdf.addPage();
          const y = drawPageHeader();
          const imgData = canvas.toDataURL("image/jpeg", 0.98);
          pdf.addImage(imgData, "JPEG", marginX, y, imgWidth, imgHeight);
          return y + imgHeight + 5;
        }

        // ── Case 3: Section taller than a full page — slice at safe break points ──
        const cssBreaks = findSafeBreakPoints(sectionEl);
        const scaleFactor = canvas.height / sectionEl.scrollHeight;
        // Convert CSS break points to canvas pixel coordinates
        const canvasBreaks = cssBreaks.map((bp) =>
          Math.round(bp * scaleFactor)
        );

        let canvasY = 0;
        let remainingPx = canvas.height;
        let currentY = startY;
        let sliceIdx = 0;

        while (remainingPx > 5) {
          const availMm = usableHeight - currentY;

          // If very little space left (< 35mm), jump to a new page
          if (availMm < 35) {
            pdf.addPage();
            currentY = drawPageHeader();
            if (sliceIdx > 0) {
              // "Continued" label
              pdf.setFont("helvetica", "italic");
              pdf.setFontSize(7.5);
              pdf.setTextColor(140, 140, 140);
              pdf.text(`${sectionLabel} (continued)`, marginX, currentY);
              pdf.setTextColor(0, 0, 0);
              currentY += 5;
            }
            continue;
          }

          const availPx = Math.floor(availMm * pxPerMm);
          let slicePx: number;

          if (remainingPx <= availPx) {
            // Everything remaining fits on this page
            slicePx = remainingPx;
          } else {
            // Find the best safe break point that fits within available space
            const maxCanvasY = canvasY + availPx;
            // Require at least 30% of available space to be used (prevents tiny slices)
            const minCanvasY = canvasY + Math.min(100, Math.floor(availPx * 0.3));
            const candidates = canvasBreaks.filter(
              (bp) => bp >= minCanvasY && bp <= maxCanvasY
            );

            if (candidates.length > 0) {
              // Use the largest safe break point that fits
              slicePx = candidates[candidates.length - 1] - canvasY;
            } else {
              // No safe break found — use 85% of available space as fallback
              // (leaves a gap to reduce chance of cutting through text)
              slicePx = Math.floor(availPx * 0.85);
            }
          }

          if (slicePx <= 0) break;

          const sliceMm = slicePx / pxPerMm;

          // Create the slice canvas
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = slicePx;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              canvasY,
              canvas.width,
              slicePx,
              0,
              0,
              canvas.width,
              slicePx
            );
          }

          const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.98);
          pdf.addImage(
            sliceData,
            "JPEG",
            marginX,
            currentY,
            imgWidth,
            sliceMm
          );

          canvasY += slicePx;
          remainingPx -= slicePx;
          sliceIdx++;

          if (remainingPx > 5) {
            // More content to come — start a new page
            pdf.addPage();
            currentY = drawPageHeader();
            // "Continued" label
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(7.5);
            pdf.setTextColor(140, 140, 140);
            pdf.text(`${sectionLabel} (continued)`, marginX, currentY);
            pdf.setTextColor(0, 0, 0);
            currentY += 5;
          } else {
            currentY = currentY + sliceMm + 5;
          }
        }

        return currentY;
      };

      // ═══════════════════════════════════════════
      // Main export loop
      // ═══════════════════════════════════════════
      const allSections = Array.from(
        container.querySelectorAll<HTMLElement>(".pdf-section")
      ).filter((s) => s.offsetHeight > 0);

      const totalSections = allSections.length;
      let currentY = drawPageHeader();

      for (let i = 0; i < allSections.length; i++) {
        const section = allSections[i];
        const sectionKey =
          section.getAttribute("data-section-key") || `Section ${i + 1}`;
        const sectionLabel = sectionKey
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        setStatusText(`Capturing: ${sectionLabel}`);
        setProgress(Math.round(((i + 1) / totalSections) * 90));

        await wait(150);
        const canvas = await captureSection(section);

        // Calculate section image height in mm
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        const remainingSpace = usableHeight - currentY;

        // If less than 55mm remaining and section won't fit, start new page
        // This prevents cramming a section header at the bottom of a page
        if (remainingSpace < 55 && imgHeight > remainingSpace) {
          pdf.addPage();
          currentY = drawPageHeader();
        }

        currentY = addImageSmartBreak(canvas, currentY, section, sectionLabel);
      }

      // Remove trailing blank page (if last page has barely any content)
      const totalPages = pdf.getNumberOfPages();
      if (totalPages > 1 && currentY <= headerHeight + 15) {
        pdf.deletePage(totalPages);
      }

      // ═══════════════════════════════════════════
      // Add footers to every page
      // ═══════════════════════════════════════════
      setStatusText("Finalizing report...");
      setProgress(95);

      const pageCount = pdf.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        pdf.setPage(p);
        drawPageFooter(p, pageCount);
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
          whiteSpace: "nowrap",
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
