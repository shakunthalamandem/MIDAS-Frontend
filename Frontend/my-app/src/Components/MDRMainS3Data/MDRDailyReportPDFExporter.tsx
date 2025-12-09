import React, { useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface MDRDailyReportPDFExporterProps {
  targetId: string;
  fileName?: string;
  headerTitle?: string;
  onTogglePdfMode?: (active: boolean) => void;
}

const waitForLayout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 120));
  });

const drawHeader = (pdf: jsPDF, headerTitle: string) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 32, 96);
  const title = headerTitle?.trim?.() || "Monashee Daily Portfolio Report";
  pdf.text(title, 10, 12);
  pdf.setDrawColor(0, 32, 96);
  pdf.setLineWidth(0.3);
  pdf.line(10, 15, pdfWidth - 10, 15);
  pdf.setTextColor(0, 0, 0);
  return 20;
};

const addFooter = (pdf: jsPDF) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const pageCount = pdf.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 38, pdfHeight - 10);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      "Do not copy. Do not distribute.",
      pdfWidth / 2,
      pdfHeight - 10,
      { align: "center" }
    );
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
  }
};

// use higher scale so numbers / text look clearer
const getCanvasScale = () => {
  if (typeof window === "undefined") return 2;
  const ratio = window.devicePixelRatio || 1;
  // keep it reasonable so file size doesn’t explode
  return Math.min(Math.max(ratio, 1.5), 3);
};

/**
 * Deduplicate .mdr-pdf-section elements:
 * - build a key for each section (dataset.pdfKey, data-pdf-title, heading text, or index)
 * - keep only the LAST occurrence for each key
 * This lets us drop the “screen version” of a section and keep the later, clearer PDF version.
 */
