import React, { useState } from "react"
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, FormGroup, Typography } from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import jsPDF from "jspdf"
import monasheeLogo from "../../Assets/images/monashee_logo.png"
import introImage from "../../Assets/images/monashee_page1.png"
import calibriNormal from "../../Assets/fonts/calibri-normal"
import calibriBold from "../../Assets/fonts/calibri-bold"
import calibriItalic from "../../Assets/fonts/calibri-italic"

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */
interface PdfAutomationProps {
  ticker: string
  issuerName?: string | null
  exchange?: string | null
  pricingDate?: string | null
  uniqueDealId?: string | null
}

interface SectionSelection {
  dealInfo: boolean
  fairValue: boolean
  outlookSummary: boolean
  companyOverview: boolean
  keyMetrics: boolean
  financialHighlights: boolean
  comparativeMultiples: boolean
  valuation: boolean
  riskAssessment: boolean
  investmentSummary: boolean
}

interface AiOutlookData {
  executiveSummary: string
  week: string
  month: string
  volatility: string
  confidence: string
}

const DEFAULT_SECTIONS: SectionSelection = {
  dealInfo: true,
  fairValue: true,
  outlookSummary: false,
  companyOverview: true,
  keyMetrics: true,
  financialHighlights: true,
  comparativeMultiples: true,
  valuation: true,
  riskAssessment: true,
  investmentSummary: true,
}

const SECTION_LABELS: { key: keyof SectionSelection; label: string }[] = [
  { key: "dealInfo", label: "Deal Information" },
  { key: "fairValue", label: "Fair Value Estimate & IOI" },
  { key: "outlookSummary", label: "Proprietary Model Indication" },
  { key: "companyOverview", label: "Company Overview" },
  { key: "keyMetrics", label: "Key Metrics" },
  { key: "financialHighlights", label: "Financial Highlights" },
  { key: "comparativeMultiples", label: "Comparative Multiples" },
  { key: "valuation", label: "Valuation" },
  { key: "riskAssessment", label: "Risk Assessment" },
  { key: "investmentSummary", label: "Investment Summary" },
]

interface DealInfo {
  ticker_name: string; exchange: string; company_name: string
  pricing_date: string | null; filed_date: string | null; term_date: string | null; trade_date: string | null
  deal_size: number | null; shares_offered: number | null; nosh: number | null
  industry: string | null; sector: string | null; established_year: number | null
  lower_bound: number | null; upper_bound: number | null; bookrunners: string[]
}
interface FairValue {
  fair_value_estimate: string | number | null
  indication_of_interest: string | null
  after_market_threshold: string | null
}
interface CompanyOverview {
  business_overview: string[]; key_highlights: string[]; strengths: string[]; concerns: string[]
  differentiated_summary: string[]; use_of_proceeds: string[]
  principal_stockholders_preipo: string[]; key_management_personnel: string[]
}
interface CompMetricRow {
  competitor: string; price_usd: number | null; market_cap: number | null; ev_usd_million: number | null
  present_year_ev_sales: number | null; one_year_later_ev_sales: number | null
  present_year_price_earning: number | null; one_year_later_price_earning: number | null
  present_year_ev_ebitda: number | null; one_year_later_ev_ebitda: number | null
  sales_growth: number | null; eps_growth: number | null; ai_generated: boolean
}
interface RedFlagItem { category: string; score?: number; observation?: string; impact_risk?: string }
interface ApiResponse {
  deal_info: DealInfo; fair_value: FairValue; company_overview: CompanyOverview
  key_metrics: Record<string, { category?: string; color?: string | null; label?: string }>
  scoring_metrics: Record<string, number | null>
  financial_highlights: Record<string, unknown>
  comparative_multiples: {
    data: CompMetricRow[]
    aggregates: Record<string, { average: number | null; median: number | null }>
    latest_updated_at: string | null
  }
  valuation: { narrative: string[]; image_url: string | null }
  risk_assessment: { data?: RedFlagItem[]; [key: string]: unknown }
  investment_summary: {
    writeup_finalverdict_summary: string
    writeup_overall_rating: number | null
    writeup_ratings: Record<string, number>
  }
}

