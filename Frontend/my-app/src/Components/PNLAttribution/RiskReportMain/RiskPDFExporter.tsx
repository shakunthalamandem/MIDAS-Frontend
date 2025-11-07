import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button, CircularProgress, Box } from "@mui/material";

interface RiskPDFExporterProps {
  exportId: string;
  fileName?: string;
  buttonText?: string;
  headerTitle?: string;
  onTogglePdfMode?: (active: boolean) => void;
}

const waitForLayout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 140);
    });
  });

const RiskPDFExporter: React.FC<RiskPDFExporterProps> = ({
  exportId,
  fileName = "Fund_Report.pdf",
  buttonText = "Export PDF",
  headerTitle = "Risk Report",
  onTogglePdfMode,
}) => {
  const [loading, setLoading] = useState(false);

  const handleExportPDF = async () => {
    const input = document.getElementById(exportId);
    if (!input) {
      return;
    }

    setLoading(true);
    onTogglePdfMode?.(true);

    try {
      await waitForLayout();

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const bottomMargin = 20;

      const drawHeader = () => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(0, 32, 96);
        const headerText = headerTitle.trim().length > 0 ? headerTitle : "Risk Report";
        const lines = pdf.splitTextToSize(headerText, pdfWidth - 20);
        pdf.text(lines, 10, 14);
        const headerHeight = Array.isArray(lines) ? lines.length * 6 : 6;
        pdf.setDrawColor(0, 32, 96);
        pdf.setLineWidth(0.3);
        pdf.line(10, 16 + headerHeight - 6, pdfWidth - 10, 16 + headerHeight - 6);
        pdf.setTextColor(0, 0, 0);
        return 18 + headerHeight;
      };

      let positionY = drawHeader();

      const sections = input.querySelectorAll<HTMLElement>(".pdf-section");

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const footnote = section.dataset.footnote ?? "";
        const footnoteLines = footnote
          ? footnote
              .split("\n")
              .flatMap((line) =>
                pdf.splitTextToSize(line.trim(), pdfWidth - 24)
              )
              .filter((line) => line.trim().length > 0)
          : [];
        const footnoteHeight = footnoteLines.length ? footnoteLines.length * 4 + 4 : 0;

        const canvas = await html2canvas(section, {
          scale: 1.5,
          backgroundColor: "#ffffff",
          useCORS: true,
          windowWidth: section.scrollWidth,
          windowHeight: section.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.82);
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (positionY + imgHeight + footnoteHeight > pdfHeight - bottomMargin) {
          pdf.addPage();
          positionY = drawHeader();
        }

        pdf.addImage(imgData, "JPEG", 10, positionY, imgWidth, imgHeight);
        positionY += imgHeight + 6;

        if (footnoteLines.length) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(90, 90, 90);
          pdf.text(footnoteLines, 12, positionY);
          pdf.setTextColor(0, 0, 0);
          positionY += footnoteHeight + 4;
        }

        positionY += 6;
      }

      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 40, pdfHeight - 10);
        pdf.setTextColor(0, 0, 0);
      }

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      onTogglePdfMode?.(false);
      setLoading(false);
    }
  };

  return (
    <Box position="relative">
      <Button
        variant="contained"
        onClick={handleExportPDF}
        disabled={loading}
        sx={{ backgroundColor: "#002060", color: "#fff", textTransform: "none", px: 3 }}
      >
        {loading ? "Generating PDF..." : buttonText}
      </Button>
      {loading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="rgba(255,255,255,0.6)"
          borderRadius={1}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default RiskPDFExporter;
