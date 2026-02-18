import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button, CircularProgress, Box, Backdrop, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

interface RiskDashboardPDFExporterProps {
  exportContainerId: string;
  fileName?: string;
  headerTitle?: string;
  fundName?: string;
  reportDate?: string;
}

const waitForRender = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 300);
    });
  });

const RiskDashboardPDFExporter: React.FC<RiskDashboardPDFExporterProps> = ({
  exportContainerId,
  fileName = "Risk_PNL_Attribution_Report.pdf",
  headerTitle = "Risk & PNL Attribution Dashboard",
  fundName = "",
  reportDate = "",
}) => {
  const [loading, setLoading] = useState(false);

  const handleExportPDF = async () => {
    const container = document.getElementById(exportContainerId);
    if (!container) return;

    setLoading(true);

    try {
      // Add pdf-export-mode class for clean rendering
      container.classList.add("pdf-export-mode");
      await waitForRender();

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginX = 10;
      const contentWidth = pdfWidth - marginX * 2;
      const bottomMargin = 18;
      const headerHeight = 28;

      // Draw PDF header on each page
      const drawPageHeader = () => {
        // Header background
        pdf.setFillColor(0, 32, 96);
        pdf.rect(0, 0, pdfWidth, headerHeight, "F");

        // Title text
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text(headerTitle, marginX, 12);

        // Subtitle with fund and date
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(180, 200, 230);
        const subtitle = [fundName, reportDate].filter(Boolean).join("  |  ");
        if (subtitle) {
          pdf.text(subtitle, marginX, 19);
        }

        // Right side - generated timestamp
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
        pdf.text(`Generated: ${timestamp}`, pdfWidth - marginX, 19, { align: "right" });

        // Accent line
        pdf.setDrawColor(16, 185, 129);
        pdf.setLineWidth(0.8);
        pdf.line(0, headerHeight, pdfWidth, headerHeight);

        pdf.setTextColor(0, 0, 0);

        return headerHeight + 6;
      };

      let currentY = drawPageHeader();

      // Get all pdf-section elements
      const sections = container.querySelectorAll<HTMLElement>(".pdf-section");

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        const canvas = await html2canvas(section, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          windowWidth: section.scrollWidth,
          windowHeight: section.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = contentWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        // Check if we need a new page
        if (currentY + imgHeight > pdfHeight - bottomMargin) {
          pdf.addPage();
          currentY = drawPageHeader();
        }

        pdf.addImage(imgData, "JPEG", marginX, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 4;
      }

      // Add page numbers
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

        // Footer line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(marginX, pdfHeight - 14, pdfWidth - marginX, pdfHeight - 14);

        // Footer text
        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.text("MIDAS - Risk & PNL Attribution Report", marginX, pdfHeight - 8);
      }

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      container.classList.remove("pdf-export-mode");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleExportPDF}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <PictureAsPdfIcon />}
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

      {/* Full-screen loading overlay */}
      <Backdrop
        open={loading}
        sx={{ color: "#fff", zIndex: 9999, flexDirection: "column", gap: 2 }}
      >
        <CircularProgress color="inherit" size={48} />
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Generating PDF Report...
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          Please wait while we prepare your report
        </Typography>
      </Backdrop>
    </>
  );
};

export default RiskDashboardPDFExporter;