const stripMd = (input?: unknown): string => {
  if (!input) return ""
  const s = typeof input === "string" ? input : String(input)
  return s
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*(?:\d+\.|[-*+])\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`+/g, "")
    .trim()
}

const parseAiOutlook = (record: Record<string, unknown>): AiOutlookData => {
  const outlookField = record["Final Sentiment & Volatility Outlook"]
  const pickObj = (obj: Record<string, string>, ...keys: string[]) =>
    stripMd(keys.map(k => obj[k]).find(Boolean) || "-")

  if (outlookField && typeof outlookField === "object") {
    const obj = outlookField as Record<string, string>
    return {
      executiveSummary: stripMd(record["Executive Summary"] as string),
      week: pickObj(obj, "1-Week Sentiment", "1-week sentiment"),
      month: pickObj(obj, "1-Month Sentiment", "1-month sentiment"),
      volatility: pickObj(obj, "Expected Volatility", "expected volatility"),
      confidence: pickObj(obj, "Confidence Level", "confidence level", "confidence"),
    }
  }
  const fromFinal = typeof outlookField === "string" ? outlookField : ""
  const extract = (label: string) => {
    const m = fromFinal.match(new RegExp(`${label}\\s*:\\s*([^\\n]+)`, "i"))
    return stripMd(m?.[1]?.trim() || "-")
  }
  return {
    executiveSummary: stripMd(record["Executive Summary"] as string),
    week: extract("1-week sentiment"),
    month: extract("1-month sentiment"),
    volatility: extract("expected volatility"),
    confidence: extract("confidence level") || extract("confidence"),
  }
}

/* ═══════════════════════════════════════════════
   Design tokens — Word doc spec
   ═══════════════════════════════════════════════ */
// Colors
const BLACK: [number, number, number] = [0, 0, 0]
const NAVY: [number, number, number] = [0, 32, 96]
const DARK_GRAY: [number, number, number] = [100, 100, 100]
const TABLE_HEADER_BG: [number, number, number] = [243, 244, 246]  // 5% gray
const TABLE_ALT_ROW: [number, number, number] = [249, 250, 252]
const TABLE_BORDER: [number, number, number] = [220, 220, 225]
const GREEN: [number, number, number] = [22, 128, 57]
const AMBER: [number, number, number] = [180, 130, 0]
const RED: [number, number, number] = [195, 45, 45]
const WHITE: [number, number, number] = [255, 255, 255]

// Layout — 1 inch margins = 25.4mm
const PW = 210
const PH = 297
const MG = 25.4  // 1 inch
const CW = PW - MG * 2  // content width

// Typography (pt → mm: 1pt = 0.3528mm)
const PT = 0.3528
const H1_SIZE = 14       // Heading 1
const H2_SIZE = 11.5     // Heading 2
const BODY_SIZE = 10.5   // Body text
const TABLE_HDR_SIZE = 10
const TABLE_BODY_SIZE = 9.5
const FOOTER_SIZE = 8
const DISCLAIMER_SIZE = 8.5
const BULLET_SIZE = 10.5

// Spacing
const H1_BEFORE = 18 * PT  // 18pt before heading 1
const H1_AFTER = 8 * PT
const H2_BEFORE = 12 * PT
const H2_AFTER = 4 * PT
const BODY_AFTER = 4 * PT
const LINE_SPACING = 1.15
const BULLET_LIST_AFTER = 6 * PT
const BULLET_INDENT = 6.35 // 0.25 inch

// Header / Footer area
const HDR_BOTTOM = MG + 12     // header ends here (logo + line)
const FOOTER_Y = PH - 18       // footer starts here
const USABLE_H = FOOTER_Y - 2  // max Y for content before footer

/* ═══════════════════════════════════════════════
   Utility functions
   ═══════════════════════════════════════════════ */
const strip = (html: string | null | undefined): string => {
  if (!html) return ""
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
const n2s = (v: number | string | null | undefined, dec = 2): string => {
  if (v == null || v === "") return "—"
  const n = typeof v === "string" ? parseFloat(v) : v
  if (isNaN(n)) return String(v)
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: dec })
}
const fDate = (v: string | null | undefined): string => {
  if (!v) return "—"
  try {
    const d = new Date(v)
    if (isNaN(d.getTime())) return v
    return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`
  } catch { return v }
}
const statusLabel = (c: string | null | undefined): { text: string; color: [number, number, number] } => {
  const lc = (c || "").toLowerCase()
  if (lc === "green") return { text: "Positive", color: GREEN }
  if (lc === "yellow" || lc === "amber") return { text: "Neutral", color: AMBER }
  if (lc === "red") return { text: "Negative", color: RED }
  return { text: c || "—", color: BLACK }
}

/* Split concatenated person entries */
const splitPersons = (items: string[]): string[] => {
  const result: string[] = []
  for (const raw of items) {
    const cleaned = strip(raw)
    if (!cleaned) continue
    const bySemicolon = cleaned.split(/[;]/).map(s => s.trim()).filter(Boolean)
    if (bySemicolon.length > 1) { result.push(...bySemicolon); continue }
    const split = cleaned.split(/(?<=[a-z)])(?=[A-Z][a-z]+ [A-Z]\.?\s)/g)
    if (split.length > 1) { result.push(...split.map(s => s.trim()).filter(Boolean)) }
    else { result.push(cleaned) }
  }
  return result
}

/* ═══════════════════════════════════════════════
   DocBuilder — Word-document-style PDF
   ═══════════════════════════════════════════════ */
class DocBuilder {
  private p: jsPDF
  private y = MG
  private logo: HTMLImageElement | null = null
  private intro: HTMLImageElement | null = null
  private company: string
  private asOf: string
  private pgNum = 0
  private lastHeading = ""  // track last heading for page-top repeat

  constructor(company: string, asOf: string) {
    this.p = new jsPDF("p", "mm", "a4")
    this.company = company
    this.asOf = asOf
    // Register Calibri fonts
    this.p.addFileToVFS("Calibri-Regular.ttf", calibriNormal)
    this.p.addFileToVFS("Calibri-Bold.ttf", calibriBold)
    this.p.addFileToVFS("Calibri-Italic.ttf", calibriItalic)
    this.p.addFont("Calibri-Regular.ttf", "Calibri", "normal")
    this.p.addFont("Calibri-Bold.ttf", "Calibri", "bold")
    this.p.addFont("Calibri-Italic.ttf", "Calibri", "italic")
  }