const dedupePdfSections = (sections: HTMLElement[]): HTMLElement[] => {
  const seenKeys = new Set<string>();
  const result: HTMLElement[] = [];

  for (let i = sections.length - 1; i >= 0; i--) {
    const sec = sections[i];

    const heading =
      sec.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim() || "";
    const key =
      sec.dataset.pdfKey ||
      sec.getAttribute("data-pdf-title") ||
      heading ||
      `__index_${i}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      // we’re iterating from the end, so unshift to restore DOM order
      result.unshift(sec);
    }
  }

  return result;
};

const MDRDailyReportPDFExporter: React.FC<MDRDailyReportPDFExporterProps> = ({
  targetId,
  fileName = "Monashee_Daily_Portfolio_Report.pdf",
  headerTitle = "Monashee Daily Portfolio Report",
  onTogglePdfMode,
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const root = document.getElementById(targetId);
    if (!root) {
      console.error(`PDF export root #${targetId} not found`);
      return;
    }

    setLoading(true);
    onTogglePdfMode?.(true);

    try {
      await waitForLayout();

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginX = 10;
      const bottomMargin = 18;
      const contentWidth = pdfWidth - marginX * 2;

      let cursorY = drawHeader(pdf, headerTitle);

      // --- FIND & DEDUPE PDF SECTIONS ---
      const rawSections =
        Array.from(root.querySelectorAll<HTMLElement>(".mdr-pdf-section")) ||
        [];

      const sections = rawSections.length
        ? dedupePdfSections(rawSections)
        : [];

      const targets = sections.length ? sections : [root];
      let isFirstSection = true;

      for (const section of targets) {
        const attrBreakBefore =
          section.dataset.pdfBreakBefore === "true" ||
          section.dataset.pdfBreakBefore === "1";

        const minRemainingMm = 30; // guard to avoid crowding footer

        // Estimate section height in mm based on scrollHeight.
        const pxToMm = 25.4 / 96; // assuming 96dpi
        const estimatedSectionHeightMm =
          (section.scrollHeight ||
            section.getBoundingClientRect().height ||
            0) * pxToMm;
        const availableHeightMmBefore = pdfHeight - bottomMargin - cursorY;

        let breakBefore = attrBreakBefore;

        // If the section is tall and we don't have enough room,
        // force it to start on a new page so it doesn't get awkwardly split.
        if (
          !breakBefore &&
          !isFirstSection &&
          estimatedSectionHeightMm > 0 &&
          availableHeightMmBefore > 0 &&
          availableHeightMmBefore < estimatedSectionHeightMm * 0.9
        ) {
          breakBefore = true;
        }

        // Existing "break before" behaviour
        if (breakBefore && !isFirstSection) {
          pdf.addPage();
          cursorY = drawHeader(pdf, headerTitle);
        } else if (
          !breakBefore &&
          cursorY > pdfHeight - bottomMargin - minRemainingMm
        ) {
          // Still keep the simple guard near the footer
          pdf.addPage();
          cursorY = drawHeader(pdf, headerTitle);
        }

        const prevStyles: Array<{
          el: HTMLElement;
          key: string;
          val: string | null;
        }> = [];
        const remember = (el: HTMLElement, key: string, val: string) => {
          prevStyles.push({ el, key, val: (el.style as any)[key] ?? null });
          (el.style as any)[key] = val;
        };

        // Relax constraints so horizontal scroll and overflow are fully captured
        const relaxLayout = (el: HTMLElement) => {
          const width = Math.max(el.scrollWidth, el.clientWidth);
          remember(el, "backgroundColor", "#ffffff");
          remember(el, "overflow", "visible");
          remember(el, "overflowX", "visible");
          remember(el, "overflowY", "visible");
          remember(el, "maxHeight", "none");
          remember(el, "height", "auto");
          remember(el, "width", `${width}px`);

          const children = Array.from(el.querySelectorAll<HTMLElement>("*"));
          children.forEach((child) => {
            const childWidth = Math.max(child.scrollWidth, child.clientWidth);
            remember(child, "backgroundColor", "#ffffff");
            remember(child, "overflow", "visible");
            remember(child, "overflowX", "visible");
            remember(child, "overflowY", "visible");
            remember(child, "maxHeight", "none");
            remember(child, "height", "auto");
            remember(child, "width", `${childWidth}px`);
          });
        };

        relaxLayout(section);

        const canvas = await html2canvas(section, {
          scale: getCanvasScale(), // sharper capture
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: section.scrollWidth,
          windowHeight: section.scrollHeight,
          scrollY: -window.scrollY,
        });

        const mmPerPx = contentWidth / canvas.width;
        const gapMm = 6;
        const overlapPx = 40; // more overlap so numbers/rows aren't visually cut
        let offsetPx = 0;

        while (offsetPx < canvas.height) {
          const remainingPx = canvas.height - offsetPx;
          const availableHeightMm = pdfHeight - bottomMargin - cursorY;

          if (availableHeightMm <= 0) {
            pdf.addPage();
            cursorY = drawHeader(pdf, headerTitle);
            continue;
          }

          const availableHeightPx = availableHeightMm / mmPerPx;
          // round slice height a bit to avoid weird partial rows
          const sliceHeightPx = Math.min(
            remainingPx,
            Math.floor(availableHeightPx)
          );
          if (sliceHeightPx <= 0) break;

          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.ceil(sliceHeightPx);
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              offsetPx,
              canvas.width,
              sliceHeightPx,
              0,
              0,
              canvas.width,
              sliceHeightPx
            );
          }

          const sliceImg = sliceCanvas.toDataURL("image/jpeg", 0.95);
          const sliceHeightMm = sliceHeightPx * mmPerPx;

          pdf.addImage(
            sliceImg,
            "JPEG",
            marginX,
            cursorY,
            contentWidth,
            sliceHeightMm,
            undefined,
            "FAST"
          );

          const isLastSlice = remainingPx <= availableHeightPx;
          if (isLastSlice) {
            // Consume remaining pixels; avoid tiny overlapping fragments that draw horizontal lines
            offsetPx = canvas.height;
          } else {
            const stepPx =
              sliceHeightPx - Math.min(overlapPx, sliceHeightPx * 0.2);
            offsetPx += stepPx > 0 ? stepPx : sliceHeightPx;
          }

          cursorY += sliceHeightMm + gapMm;

          if (cursorY > pdfHeight - bottomMargin) {
            pdf.addPage();
            cursorY = drawHeader(pdf, headerTitle);
          }
        }

        prevStyles.forEach(({ el, key, val }) => {
          (el.style as any)[key] = val ?? "";
        });

        isFirstSection = false;
      }

      addFooter(pdf);
      pdf.save(fileName);
    } catch (err) {
      console.error("Failed to generate MDR PDF:", err);
    } finally {
      onTogglePdfMode?.(false);
      setLoading(false);
    }
  };

  return (
    <Box position="relative" display="inline-flex">
      <Button
        variant="contained"
        onClick={handleExport}
        disabled={loading}
        sx={{
          backgroundColor: "#002060",
          color: "#fff",
          textTransform: "none",
          px: 2.5,
          minWidth: 180,
        }}
      >
        {loading ? "Generating PDF..." : "Generate PDF"}
      </Button>
      {loading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(255,255,255,0.5)"
          borderRadius={1}
        >
          <CircularProgress size={22} />
        </Box>
      )}
    </Box>
  );
};

export default MDRDailyReportPDFExporter;
