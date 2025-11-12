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
      const footnoteLineHeight = 4;
      const contentMarginX = 12;
      const contentWidth = pdfWidth - contentMarginX * 2;

      interface FootnoteEntry {
        heading: string;
        descriptionLines: string[];
        headingWidth: number;
      }

      const buildFootnoteEntries = (footnoteText: string) => {
        const previousFont = pdf.getFont();
        const previousFontSize = pdf.getFontSize();
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);

        const sanitizedLines = footnoteText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (!sanitizedLines.length) {
          return { entries: [] as FootnoteEntry[], lineCount: 0 };
        }

        const structured = sanitizedLines
          .map((line) => {
            const separatorIndex = line.indexOf(":");
            if (separatorIndex === -1) {
              return { heading: "", description: line };
            }
            return {
              heading: line.slice(0, separatorIndex).trim(),
              description: line.slice(separatorIndex + 1).trim(),
            };
          })
          .filter((entry) => entry.heading || entry.description);

        if (!structured.length) {
          return { entries: [] as FootnoteEntry[], lineCount: 0 };
        }

        const entries = structured.map((entry) => {
          let headingWidth = 0;
          if (entry.heading) {
            pdf.setFont("helvetica", "bold");
            headingWidth = pdf.getTextWidth(`${entry.heading}: `);
            pdf.setFont("helvetica", "normal");
          }
          const availableWidth = entry.heading
            ? Math.max(20, contentWidth - headingWidth)
            : contentWidth;
          const descriptionLines = entry.description
            ? pdf.splitTextToSize(entry.description, availableWidth)
            : [];
          return {
            heading: entry.heading,
            descriptionLines,
            headingWidth,
          };
        });

        const lineCount = entries.reduce((sum, entry, index) => {
          const descriptionCount = entry.descriptionLines.length;
          const entryLines =
            descriptionCount > 0
              ? descriptionCount
              : entry.heading
              ? 1
              : 0;
          const spacing = index < entries.length - 1 ? 1 : 0;
          return sum + entryLines + spacing;
        }, 0);

        pdf.setFont(previousFont.fontName, previousFont.fontStyle);
        pdf.setFontSize(previousFontSize);

        return { entries, lineCount };
      };

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
        const { entries: footnoteEntries, lineCount: footnoteLineCount } =
          buildFootnoteEntries(footnote);
        const footnoteHeight = footnoteLineCount
          ? footnoteLineCount * footnoteLineHeight + 4
          : 0;

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

        if (footnoteEntries.length) {
          const previousFont = pdf.getFont();
          const previousFontSize = pdf.getFontSize();
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(90, 90, 90);

          let footnoteY = positionY;
          const advanceLine = () => {
            footnoteY += footnoteLineHeight;
          };

          footnoteEntries.forEach((entry, entryIndex) => {
            const headingLabel = entry.heading ? `${entry.heading}:` : "";
            if (headingLabel) {
              pdf.setFont("helvetica", "bold");
              pdf.text(headingLabel, contentMarginX, footnoteY);
            }

            const hasDescription = entry.descriptionLines.length > 0;
            pdf.setFont("helvetica", "normal");

            if (hasDescription) {
              const firstLineX = headingLabel
                ? contentMarginX + entry.headingWidth
                : contentMarginX;
              pdf.text(entry.descriptionLines[0], firstLineX, footnoteY);
            }

            advanceLine();

            for (let j = 1; j < entry.descriptionLines.length; j++) {
              pdf.text(entry.descriptionLines[j], contentMarginX, footnoteY);
              advanceLine();
            }

            if (footnoteEntries.length > 1 && entryIndex < footnoteEntries.length - 1) {
              advanceLine();
            }
          });

          pdf.setTextColor(0, 0, 0);
          pdf.setFont(previousFont.fontName, previousFont.fontStyle);
          pdf.setFontSize(previousFontSize);
          positionY = footnoteY + 4;
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