  async init() {
    const load = (src: string) =>
      new Promise<HTMLImageElement>((res) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => res(img)
        img.onerror = () => res(img)
        img.src = src
      })
    this.logo = await load(monasheeLogo)
    this.intro = await load(introImage)
  }

  private get avail() { return USABLE_H - this.y }

  private setFont(weight: "normal" | "bold" | "italic" = "normal", size = BODY_SIZE) {
    this.p.setFont("Calibri", weight)
    this.p.setFontSize(size)
  }

  private lineH(size = BODY_SIZE) { return size * PT * LINE_SPACING }

  private wrap(text: string, width: number, size = BODY_SIZE): string[] {
    this.setFont("normal", size)
    return (this.p as any).splitTextToSize(text, width) as string[]
  }

  private wrapBold(text: string, width: number, size = BODY_SIZE): string[] {
    this.setFont("bold", size)
    return (this.p as any).splitTextToSize(text, width) as string[]
  }

  /* ── Page management ───────────────────────── */
  private newPage() {
    if (this.pgNum > 0) this.drawFooter()
    this.p.addPage()
    this.pgNum++
    this.drawPageHeader()
  }

  private drawPageHeader() {
    const p = this.p
    // Logo top-right
    if (this.logo) {
      p.addImage(this.logo, "PNG", PW - MG - 36, 8, 36, 10.8, undefined, "FAST")
    }
    // Company name top-left
    this.setFont("bold", 10.5)
    p.setTextColor(...NAVY)
    p.text(this.company, MG, 15)
    // Navy line under header
    p.setDrawColor(...NAVY)
    p.setLineWidth(0.5)
    p.line(MG, 20, PW - MG, 20)
    // Reset font to normal so callers don't inherit bold
    this.setFont("normal", BODY_SIZE)
    p.setTextColor(...BLACK)
    this.y = 26
  }

  private drawFooter() {
    const p = this.p
    // Navy line above footer
    p.setDrawColor(...NAVY)
    p.setLineWidth(0.4)
    p.line(MG, FOOTER_Y, PW - MG, FOOTER_Y)
    // Footer text
    this.setFont("normal", FOOTER_SIZE)
    p.setTextColor(...DARK_GRAY)
    const asOfText = this.asOf ? `Data as of ${this.asOf}. ` : ""
    const footerLine1 = `${asOfText}Data from company management. The reader should not assume that investment decisions identified and discussed were or will be profitable.`
    const footerLines: string[] = (p as any).splitTextToSize(footerLine1, CW - 15)
    let fy = FOOTER_Y + 3
    for (const fl of footerLines) {
      p.text(fl, MG, fy)
      fy += FOOTER_SIZE * PT * 1.1
    }
    // "Do not copy" + page number on last line
    this.setFont("bold", 7.5)
    p.setTextColor(130, 130, 130)
    p.text("Do not copy. Do not distribute.", MG, PH - 8)
    this.setFont("normal", 7.5)
    p.text(`${this.pgNum}`, PW - MG, PH - 8, { align: "right" })
    p.setTextColor(...BLACK)
  }

  private ensureSpace(needed: number) {
    if (this.avail < needed) {
      this.newPage()
    }
  }

  /* ── Typography primitives ─────────────────── */
  /** Heading 1: 14pt Bold, #002060, space before 18pt, after 8pt */
  private h1(title: string) {
    // Never start body text at top — always have heading. If < 40mm, new page.
    if (this.avail < 40) this.newPage()
    this.y += H1_BEFORE
    this.lastHeading = title
    const p = this.p
    this.setFont("bold", H1_SIZE)
    p.setTextColor(...NAVY)
    p.text(title, MG, this.y)
    // Thin navy underline below heading
    p.setDrawColor(...NAVY)
    p.setLineWidth(0.3)
    p.line(MG, this.y + 2, PW - MG, this.y + 2)
    p.setTextColor(...BLACK)
    this.y += H1_AFTER + H1_SIZE * PT + 2
    this.setFont("normal", BODY_SIZE)
  }

  /** Heading 2: 11.5pt Bold, #002060, space before 12pt, after 4pt */
  private h2(title: string) {
    if (this.avail < 20) this.newPage()
    this.y += H2_BEFORE
    this.lastHeading = title
    const p = this.p
    this.setFont("bold", H2_SIZE)
    p.setTextColor(...NAVY)
    p.text(title, MG, this.y)
    p.setTextColor(...BLACK)
    this.y += H2_AFTER + H2_SIZE * PT
    this.setFont("normal", BODY_SIZE)
  }

  /** Body text: 10.5pt Regular, line spacing 1.15, space after 4pt */
  private body(text: string) {
    const cleaned = strip(text)
    if (!cleaned) return
    const p = this.p
    this.setFont("normal", BODY_SIZE)
    p.setTextColor(...BLACK)
    const lines = this.wrap(cleaned, CW)
    const lh = this.lineH(BODY_SIZE)
    for (const line of lines) {
      this.ensureSpace(lh + 1)
      // Restore font after possible page break
      this.setFont("normal", BODY_SIZE)
      p.setTextColor(...BLACK)
      p.text(line, MG, this.y)
      this.y += lh
    }
    this.y += BODY_AFTER
  }

  /** Bullet list: 10.5pt Regular, solid round bullet, 0.25" indent */
  private bulletList(items: string[]) {
    if (!items?.length) return
    const p = this.p
    const lh = this.lineH(BULLET_SIZE)
    const textX = MG + BULLET_INDENT
    const textW = CW - BULLET_INDENT
    for (const raw of items) {
      const cleaned = strip(raw)
      if (!cleaned) continue
      this.setFont("normal", BULLET_SIZE)
      p.setTextColor(...BLACK)
      const lines = this.wrap(cleaned, textW, BULLET_SIZE)
      // Ensure at least first 2 lines fit
      this.ensureSpace(Math.min(lines.length, 2) * lh + 2)
      // Restore font/color after possible page break
      this.setFont("normal", BULLET_SIZE)
      p.setTextColor(...BLACK)
      // Draw solid round bullet
      p.setFillColor(...BLACK)
      const bulletY = this.y - 0.8
      p.circle(MG + 2.5, bulletY, 0.6, "F")
      // Draw text
      for (const line of lines) {
        this.ensureSpace(lh + 0.5)
        // Restore font after possible page break
        this.setFont("normal", BULLET_SIZE)
        p.setTextColor(...BLACK)
        p.text(line, textX, this.y)
        this.y += lh
      }
      this.y += 1
    }
    this.y += BULLET_LIST_AFTER
  }

  /** Table with wrapping cells, vertically centered text */
  private table(
    headers: string[],
    rows: string[][],
    colW: number[],
    opts?: {
      boldFirstCol?: boolean
      rightAlignFrom?: number
      showHeader?: boolean
    }
  ) {
    const p = this.p
    const fs = TABLE_BODY_SIZE
    const hfs = TABLE_HDR_SIZE
    const lh = this.lineH(fs)
    const hlh = hfs * PT * LINE_SPACING
    const pad = 2.5
    const nCols = headers.length
    const raFrom = opts?.rightAlignFrom ?? -1
    const showHeader = opts?.showHeader !== false

    // ── Header ──
    if (showHeader) {
      // Compute header height based on multiline headers
      let maxHdrLines = 1
      const hdrLineArrays: string[][] = []
      for (let i = 0; i < nCols; i++) {
        const lines = headers[i].split("\n")
        hdrLineArrays.push(lines)
        maxHdrLines = Math.max(maxHdrLines, lines.length)
      }
      const hdrH = Math.max(maxHdrLines * hlh + 3, 7)

      this.ensureSpace(hdrH + lh * 2)
      // Header background
      p.setFillColor(...TABLE_HEADER_BG)
      p.rect(MG, this.y, CW, hdrH, "F")
      // Top border
      p.setDrawColor(...NAVY)
      p.setLineWidth(0.5)
      p.line(MG, this.y, PW - MG, this.y)

      this.setFont("bold", hfs)
      p.setTextColor(...NAVY)
      let x = MG
      for (let i = 0; i < nCols; i++) {
        const align = i >= raFrom && raFrom >= 0 ? "right" : "left"
        const tx = align === "right" ? x + colW[i] - pad : x + pad
        const hLines = hdrLineArrays[i]
        // Vertically center the header text block
        const textBlockH = hLines.length * hlh
        const startY = this.y + (hdrH - textBlockH) / 2 + hlh * 0.75
        let hy = startY
        for (const hl of hLines) {
          p.text(hl, tx, hy, { align })
          hy += hlh
        }
        x += colW[i]
      }
      this.y += hdrH
      // Bottom border of header
      p.setDrawColor(...NAVY)
      p.setLineWidth(0.4)
      p.line(MG, this.y, PW - MG, this.y)
      this.y += 0.3
    }

    // ── Data rows ──
    for (let r = 0; r < rows.length; r++) {
      // Calculate wrapped lines per cell
      this.setFont("normal", fs)
      let maxLines = 1
      const cellLines: string[][] = []
      for (let i = 0; i < nCols; i++) {
        const cellText = strip(rows[r]?.[i] ?? "—")
        const cellW = colW[i] - pad * 2
        const isFirst = i === 0 && opts?.boldFirstCol
        const wrapped = isFirst ? this.wrapBold(cellText, cellW, fs) : this.wrap(cellText, cellW, fs)
        cellLines.push(wrapped)
        maxLines = Math.max(maxLines, wrapped.length)
      }
      const cellPadV = 1.5
      const rowH = Math.max(maxLines * lh + cellPadV * 2, 5.5)

      this.ensureSpace(rowH + 1)

      // Alt row background
      if (r % 2 === 1) {
        p.setFillColor(...TABLE_ALT_ROW)
        p.rect(MG, this.y, CW, rowH, "F")
      }

      let x = MG
      for (let i = 0; i < nCols; i++) {
        const align = i >= raFrom && raFrom >= 0 ? "right" : "left"
        const tx = align === "right" ? x + colW[i] - pad : x + pad
        const isFirst = i === 0 && opts?.boldFirstCol
        this.setFont(isFirst ? "bold" : "normal", fs)
        p.setTextColor(...BLACK)

        // Vertically center cell text within the row
        const textBlockH = cellLines[i].length * lh
        const startCy = this.y + (rowH - textBlockH) / 2 + lh * 0.7
        let cy = startCy
        for (const ln of cellLines[i]) {
          p.text(ln, tx, cy, { align })
          cy += lh
        }
        x += colW[i]
      }
      this.y += rowH

      // Subtle row separator
      p.setDrawColor(230, 232, 238)
      p.setLineWidth(0.15)
      p.line(MG, this.y, PW - MG, this.y)
    }

    // Bottom border
    p.setDrawColor(...NAVY)
    p.setLineWidth(0.4)
    p.line(MG, this.y, PW - MG, this.y)
    this.y += 5
    p.setTextColor(...BLACK)
  }

  /** Rating bar for investment summary */
  private ratingBar(label: string, value: number | null, max = 10) {
    if (value == null) return
    this.ensureSpace(8)
    const p = this.p
    const barX = MG + 55
    const barW = 65
    const barH = 4

    this.setFont("normal", BODY_SIZE)
    p.setTextColor(...BLACK)
    p.text(label, MG, this.y + 3)

    // Track
    p.setFillColor(230, 232, 238)
    p.roundedRect(barX, this.y, barW, barH, 1.5, 1.5, "F")

    // Fill
    const pct = Math.min(Math.max(value / max, 0), 1)
    if (pct > 0) {
      const [r, g, b] = pct >= 0.7 ? GREEN : pct >= 0.4 ? AMBER : RED
      p.setFillColor(r, g, b)
      p.roundedRect(barX, this.y, barW * pct, barH, 1.5, 1.5, "F")
    }

    this.setFont("bold", 9)
    p.setTextColor(...BLACK)
    p.text(`${value}/${max}`, barX + barW + 3, this.y + 3)
    this.y += 7
    this.setFont("normal", BODY_SIZE)
  }

  /* ═════════════════════════════════════════════
     BUILD
     ═════════════════════════════════════════════ */
  async build(data: ApiResponse, ticker: string, exchange?: string | null, pricingDate?: string | null, sel: SectionSelection = DEFAULT_SECTIONS, aiOutlook?: AiOutlookData) {
    await this.init()
    const p = this.p
    const di = data.deal_info
    const fv = data.fair_value
    const co = data.company_overview
    const km = data.key_metrics
    const cm = data.comparative_multiples
    const va = data.valuation
    const ra = data.risk_assessment
    const inv = data.investment_summary
    const fh = data.financial_highlights

    /* ═══ COVER PAGE ═══════════════════════════ */
    if (this.intro) {
      p.addImage(this.intro, "PNG", 0, 0, PW, PH)
    }
    // Ticker + company on cover
    this.setFont("bold", 22)
    p.setTextColor(...NAVY)
    const tk = ticker.toUpperCase()
    p.text(tk, PW - MG - p.getTextWidth(tk), 24)
    if (di.company_name) {
      this.setFont("bold", 14)
      const cn = di.company_name.trim()
      p.text(cn, PW - MG - p.getTextWidth(cn), 34)
    }
    const coverParts = [exchange || di.exchange, fDate(pricingDate || di.pricing_date)].filter(Boolean)
    if (coverParts.length) {
      this.setFont("bold", 10.5)
      const pt = coverParts.join("  |  ")
      p.text(pt, PW - MG - p.getTextWidth(pt), 42)
    }
    p.setTextColor(...BLACK)

    /* ═══ CONTENT PAGES ════════════════════════ */
    this.newPage()

    // ── Deal Information ──
    if (sel.dealInfo) {
    this.h1("Deal Information")

    const bookStr = Array.isArray(di.bookrunners) && di.bookrunners.length > 0
      ? di.bookrunners.join(", ")
      : typeof di.bookrunners === "string" && (di.bookrunners as string).trim()
        ? (di.bookrunners as string).trim()
        : "—"
    const priceRange = di.lower_bound != null && di.upper_bound != null ? `$${n2s(di.lower_bound)} – $${n2s(di.upper_bound)}` : "—"

    this.table(
      ["Field", "Details"],
      [
        ["Ticker", di.ticker_name || ticker],
        ["Company", di.company_name || "—"],
        ["Exchange", di.exchange || "—"],
        ["Sector / Industry", [di.sector, di.industry].filter(Boolean).join(" — ") || "—"],
        ["Filed Date", fDate(di.filed_date)],
        ["Pricing Range Date", fDate(di.term_date)],
        ["Pricing Date", fDate(di.pricing_date)],
        ["First Trade Date", fDate(di.trade_date)],
        ["Price Range", priceRange],
        ["Deal Size ($ Million)", di.deal_size != null ? `$${n2s(di.deal_size)} M` : "—"],
        ["Shares Offered", n2s(di.shares_offered, 0)],
        ["Shares Outstanding", di.nosh != null ? `${n2s(di.nosh, 0)}M` : "—"],
        ["Established", di.established_year ? String(di.established_year) : "—"],
        ["Bookrunners", bookStr],
      ],
      [48, CW - 48],
      { boldFirstCol: true }
    )
    } // end dealInfo

    // ── Fair Value ──
    if (sel.fairValue) {
    this.h1("Fair Value Estimate & Indication of Interest")
    this.table(
      ["Metric", "Value"],
      [
        ["Fair Value Estimate", strip(String(fv.fair_value_estimate ?? "—"))],
        ["Indication of Interest", strip(String(fv.indication_of_interest ?? "—"))],
        ["After Market Threshold", strip(String(fv.after_market_threshold ?? "—"))],
      ],
      [55, CW - 55],
      { boldFirstCol: true }
    )
    } // end fairValue

    // ── Proprietary Model Indication ──
    if (sel.outlookSummary) {
      this.h1("Proprietary Model Indication")
      if (aiOutlook) {
        if (aiOutlook.executiveSummary) {
          this.body(aiOutlook.executiveSummary)
        }
        this.h2("Outlook Summary")
        this.table(
          ["Metric", "Value"],
          [
            ["1-Week Sentiment", aiOutlook.week || "—"],
            ["1-Month Sentiment", aiOutlook.month || "—"],
            ["Expected Volatility", aiOutlook.volatility || "—"],
            ["Confidence", aiOutlook.confidence || "—"],
          ],
          [55, CW - 55],
          { boldFirstCol: true }
        )
      } else {
        this.body("Proprietary Model Indication data is not available for this ticker.")
      }
    } // end outlookSummary

    // ── Company Overview ──
    if (sel.companyOverview) {
      this.h1("Company Overview")
      const sections: [string, string[], boolean][] = [
        ["Business Description", co.business_overview, false],
        ["Differentiated Summary", co.differentiated_summary, false],
        ["Key Highlights", co.key_highlights, false],
        ["Strengths", co.strengths, false],
        ["Concerns", co.concerns, false],
        ["Use of Proceeds", co.use_of_proceeds, false],
        ["Principal Stockholders (Pre-IPO)", co.principal_stockholders_preipo, true],
        ["Key Management Personnel", co.key_management_personnel, true],
      ]
      for (const [title, items, isPerson] of sections) {
        if (items?.length) {
          this.h2(title)
          const processed = isPerson ? splitPersons(items) : items
          this.bulletList(processed)
        }
      }
    } // end companyOverview

    // ── Key Metrics ──
    if (sel.keyMetrics) {
      this.h1("Key Metrics")
      const metricEntries = Object.entries(km)
      if (metricEntries.length > 0) {
        const metricRows: string[][] = []
        for (const [key, val] of metricEntries) {
          const criteria = strip(val?.label) || key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
          const st = statusLabel(val?.color)
          const notes = strip(val?.category) || "—"
          metricRows.push([criteria, st.text, notes])
        }
        this.table(
          ["Criteria", "Status", "Notes"],
          metricRows,
          [35, 18, CW - 53],
          { boldFirstCol: true }
        )
      } else {
        this.body("No key metrics data available.")
      }
    } // end keyMetrics

    // ── Financial Highlights ──
    if (sel.financialHighlights) {
      this.h1("Financial Overview")
      this.renderFinancials(fh)
    } // end financialHighlights

    // ── Comparative Multiples ──
    if (sel.comparativeMultiples) {
      this.h1("Comparative Multiples")
      if (cm.data?.length) {
        const cH = ["Company", "Price", "Mkt Cap", "EV ($M)", "EV/Sales\nCY", "EV/Sales\nNY", "P/E\nCY", "P/E\nNY", "Sales\nGr%", "EPS\nGr%"]
        const rawW = [26, 12, 16, 16, 14, 14, 12, 12, 14, 14]
        const tot = rawW.reduce((a, b) => a + b, 0)
        const cW = rawW.map(w => (w / tot) * CW)
        const cRows = cm.data.map(row => [
          row.competitor || "—", n2s(row.price_usd), n2s(row.market_cap, 0), n2s(row.ev_usd_million, 0),
          n2s(row.present_year_ev_sales), n2s(row.one_year_later_ev_sales),
          n2s(row.present_year_price_earning), n2s(row.one_year_later_price_earning),
          n2s(row.sales_growth), n2s(row.eps_growth),
        ])
        if (cm.aggregates) {
          const a = cm.aggregates
          cRows.push(
            ["Average", "", "", "", n2s(a.present_year_ev_sales?.average), n2s(a.one_year_later_ev_sales?.average),
              n2s(a.present_year_price_earning?.average), n2s(a.one_year_later_price_earning?.average),
              n2s(a.sales_growth?.average), n2s(a.eps_growth?.average)],
            ["Median", "", "", "", n2s(a.present_year_ev_sales?.median), n2s(a.one_year_later_ev_sales?.median),
              n2s(a.present_year_price_earning?.median), n2s(a.one_year_later_price_earning?.median),
              n2s(a.sales_growth?.median), n2s(a.eps_growth?.median)]
          )
        }
        this.table(cH, cRows, cW, { boldFirstCol: true, rightAlignFrom: 1 })
        if (cm.latest_updated_at) {
          this.setFont("italic", 8)
          p.setTextColor(...DARK_GRAY)
          p.text(`Source: FactSet — last updated ${fDate(cm.latest_updated_at)}`, MG, this.y)
          this.y += 5
          p.setTextColor(...BLACK)
        }
      } else {
        this.body("No comparable company data available.")
      }
    } // end comparativeMultiples

    // ── Valuation ──
    if (sel.valuation) {
      this.newPage()
      this.h1("Valuation")
      if (va.narrative?.length) {
        for (const item of va.narrative) {
          this.body(item)
        }
      } else {
        this.body("No valuation narrative available.")
      }
    } // end valuation

    // ── Risk Assessment ──
    if (sel.riskAssessment) {
      this.h1("Risks")
      const rfItems = Array.isArray(ra?.data) ? ra.data : []
      if (rfItems.length > 0) {
        const rfRows = rfItems.map(item => [
          item.category || "—",
          item.score != null ? `${item.score} / 5` : "—",
          strip(item.observation) || "—",
        ])
        this.table(
          ["Risk Category", "Score", "Observation"],
          rfRows,
          [35, 16, CW - 51],
          { boldFirstCol: true }
        )
      } else {
        this.body("No risk assessment data available.")
      }
    } // end riskAssessment

    // ── Investment Summary ──
    if (sel.investmentSummary) {
      this.h1("Investment Summary")
      if (inv.writeup_overall_rating != null) {
        this.ensureSpace(12)
        this.setFont("bold", 13)
        p.setTextColor(...NAVY)
        p.text(`Overall Rating: ${inv.writeup_overall_rating}%`, MG, this.y)
        p.setTextColor(...BLACK)
        this.y += 10
      }
      const ratings = inv.writeup_ratings || {}
      const ratingLabels: Record<string, string> = {
        "ai_indication": "AI Indication",
        "business-overview": "Business Overview",
        "key-metrics": "Key Metrics",
        "financial-highlights": "Financial Highlights",
        "comps": "Comparative Multiples",
        "valuation-analysis": "Valuation Analysis",
        "red-flag": "Risk Assessment",
      }
      const ratingEntries = Object.entries(ratings)
      if (ratingEntries.length > 0) {
        this.h2("Section Ratings")
        for (const [key, value] of ratingEntries) {
          this.ratingBar(ratingLabels[key] || key.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), value)
        }
        this.y += 4
      }
      if (inv.writeup_finalverdict_summary) {
        this.h2("Final Verdict")
        this.body(inv.writeup_finalverdict_summary)
      }
    } // end investmentSummary

    /* ═══ DISCLAIMER PAGE ═════════════════════ */
    this.newPage()

    this.h1("Disclaimer")
    const disclaimers = [
      "The information contained herein has been compiled by Monashee internally and may be based on unaudited data from the relevant funds' books and records, and hypothetical information that has not been verified or reconciled by such funds' administrator. As such, the information contained herein should not serve as any kind of basis for any investment decision.",
      "This document does not constitute advice or a recommendation or offer to sell or a solicitation to deal in any security or financial product. It is provided for information purposes only and on the understanding that the recipient has sufficient knowledge and experience to be able to understand and make their own evaluation of the proposals and services described herein, any risks associated therewith and any related legal, tax, accounting or other material considerations.",
      "Certain information contained herein has been obtained from third party sources and such information has not been independently verified by Monashee Investment Management. No representation, warranty, or undertaking, expressed or implied, is given to the accuracy or completeness of such information by Monashee Investment Management or any other person.",
      "Except where otherwise indicated, the information contained in this presentation is based on matters as they exist as of the date of preparation of such material and not as of the date of distribution or any future date. Recipients should not rely on this material in making any future investment decision.",
      "This presentation is confidential, is intended only for the person to whom it has been directly provided and under no circumstances may a copy be shown, copied, transmitted or otherwise be given to any person other than the authorized recipient without the prior written consent of Monashee Investment Management.",
      "There is no guarantee that the investment objectives will be achieved. Moreover, the past performance is not a guarantee or indicator of future results.",
    ]
    for (const text of disclaimers) {
      const cleaned = strip(text)
      this.setFont("normal", DISCLAIMER_SIZE)
      p.setTextColor(...DARK_GRAY)
      const lines = this.wrap(cleaned, CW, DISCLAIMER_SIZE)
      const lh = DISCLAIMER_SIZE * PT * 1.05
      for (const line of lines) {
        this.ensureSpace(lh + 1)
        // Restore font after possible page break
        this.setFont("normal", DISCLAIMER_SIZE)
        p.setTextColor(...DARK_GRAY)
        p.text(line, MG, this.y)
        this.y += lh
      }
      this.y += 3
    }
    p.setTextColor(...BLACK)

    this.drawFooter()
    return p
  }

  /* ── Financial Highlights — structured table ── */
  private renderFinancials(fh: Record<string, unknown>) {
    if (!fh || typeof fh !== "object" || Object.keys(fh).length === 0) {
      this.body("No financial highlights data available.")
      return
    }

    type YearData = Record<string, number | string | null>
    const yearKeysSet = new Set<string>()
    const metricNames = new Set<string>()
    const parsed: Record<string, YearData> = {}

    // Try nested format first
    let hasNested = false
    for (const [key, val] of Object.entries(fh)) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        hasNested = true
        yearKeysSet.add(key)
        parsed[key] = val as YearData
        for (const mk of Object.keys(val as object)) metricNames.add(mk)
      }
    }

    // Try flat format: "2024 A > EBIT" = value
    if (!hasNested) {
      for (const [key, val] of Object.entries(fh)) {
        const parts = key.split(" > ")
        if (parts.length === 2) {
          const yk = parts[0].trim()
          const mk = parts[1].trim()
          yearKeysSet.add(yk)
          metricNames.add(mk)
          if (!parsed[yk]) parsed[yk] = {}
          parsed[yk][mk] = val as number | string | null
        }
      }
    }

    const yearKeys = Array.from(yearKeysSet).sort((a, b) => {
      const ya = parseInt(a), yb = parseInt(b)
      if (!isNaN(ya) && !isNaN(yb) && ya !== yb) return ya - yb
      return a.localeCompare(b)
    })

    if (yearKeys.length === 0) {
      // Flat key-value fallback
      const pairs: string[][] = []
      for (const [k, v] of Object.entries(fh)) {
        pairs.push([k.replace(/_/g, " "), n2s(v as any)])
      }
      if (pairs.length > 0) {
        this.table(["Metric", "Value"], pairs, [70, CW - 70], { boldFirstCol: true })
      }
      return
    }

    const friendlyNames: Record<string, string> = {
      "Sales": "Revenue", "Sales Growth": "Revenue Growth",
      "EBITDA": "EBITDA", "EBITDA Margin": "EBITDA Margin",
      "EBIT": "EBIT", "EBIT Margin": "EBIT Margin",
      "Net Income": "Net Income", "Net Income Margin": "Net Income Margin",
    }
    const metricOrder = ["Sales", "Sales Growth", "EBITDA", "EBITDA Margin", "EBIT", "EBIT Margin", "Net Income", "Net Income Margin"]
    const ordered = metricOrder.filter(m => metricNames.has(m))
    for (const m of metricNames) { if (!ordered.includes(m)) ordered.push(m) }

    const headers = ["Metric ($M)", ...yearKeys]
    const mColW = 38
    const yColW = (CW - mColW) / yearKeys.length
    const colWidths = [mColW, ...yearKeys.map(() => yColW)]

    const rows: string[][] = ordered.map(metric => {
      const friendly = friendlyNames[metric] || metric
      const vals = yearKeys.map(yk => {
        const v = parsed[yk]?.[metric]
        if (v == null) return "—"
        const num = typeof v === "string" ? parseFloat(v) : v as number
        if (isNaN(num)) return String(v)
        if (metric.toLowerCase().includes("margin") || metric.toLowerCase().includes("growth")) return `${num.toFixed(1)}%`
        return n2s(num)
      })
      return [friendly, ...vals]
    })

    this.table(headers, rows, colWidths, { boldFirstCol: true, rightAlignFrom: 1 })
  }
}

