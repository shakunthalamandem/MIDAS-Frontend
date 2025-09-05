import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import introImage from "../../../../Assets/images/monashee_page1.png";
import monasheeLogo from "../../../../Assets/images/monashee_logo.png";
import { MONASHEE_DISCLAIMER_TEXT } from "../../../../constants/disclaimer";

type TickerData = {
  ticker: string;
  company_name?: string | null;
  exchange?: string | null;
  pricing_date?: string | null;
};

type UseFoPdfExportParams = {
  pages: string[];
  ipoData: TickerData | null;
  tickerFallback?: string;
  setForceExpand: (v: boolean) => void;
};

export function useFoPdfExport({ pages, ipoData, tickerFallback = "FO", setForceExpand }: UseFoPdfExportParams) {
  const exportFoPDF = async () => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [600, 420], compress: true });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

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
          pdf.addImage(cover, "PNG", 0, 0, pdfWidth, pdfHeight);
          const margin = 10;
          const color = [0, 32, 96] as const;
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

      // Expand accordions, then render content slices
      setForceExpand(true);
      await wait(700); // allow accordions/animations to fully expand

      const headerTopY = (() => { const logoH = 12, logoY = 10; return logoY + logoH + 2 + 5; })();
      const footerReserveMm = 28;

      // Hide UI controls (IconButtons, expanders) so they don't appear in PDF
      const hiddenEls: Array<{ el: HTMLElement; prev: string }> = [];
      const toHide = document.querySelectorAll<HTMLElement>(
        ".MuiIconButton-root, [data-expander=\"true\"]"
      );
      toHide.forEach((el) => {
        hiddenEls.push({ el, prev: el.style.visibility });
        el.style.visibility = "hidden";
      });

      for (const id of pages) {
        const el = document.getElementById(id);
        if (!el) continue;

        // Temporarily relax overflow/size constraints so full content (e.g., wide tables) is rendered
        const changed: Array<{ el: HTMLElement; prev: Record<string, string | null | undefined> }> = [];
        const remember = (node: HTMLElement, key: string, val: string) => {
          const found = changed.find((c) => c.el === node);
          if (found) {
            if (found.prev[key] === undefined) found.prev[key] = (node.style as any)[key] as any;
          } else {
            const prev: Record<string, string | null | undefined> = {};
            prev[key] = (node.style as any)[key];
            changed.push({ el: node, prev });
          }
          (node.style as any)[key] = val;
        };
        const relaxNode = (node: HTMLElement) => {
          const cs = window.getComputedStyle(node);
          const isScrollable = node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth;
          if (isScrollable || cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || cs.maxHeight !== 'none') {
            remember(node, 'overflow', 'visible');
            remember(node, 'overflowX', 'visible');
            remember(node, 'overflowY', 'visible');
            remember(node, 'maxHeight', 'none');
            remember(node, 'height', 'auto');
          }
          // Widen containers to accommodate full-width tables
          if (node.tagName === 'TABLE' || node.tagName === 'THEAD' || node.tagName === 'TBODY') {
            remember(node, 'width', 'auto');
          }
          // Disable animations/transitions during capture
          if (cs.animationName !== 'none' || cs.transitionDuration !== '0s') {
            remember(node, 'animation', 'none');
            remember(node, 'transition', 'none');
          }
        };
        const allNodes = [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))];
        allNodes.forEach(relaxNode);
        // Give layout a frame to settle
        await wait(50);

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          scrollY: -window.scrollY,
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
          backgroundColor: "#ffffff",
        });

        // Skip if element rendered with negligible height
        if (!canvas || canvas.height < 5) {
          continue;
        }

        const mmPerPx = pdfWidth / canvas.width;
        const availableHeightMm = Math.max(10, pdfHeight - headerTopY - footerReserveMm);
        const availableHeightPx = availableHeightMm / mmPerPx;

        let yOffsetPx = 0;
        const overlapPx = 12;
        while (yOffsetPx < canvas.height) {
          const remainingPx = canvas.height - yOffsetPx;
          // If remaining content is only overlap-sized, skip to avoid a nearly-blank trailing page
          if (remainingPx <= overlapPx + 1) break;
          const sliceHeightPx = Math.min(availableHeightPx, remainingPx);
          if (sliceHeightPx <= 1) break; // avoid blank/zero-height pages
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

        // Restore styles
        for (const c of changed) {
          for (const k in c.prev) {
            (c.el.style as any)[k] = (c.prev as any)[k];
          }
        }
      }

      // Restore hidden UI controls
      hiddenEls.forEach(({ el, prev }) => (el.style.visibility = prev));

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

      pdf.addPage();
      const { marginX, startY } = addDisclaimerHeader();
      const maxWidth = pdfWidth - marginX * 2;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10.5);
      pdf.setTextColor(60);
      const lines: string[] = (pdf as any).splitTextToSize(MONASHEE_DISCLAIMER_TEXT, maxWidth);
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
          // footer + new page + header
          const drawFooterLocal = () => {
            const footerTopY = pdfHeight - 22;
            pdf.setDrawColor(0, 32, 96);
            pdf.setLineWidth(1);
            pdf.line(10, footerTopY - 4, pdfWidth - 10, footerTopY - 4);
            pdf.setFontSize(7);
            pdf.setTextColor(100);
            pdf.setFont("helvetica", "normal");
            pdf.text(
              `Data as of ${dataAsOfText}. Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`,
              10,
              pdfHeight - 22,
              { maxWidth: pdfWidth - 20 }
            );
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(128);
            pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, pdfHeight - 10, { align: "center" });
          };
          drawFooterLocal();
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
      const fileBase = ipoData?.ticker || tickerFallback;
      pdf.save(`${fileBase}_FO_Report.pdf`);
    } finally {
      setForceExpand(false);
    }
  };

  return exportFoPDF;
}
