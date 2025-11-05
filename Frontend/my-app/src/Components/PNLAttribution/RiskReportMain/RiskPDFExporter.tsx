import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button, CircularProgress, Box } from "@mui/material";

interface RiskPDFExporterProps {
  exportId: string; // ID of container to export
  fileName?: string;
  buttonText?: string;
}

const RiskPDFExporter: React.FC<RiskPDFExporterProps> = ({
  exportId,
  fileName = "Fund_Report.pdf",
  buttonText = "Export PDF",
}) => {
  const [loading, setLoading] = useState(false);

  const handleExportPDF = async () => {
    const input = document.getElementById(exportId);
    if (!input) return;

    setLoading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const sections = input.querySelectorAll<HTMLElement>(".pdf-section");
      let positionY = 24;

      // Add header
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 32, 96);
      pdf.setFontSize(12);
      pdf.text("Risk Report", 10, 12);
      pdf.setFont("helvetica", "normal");
      pdf.text(new Date().toLocaleDateString(), pdfWidth - 50, 12);
      pdf.setTextColor(0, 0, 0);

      for (let i = 0; i < sections.length; i++) {
        // Force white background
        const section = sections[i];
        const canvas = await html2canvas(section, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          windowWidth: section.scrollWidth,
          windowHeight: section.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (positionY + imgHeight > pdfHeight - 20) {
          pdf.addPage();
          positionY = 20;
        }

        pdf.addImage(imgData, "PNG", 10, positionY, imgWidth, imgHeight);
        positionY += imgHeight + 10;
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 40, pdfHeight - 10);
        pdf.setTextColor(0, 0, 0);
      }

      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
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