/* ═══════════════════════════════════════════════
   React Component
   ═══════════════════════════════════════════════ */
const IPOWriteUpPdfAutomation: React.FC<PdfAutomationProps> = ({ ticker, issuerName, exchange, pricingDate, uniqueDealId }) => {
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selections, setSelections] = useState<SectionSelection>({ ...DEFAULT_SECTIONS })

  const handleCheckChange = (key: keyof SectionSelection, checked: boolean) =>
    setSelections(prev => ({ ...prev, [key]: checked }))

  const handleGenerate = async () => {
    setDialogOpen(false)
    setLoading(true)
    try {
      const apiUrl = process.env.REACT_APP_API_URL
      const token = localStorage.getItem("access_token")

      const [res, outlookRes] = await Promise.all([
        fetch(`${apiUrl}/api/ipo_writeup_pdf_data/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
          body: JSON.stringify({ ticker }),
        }),
        selections.outlookSummary
          ? fetch(`${apiUrl}/api/get_few_shot_review/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ticker, unique_deal_id: uniqueDealId ?? null }),
            })
          : Promise.resolve(null),
      ])

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(`Failed to fetch PDF data: ${(err as any)?.error || res.statusText}`)
        return
      }
      const data: ApiResponse = await res.json()

      let aiOutlook: AiOutlookData | undefined
      if (selections.outlookSummary && outlookRes?.ok) {
        try {
          const aiJson = await outlookRes.json()
          const answer = aiJson?.answer
          const first = Array.isArray(answer) && answer.length > 0 ? answer[0] : null
          if (first) aiOutlook = parseAiOutlook(first)
        } catch {
          // Outlook fetch failed — proceed without it
        }
      }

      const companyName = data.deal_info?.company_name || issuerName || ticker
      const dataAsOf = pricingDate ? fDate(pricingDate) : data.deal_info?.pricing_date ? fDate(data.deal_info.pricing_date) : ""

      const builder = new DocBuilder(companyName, dataAsOf)
      const pdf = await builder.build(data, ticker, exchange, pricingDate, selections, aiOutlook)
      pdf.save(`${ticker.toUpperCase()}_WriteUp_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error("PDF generation error:", err)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#002060", pb: 1 }}>
          Select Sections to Include
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <FormGroup>
            {SECTION_LABELS.map(({ key, label }) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={selections[key]}
                    onChange={(e) => handleCheckChange(key, e.target.checked)}
                    size="small"
                    sx={{ color: "#002060", "&.Mui-checked": { color: "#002060" } }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: key === "outlookSummary" ? 600 : 400 }}>
                      {label}
                    </Typography>
                    {key === "outlookSummary" && (
                      <Typography variant="caption" sx={{ color: "#6b7280", fontStyle: "italic" }}>
                        (AI generated)
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerate}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #002060 0%, #1a3a7a 100%)",
              "&:hover": { background: "linear-gradient(135deg, #001540 0%, #0d2860 100%)" },
            }}
          >
            Generate PDF
          </Button>
        </DialogActions>
      </Dialog>

      <Button
        variant="contained"
        onClick={() => setDialogOpen(true)}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
        sx={{
          textTransform: "none", fontWeight: 600, fontSize: 13, borderRadius: 2, px: 2.5, py: 1,
          background: "linear-gradient(135deg, #002060 0%, #1a3a7a 100%)",
          "&:hover": { background: "linear-gradient(135deg, #001540 0%, #0d2860 100%)" },
          "&.Mui-disabled": { background: "#ccc" },
        }}
      >
        {loading ? "Generating Document..." : "Generate Monashee Document"}
      </Button>
    </>
  )
}

export default IPOWriteUpPdfAutomation
