import jsPDF from "jspdf";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

export type DealBotBasicDealDetails = {
  ticker?: string;
  pricing_date?: string;
  deal_type?: string;
  unique_deal_id?: string;
  deal_id?: string;
};

type ExportDealBotPdfParams = {
  basicDealDetails: DealBotBasicDealDetails;
  apiData: any;
  question: string;
  blocks: Block[];
};

const safeFileName = (value: string) =>
  (value || "Deal")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);

const cleanReportText = (value: string): string => {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(\d+)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const shouldSkipReportLine = (value: string): boolean => {
  const v = value.toLowerCase();
  if (!v) return true;
  const exactSkips = new Set([
    "text",
    "card",
    "table",
    "chart",
    "pie",
    "bar-chart",
    "line-chart",
    "metric",
    "data",
    "value",
    "label",
    "name",
    "title",
    "subtitle",
    "description",
    "content",
    "response",
    "answer",
    "quick insights",
  ]);
  if (exactSkips.has(v)) return true;
  if (v.length <= 2) return true;
  return false;
};

const extractBlockLines = (blocks: Block[]): string[] => {
  const lines: string[] = [];
  const seen = new Set<string>();

  const tryAdd = (value: unknown) => {
    if (typeof value !== "string") return;
    const normalized = cleanReportText(value);
    if (shouldSkipReportLine(normalized)) return;
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    lines.push(normalized);
  };

  const walk = (node: unknown) => {
    if (node == null) return;
    if (typeof node === "string") {
      tryAdd(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === "object") {
      const record = node as Record<string, unknown>;
      [
        "title",
        "heading",
        "label",
        "name",
        "subtitle",
        "content",
        "text",
        "summary",
        "description",
        "value",
      ].forEach((key) => tryAdd(record[key]));
      Object.values(record).forEach(walk);
    }
  };

  walk(blocks);
  return lines;
};

export const exportDealBotPdf = ({
  basicDealDetails,
  apiData,
  question,
  blocks,
}: ExportDealBotPdfParams) => {
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 12;
  const contentTop = 24;
  const contentBottom = pageHeight - 16;
  const maxTextWidth = pageWidth - marginX * 2;
  let cursorY = contentTop;

  const dealName =
    (apiData?.company_name as string | undefined) ||
    (apiData?.issuer_name as string | undefined) ||
    basicDealDetails.ticker ||
    "Deal";

  const ticker = basicDealDetails.ticker || "N/A";
  const pricingDate = basicDealDetails.pricing_date || "N/A";
  const extractedLines = extractBlockLines(blocks);
  const quickInsightLines = extractedLines.filter((line) => !line.toLowerCase().includes("query"));

  const drawPageBackground = () => {
    pdf.setFillColor(255, 243, 248);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(251, 230, 239);
    pdf.rect(0, 0, 7, pageHeight, "F");
    pdf.setFillColor(245, 213, 228);
    pdf.circle(pageWidth - 12, 14, 16, "F");
    pdf.setFillColor(255, 223, 236);
    pdf.circle(pageWidth - 4, pageHeight - 8, 20, "F");
  };

  const drawPageHeader = () => {
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(marginX, 10, pageWidth - marginX * 2, 12, 2, 2, "F");
    pdf.setDrawColor(227, 178, 198);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, 10, pageWidth - marginX * 2, 12, 2, 2, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(105, 36, 74);
    pdf.text("MIDAS Deal Bot Report", marginX + 3, 17.7);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(122, 70, 96);
    const rightLabel = `${ticker} | ${pricingDate}`;
    pdf.text(rightLabel, pageWidth - marginX - pdf.getTextWidth(rightLabel), 17.7);
  };

  const addNewPage = () => {
    pdf.addPage();
    drawPageBackground();
    drawPageHeader();
    cursorY = contentTop;
  };

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight > contentBottom) {
      addNewPage();
    }
  };

  const drawSectionHeading = (label: string) => {
    ensureSpace(12);
    pdf.setFillColor(245, 208, 224);
    pdf.roundedRect(marginX, cursorY, maxTextWidth, 9, 2, 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(97, 34, 68);
    pdf.text(label, marginX + 3, cursorY + 6.1);
    cursorY += 12;
  };

  const writeWrapped = (
    text: string,
    fontSize = 11,
    style: "normal" | "bold" = "normal",
    color: [number, number, number] = [44, 33, 53],
    lineGap = 1.4
  ) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(text, maxTextWidth - 2);
    const lineHeight = fontSize * 0.3528 * lineGap;

    lines.forEach((line: string) => {
      ensureSpace(lineHeight + 2);
      pdf.text(line, marginX + 1, cursorY);
      cursorY += lineHeight;
    });
  };

  const drawCoverPage = () => {
    drawPageBackground();

    const cardX = 14;
    const cardY = 16;
    const cardW = pageWidth - 28;
    const cardH = pageHeight - 32;
    const generatedAt = new Date().toLocaleString();

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, "F");
    pdf.setDrawColor(232, 188, 208);
    pdf.setLineWidth(0.55);
    pdf.roundedRect(cardX, cardY, cardW, cardH, 6, 6, "S");

    // Header ribbon
    pdf.setFillColor(248, 214, 229);
    pdf.roundedRect(cardX, cardY, cardW, 42, 6, 6, "F");
    pdf.setFillColor(242, 198, 219);
    pdf.rect(cardX, cardY + 34, cardW, 8, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(26);
    pdf.setTextColor(96, 34, 69);
    pdf.text("MIDAS", cardX + 10, cardY + 17);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(124, 68, 96);
    pdf.text("Monashee Insights & Data Application System", cardX + 10, cardY + 25.5);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(103, 47, 75);
    const reportTag = "DEAL BOT ANALYSIS REPORT";
    pdf.text(reportTag, cardX + cardW - pdf.getTextWidth(reportTag) - 10, cardY + 17);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(131, 83, 107);
    const confidentialText = "STRICTLY CONFIDENTIAL";
    pdf.text(
      confidentialText,
      cardX + cardW - pdf.getTextWidth(confidentialText) - 10,
      cardY + 25.5
    );

    // Deal block
    const dealBoxY = cardY + 52;
    pdf.setFillColor(255, 247, 251);
    pdf.roundedRect(cardX + 8, dealBoxY, cardW - 16, 34, 4, 4, "F");
    pdf.setDrawColor(236, 200, 218);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(cardX + 8, dealBoxY, cardW - 16, 34, 4, 4, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(132, 76, 105);
    pdf.text("DEAL", cardX + 13, dealBoxY + 10);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(80, 30, 59);
    const dealNameLines = pdf.splitTextToSize(dealName, cardW - 26);
    pdf.text(dealNameLines, cardX + 13, dealBoxY + 21);

    // Metadata tiles
    const tileY = dealBoxY + 42;
    const gutter = 4;
    const tileW = (cardW - 16 - gutter * 2) / 3;
    const tileX1 = cardX + 8;
    const tileX2 = tileX1 + tileW + gutter;
    const tileX3 = tileX2 + tileW + gutter;

    const drawMetaTile = (x: number, title: string, value: string) => {
      pdf.setFillColor(251, 233, 242);
      pdf.roundedRect(x, tileY, tileW, 26, 3, 3, "F");
      pdf.setDrawColor(237, 202, 219);
      pdf.setLineWidth(0.25);
      pdf.roundedRect(x, tileY, tileW, 26, 3, 3, "S");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(113, 48, 79);
      pdf.text(title, x + 4, tileY + 8);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(68, 34, 51);
      const valueLines = pdf.splitTextToSize(value, tileW - 8);
      pdf.text(valueLines, x + 4, tileY + 16);
    };

    drawMetaTile(tileX1, "Ticker", ticker);
    drawMetaTile(tileX2, "Pricing Date", pricingDate);
    drawMetaTile(tileX3, "Generated", generatedAt);

    // Included sections
    const sectionBoxY = tileY + 36;
    pdf.setFillColor(255, 248, 252);
    pdf.roundedRect(cardX + 8, sectionBoxY, cardW - 16, 64, 3, 3, "F");
    pdf.setDrawColor(236, 200, 218);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(cardX + 8, sectionBoxY, cardW - 16, 64, 3, 3, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(109, 43, 75);
    pdf.text("Included in this export", cardX + 13, sectionBoxY + 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.6);
    pdf.setTextColor(64, 36, 51);
    pdf.text("- Deal metadata", cardX + 13, sectionBoxY + 20);
    pdf.text("- Query submitted in Deal Bot", cardX + 13, sectionBoxY + 29);
    pdf.text("- Quick insights and analysis blocks", cardX + 13, sectionBoxY + 38);
    pdf.text("- Structured extracted lines from response cards", cardX + 13, sectionBoxY + 47);
    pdf.text("- Export timestamp and pagination", cardX + 13, sectionBoxY + 56);

    // Footer note
    pdf.setDrawColor(232, 188, 208);
    pdf.setLineWidth(0.35);
    pdf.line(cardX + 8, cardY + cardH - 24, cardX + cardW - 8, cardY + cardH - 24);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9.2);
    pdf.setTextColor(129, 86, 108);
    pdf.text(
      "Prepared for internal review. Distribution outside approved channels is restricted.",
      cardX + 10,
      cardY + cardH - 15
    );
  };

  drawCoverPage();
  addNewPage();

  drawSectionHeading("Deal Metadata");
  writeWrapped(`Deal: ${dealName}`, 10.5, "bold", [80, 31, 60]);
  writeWrapped(`Ticker: ${ticker}`, 10);
  writeWrapped(`Pricing Date: ${pricingDate}`, 10);
  writeWrapped(`Generated: ${new Date().toLocaleString()}`, 9.2, "normal", [108, 75, 93]);
  cursorY += 3;

  drawSectionHeading("Query");
  writeWrapped(cleanReportText(question.trim()) || "No query entered.", 10.2);
  cursorY += 3;

  drawSectionHeading("Quick Insights & Analysis");
  if (quickInsightLines.length === 0) {
    writeWrapped("No Deal Bot analysis is available yet.", 10.2, "normal", [108, 75, 93]);
  } else {
    quickInsightLines.forEach((line) => {
      const isSectionHeading =
        line.length < 42 &&
        /^[A-Za-z][A-Za-z0-9\s&/().-]*$/.test(line) &&
        !line.endsWith(".");

      if (isSectionHeading) {
        cursorY += 1;
        writeWrapped(line, 10.6, "bold", [103, 37, 74], 1.25);
      } else {
        writeWrapped(`- ${line}`, 9.9, "normal", [44, 33, 53], 1.32);
      }
    });
  }

  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(130, 90, 113);
    const pageText = `${i} / ${pageCount}`;
    pdf.text(pageText, pageWidth - marginX - pdf.getTextWidth(pageText), pageHeight - 6);
  }

  const fileName = `${safeFileName(dealName)}_DealBot_Report.pdf`;
  pdf.save(fileName);
};
