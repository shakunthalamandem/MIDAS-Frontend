import React, { useState } from "react"
import { Button, CircularProgress } from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import jsPDF from "jspdf"
import monasheeLogo from "../../Assets/images/monashee_logo.png"
import introImage from "../../Assets/images/monashee_page1.png"

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */
interface PdfAutomationProps {
  ticker: string
  issuerName?: string | null
  exchange?: string | null
  pricingDate?: string | null
}

interface DealInfo {
  ticker_name: string
  exchange: string
  company_name: string
  pricing_date: string | null
  filed_date: string | null
  term_date: string | null
  trade_date: string | null
  deal_size: number | null
  shares_offered: number | null
  nosh: number | null
  industry: string | null
  sector: string | null
  established_year: number | null
  lower_bound: number | null
  upper_bound: number | null
  bookrunners: string[]
}

interface FairValue {
  fair_value_estimate: string | number | null
  indication_of_interest: string | null
  after_market_threshold: string | null
}

interface CompanyOverview {
  business_overview: string[]
  key_highlights: string[]
  strengths: string[]
  concerns: string[]
  differentiated_summary: string[]
  use_of_proceeds: string[]
  principal_stockholders_preipo: string[]
  key_management_personnel: string[]
}

interface CompMetricRow {
  competitor: string
  price_usd: number | null
  market_cap: number | null
  ev_usd_million: number | null
  present_year_ev_sales: number | null
  one_year_later_ev_sales: number | null
  present_year_price_earning: number | null
  one_year_later_price_earning: number | null
  present_year_ev_ebitda: number | null
  one_year_later_ev_ebitda: number | null
  sales_growth: number | null
  eps_growth: number | null
  ai_generated: boolean
}

interface RedFlagItem {
  category: string
  score?: number
  observation?: string
  impact_risk?: string
}

interface ApiResponse {
  deal_info: DealInfo
  fair_value: FairValue
  company_overview: CompanyOverview
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

/* ═══════════════════════════════════════════════
   Design tokens
   ═══════════════════════════════════════════════ */
const C = {
  navy: [0, 32, 96] as const,
  navyDark: [0, 20, 60] as const,
  headerBg: [230, 238, 250] as const,
  rowAlt: [246, 249, 255] as const,
  white: [255, 255, 255] as const,
  border: [195, 208, 230] as const,
  text: [33, 37, 41] as const,
  muted: [110, 110, 110] as const,
  green: [22, 128, 57] as const,
  yellow: [180, 130, 0] as const,
  red: [195, 45, 45] as const,
  lightGreen: [232, 245, 233] as const,
  lightYellow: [255, 249, 230] as const,
  lightRed: [255, 235, 238] as const,
}
const PW = 210
const PH = 297
const MX = 14
const CW = PW - MX * 2
const HDR = 26
const FTR = 22

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

const n2d = (v: number | string | null | undefined): string => {
  if (v == null || v === "") return "—"
  const n = typeof v === "string" ? parseFloat(v) : v
  if (isNaN(n)) return String(v)
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const fmtPct = (v: number | string | null | undefined): string => {
  if (v == null || v === "") return "—"
  const n = typeof v === "string" ? parseFloat(v) : v
  if (isNaN(n)) return String(v)
  return `${n.toFixed(1)}%`
}

const fDate = (v: string | null | undefined): string => {
  if (!v) return "—"
  try {
    const d = new Date(v)
    if (isNaN(d.getTime())) return v
    return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`
  } catch {
    return v
  }
}

const statusDot = (c: string | null | undefined): { label: string; fg: readonly [number, number, number]; bg: readonly [number, number, number] } => {
  const lc = (c || "").toLowerCase()
  if (lc === "green") return { label: "Positive", fg: C.green, bg: C.lightGreen }
  if (lc === "yellow" || lc === "amber") return { label: "Neutral", fg: C.yellow, bg: C.lightYellow }
  if (lc === "red") return { label: "Negative", fg: C.red, bg: C.lightRed }
  return { label: c || "—", fg: C.text, bg: C.white }
}

/* ═══════════════════════════════════════════════
   PDF Builder
   ═══════════════════════════════════════════════ */
class DocBuilder {
  private p: jsPDF
  private y = MX + HDR
  private logo: HTMLImageElement | null = null
  private intro: HTMLImageElement | null = null
  private company: string
  private asOf: string
  private pageNum = 1

  constructor(company: string, asOf: string) {
    this.p = new jsPDF("p", "mm", "a4")
    this.company = company
    this.asOf = asOf
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

  private get avail() { return PH - FTR - this.y }

  private need(h: number) {
    if (this.avail < h) this.newPage()
  }

  private newPage() {
    this.footer()
    this.p.addPage()
    this.pageNum++
    this.header()
    this.y = MX + HDR
  }

  private header() {
    const p = this.p
    if (this.logo) {
      p.addImage(this.logo, "PNG", PW - MX - 40, 7, 40, 12, undefined, "FAST")
    }
    p.setFont("helvetica", "bold")
    p.setFontSize(10.5)
    p.setTextColor(...C.navy)
    p.text(this.company || "IPO Write-up", MX, 14)
    p.setDrawColor(...C.navy)
    p.setLineWidth(0.5)
    p.line(MX, 21, PW - MX, 21)
    p.setTextColor(...C.text)
  }

  private footer() {
    const p = this.p
    const fy = PH - FTR
    p.setDrawColor(...C.navy)
    p.setLineWidth(0.5)
    p.line(MX, fy, PW - MX, fy)
    p.setFontSize(6)
    p.setTextColor(...C.muted)
    p.setFont("helvetica", "normal")
    const txt = `${this.asOf ? `Data as of ${this.asOf}. ` : ""}Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management.`
    const lines: string[] = (p as any).splitTextToSize(txt, CW)
    p.text(lines, MX, fy + 2.5)
    p.setFontSize(7.5)
    p.setFont("helvetica", "bold")
    p.setTextColor(140)
    p.text("Do not copy. Do not distribute.", PW / 2, PH - 5, { align: "center" })
    // Page number
    p.setFontSize(7)
    p.setFont("helvetica", "normal")
    p.text(`${this.pageNum}`, PW - MX, PH - 5, { align: "right" })
    p.setTextColor(...C.text)
  }

  /* ── Layout primitives ─────────────────────── */
  private gap(mm = 4) { this.y += mm }

  private sectionTitle(title: string) {
    // Always ensure at least 45mm for heading + some content
    if (this.avail < 45) this.newPage()
    this.gap(5)
    const p = this.p
    p.setFillColor(...C.navy)
    p.roundedRect(MX, this.y, CW, 10, 1.5, 1.5, "F")
    p.setFont("helvetica", "bold")
    p.setFontSize(11)
    p.setTextColor(...C.white)
    p.text(title.toUpperCase(), MX + 5, this.y + 7)
    p.setTextColor(...C.text)
    this.y += 14
  }

  private subTitle(title: string) {
    // Ensure heading + at least 15mm of content fits on same page
    if (this.avail < 22) this.newPage()
    const p = this.p
    p.setFont("helvetica", "bold")
    p.setFontSize(9.5)
    p.setTextColor(...C.navyDark)
    p.text(title, MX, this.y)
    p.setDrawColor(...C.border)
    p.setLineWidth(0.2)
    p.line(MX, this.y + 2, PW - MX, this.y + 2)
    p.setTextColor(...C.text)
    this.y += 6
  }

  /** Render wrapped paragraph text */
  private para(text: string, opts?: { bold?: boolean; indent?: number; fontSize?: number; color?: readonly [number, number, number] }) {
    const cleaned = strip(text)
    if (!cleaned) return
    const p = this.p
    const fs = opts?.fontSize ?? 8.5
    const indent = opts?.indent ?? 0
    p.setFont("helvetica", opts?.bold ? "bold" : "normal")
    p.setFontSize(fs)
    p.setTextColor(...(opts?.color ?? C.text))
    const w = CW - indent
    const lines: string[] = (p as any).splitTextToSize(cleaned, w)
    const lh = fs * 0.38
    for (const line of lines) {
      this.need(lh + 1)
      p.text(line, MX + indent, this.y)
      this.y += lh
    }
    this.y += 1
  }

  /** Render a bullet list with proper text wrapping */
  private bullets(items: string[], indent = 3) {
    if (!items?.length) return
    const p = this.p
    const fs = 8.5
    const lh = fs * 0.38
    const bulletX = MX + indent
    const textX = bulletX + 4
    const textW = CW - indent - 4
    p.setFont("helvetica", "normal")
    p.setFontSize(fs)
    p.setTextColor(...C.text)
    for (const raw of items) {
      const cleaned = strip(raw)
      if (!cleaned) continue
      const lines: string[] = (p as any).splitTextToSize(cleaned, textW)
      const blockH = lines.length * lh + 2
      this.need(Math.min(blockH, lh * 3))
      p.text("\u2022", bulletX, this.y)
      for (const line of lines) {
        this.need(lh + 0.5)
        p.text(line, textX, this.y)
        this.y += lh
      }
      this.y += 1.5
    }
  }

  /** Key-value row */
  private kv(label: string, value: string, lw = 50) {
    this.need(5.5)
    const p = this.p
    p.setFont("helvetica", "bold")
    p.setFontSize(8.5)
    p.setTextColor(...C.navyDark)
    p.text(label, MX + 2, this.y)
    p.setFont("helvetica", "normal")
    p.setTextColor(...C.text)
    // Wrap value if too long
    const valW = CW - lw - 2
    const valLines: string[] = (p as any).splitTextToSize(strip(value), valW)
    const lh = 3.5
    for (const vl of valLines) {
      p.text(vl, MX + lw, this.y)
      this.y += lh
    }
    this.y += 1
  }

  /** Draw a table with text wrapping in cells */
  private table(
    headers: string[],
    rows: string[][],
    colW: number[],
    opts?: {
      fontSize?: number
      headerBg?: readonly [number, number, number]
      boldFirstCol?: boolean
      rightAlignFrom?: number
      rowColors?: Array<readonly [number, number, number] | null>
      rowBgs?: Array<readonly [number, number, number] | null>
    }
  ) {
    const p = this.p
    const fs = opts?.fontSize ?? 7.5
    const lh = fs * 0.38
    const cellPad = 2
    const hdrBg = opts?.headerBg ?? C.headerBg
    const raFrom = opts?.rightAlignFrom ?? -1
    const nCols = headers.length

    // ── Header row ──
    const hdrH = 7
    this.need(hdrH + 6)
    p.setFillColor(...hdrBg)
    p.rect(MX, this.y, CW, hdrH, "F")
    p.setFont("helvetica", "bold")
    p.setFontSize(fs)
    p.setTextColor(...C.navy)
    let x = MX
    for (let i = 0; i < nCols; i++) {
      const align = i >= raFrom && raFrom >= 0 ? "right" : "left"
      const tx = align === "right" ? x + colW[i] - cellPad : x + cellPad
      p.text(headers[i], tx, this.y + hdrH - 2, { align })
      x += colW[i]
    }
    this.y += hdrH
    p.setDrawColor(...C.border)
    p.setLineWidth(0.3)
    p.line(MX, this.y, PW - MX, this.y)
    this.y += 0.5

    // ── Data rows with wrapping ──
    for (let r = 0; r < rows.length; r++) {
      // Calculate row height based on wrapped text
      p.setFontSize(fs)
      let maxLines = 1
      const cellLines: string[][] = []
      for (let i = 0; i < nCols; i++) {
        const cellText = strip(rows[r]?.[i] ?? "—")
        const cellW = colW[i] - cellPad * 2
        const wrapped: string[] = (p as any).splitTextToSize(cellText, cellW)
        cellLines.push(wrapped)
        maxLines = Math.max(maxLines, wrapped.length)
      }
      const rowH = Math.max(maxLines * lh + 2, 5.5)

      this.need(rowH + 1)

      // Alt row bg
      if (r % 2 === 1) {
        p.setFillColor(...C.rowAlt)
        p.rect(MX, this.y, CW, rowH, "F")
      }

      // Custom row bg
      if (opts?.rowBgs?.[r]) {
        p.setFillColor(...opts.rowBgs[r]!)
        p.rect(MX, this.y, CW, rowH, "F")
      }

      x = MX
      for (let i = 0; i < nCols; i++) {
        const align = i >= raFrom && raFrom >= 0 ? "right" : "left"
        const tx = align === "right" ? x + colW[i] - cellPad : x + cellPad
        const isFirstCol = i === 0 && opts?.boldFirstCol
        p.setFont("helvetica", isFirstCol ? "bold" : "normal")

        // Custom color per row
        if (opts?.rowColors?.[r]) {
          p.setTextColor(...opts.rowColors[r]!)
        } else {
          p.setTextColor(...C.text)
        }

        let cy = this.y + lh + 0.5
        for (const ln of cellLines[i]) {
          p.text(ln, tx, cy, { align })
          cy += lh
        }
        x += colW[i]
      }
      this.y += rowH

      // Light row separator
      p.setDrawColor(225, 230, 240)
      p.setLineWidth(0.1)
      p.line(MX, this.y, PW - MX, this.y)
    }

    // Bottom border
    p.setDrawColor(...C.border)
    p.setLineWidth(0.3)
    p.line(MX, this.y, PW - MX, this.y)
    this.y += 3
    p.setTextColor(...C.text)
  }

  /** Rating bar */
  private ratingBar(label: string, value: number | null, max = 10) {
    if (value == null) return
    this.need(8)
    const p = this.p
    const barX = MX + 58
    const barW = 75
    const barH = 4.5
    const pct = Math.min(Math.max(value / max, 0), 1)

    p.setFont("helvetica", "normal")
    p.setFontSize(8.5)
    p.setTextColor(...C.text)
    p.text(label, MX + 3, this.y + 3.5)

    // Track
    p.setFillColor(225, 230, 242)
    p.roundedRect(barX, this.y, barW, barH, 2, 2, "F")

    // Fill
    if (pct > 0) {
      const [r, g, b] = pct >= 0.7 ? C.green : pct >= 0.4 ? C.yellow : C.red
      p.setFillColor(r, g, b)
      p.roundedRect(barX, this.y, barW * pct, barH, 2, 2, "F")
    }

    // Label
    p.setFont("helvetica", "bold")
    p.setFontSize(8.5)
    p.setTextColor(...C.navy)
    p.text(`${value}/${max}`, barX + barW + 4, this.y + 3.5)
    p.setTextColor(...C.text)
    this.y += 8
  }

  /* ═════════════════════════════════════════════
     BUILD
     ═════════════════════════════════════════════ */
  async build(data: ApiResponse, ticker: string, exchange?: string | null, pricingDate?: string | null) {
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
    p.setFont("helvetica", "bold")
    p.setFontSize(20)
    p.setTextColor(...C.navy)
    const tk = ticker.toUpperCase()
    p.text(tk, PW - MX - p.getTextWidth(tk), 22)
    if (di.company_name) {
      p.setFontSize(13)
      const cn = di.company_name.trim()
      p.text(cn, PW - MX - p.getTextWidth(cn), 31)
    }
    const parts = [exchange || di.exchange, fDate(pricingDate || di.pricing_date)].filter(Boolean)
    if (parts.length) {
      p.setFontSize(10)
      const pt = parts.join("  |  ")
      p.text(pt, PW - MX - p.getTextWidth(pt), 39)
    }

    /* ═══ PAGE 1 ═══════════════════════════════ */
    p.addPage()
    this.pageNum = 1
    this.header()
    this.y = MX + HDR

    // ── Deal Information ──
    this.sectionTitle("Deal Information")

    const bookStr = Array.isArray(di.bookrunners) && di.bookrunners.length > 0
      ? di.bookrunners.join(", ")
      : "—"
    const priceRange = di.lower_bound != null && di.upper_bound != null
      ? `$${n2s(di.lower_bound)} – $${n2s(di.upper_bound)}`
      : "—"

    this.table(
      ["", ""],
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
      [52, CW - 52],
      { boldFirstCol: true, fontSize: 8.5 }
    )

    // ── Fair Value ──
    this.sectionTitle("Fair Value Estimate & Indication of Interest")

    this.table(
      ["Metric", "Value"],
      [
        ["Fair Value Estimate", strip(String(fv.fair_value_estimate ?? "—"))],
        ["Indication of Interest", strip(String(fv.indication_of_interest ?? "—"))],
        ["After Market Threshold", strip(String(fv.after_market_threshold ?? "—"))],
      ],
      [60, CW - 60],
      { boldFirstCol: true, fontSize: 9 }
    )

    // ── Company Overview ──
    this.sectionTitle("Company Overview")

    // Helper: split long concatenated person entries into individual items
    const splitPersonEntries = (items: string[]): string[] => {
      const result: string[] = []
      for (const raw of items) {
        const cleaned = strip(raw)
        if (!cleaned) continue
        // Split on patterns like "Name: Title" when multiple people are concatenated
        // Common patterns: "FirstName LastName: TitleOtherName" or semicolon-separated
        const bySemicolon = cleaned.split(/[;]/).map((s) => s.trim()).filter(Boolean)
        if (bySemicolon.length > 1) {
          result.push(...bySemicolon)
        } else {
          // Try to split by detecting name/title boundaries
          // Pattern: "Title or Role" followed immediately by uppercase name start
          // e.g. "Chief Financial OfficerShawn G." -> split before "Shawn"
          const split = cleaned.split(/(?<=[a-z)])(?=[A-Z][a-z]+ [A-Z]\.?\s)/g)
          if (split.length > 1) {
            result.push(...split.map((s) => s.trim()).filter(Boolean))
          } else {
            result.push(cleaned)
          }
        }
      }
      return result
    }

    const overviewSections: [string, string[], boolean][] = [
      ["Business Overview", co.business_overview, false],
      ["Differentiated Summary", co.differentiated_summary, false],
      ["Key Highlights", co.key_highlights, false],
      ["Strengths", co.strengths, false],
      ["Concerns", co.concerns, false],
      ["Use of Proceeds", co.use_of_proceeds, false],
      ["Principal Stockholders (Pre-IPO)", co.principal_stockholders_preipo, true],
      ["Key Management Personnel", co.key_management_personnel, true],
    ]
    for (const [title, items, isPersonList] of overviewSections) {
      if (items?.length) {
        this.subTitle(title)
        const processedItems = isPersonList ? splitPersonEntries(items) : items
        this.bullets(processedItems)
        this.gap(2)
      }
    }

    // ── Key Metrics ──
    this.sectionTitle("Key Metrics")

    const metricEntries = Object.entries(km)
    if (metricEntries.length > 0) {
      const metricRows: string[][] = []
      for (const [key, val] of metricEntries) {
        // val.label = criteria name (e.g. "Customer Mix")
        // val.category = description/notes text
        // key = snake_case key name (fallback for criteria)
        const criteria = strip(val?.label) || key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
        const st = statusDot(val?.color)
        const notes = strip(val?.category) || "—"
        metricRows.push([criteria, st.label, notes])
      }
      this.table(
        ["Criteria", "Status", "Notes"],
        metricRows,
        [38, 20, CW - 58],
        { fontSize: 7.5, boldFirstCol: true }
      )
    } else {
      this.para("No key metrics data available.")
    }

    // ── Financial Highlights ──
    this.sectionTitle("Financial Highlights")
    this.renderFinancials(fh)

    // ── Comparative Multiples ──
    this.sectionTitle("Comparative Multiples")

    if (cm.data?.length) {
      const cHeaders = [
        "Company", "Price", "Mkt Cap", "EV ($M)",
        "EV/Sales\nCY", "EV/Sales\nNY", "P/E\nCY", "P/E\nNY",
        "Sales\nGr%", "EPS\nGr%"
      ]
      const rawW = [28, 13, 17, 17, 15, 15, 13, 13, 15, 15]
      const totalRaw = rawW.reduce((a, b) => a + b, 0)
      const cW = rawW.map((w) => (w / totalRaw) * CW)

      const cRows = cm.data.map((row) => [
        row.competitor || "—",
        n2s(row.price_usd), n2s(row.market_cap, 0), n2s(row.ev_usd_million, 0),
        n2s(row.present_year_ev_sales), n2s(row.one_year_later_ev_sales),
        n2s(row.present_year_price_earning), n2s(row.one_year_later_price_earning),
        n2s(row.sales_growth), n2s(row.eps_growth),
      ])

      if (cm.aggregates) {
        const a = cm.aggregates
        cRows.push(
          ["Average", "", "", "",
            n2s(a.present_year_ev_sales?.average), n2s(a.one_year_later_ev_sales?.average),
            n2s(a.present_year_price_earning?.average), n2s(a.one_year_later_price_earning?.average),
            n2s(a.sales_growth?.average), n2s(a.eps_growth?.average)],
          ["Median", "", "", "",
            n2s(a.present_year_ev_sales?.median), n2s(a.one_year_later_ev_sales?.median),
            n2s(a.present_year_price_earning?.median), n2s(a.one_year_later_price_earning?.median),
            n2s(a.sales_growth?.median), n2s(a.eps_growth?.median)]
        )
      }
      this.table(cHeaders, cRows, cW, { fontSize: 6.5, rightAlignFrom: 1, boldFirstCol: true })

      if (cm.latest_updated_at) {
        p.setFontSize(7)
        p.setTextColor(...C.muted)
        p.setFont("helvetica", "italic")
        p.text(`Source: FactSet — last updated ${fDate(cm.latest_updated_at)}`, MX + 2, this.y)
        this.y += 4
        p.setTextColor(...C.text)
      }
    } else {
      this.para("No comparable company data available.")
    }

    // ── Valuation ──
    this.sectionTitle("Valuation Analysis")
    if (va.narrative?.length) {
      this.bullets(va.narrative)
    } else {
      this.para("No valuation narrative available.")
    }

    // ── Risk Assessment ──
    this.sectionTitle("Risk Assessment")
    const rfItems = Array.isArray(ra?.data) ? ra.data : []
    if (rfItems.length > 0) {
      const rfRows = rfItems.map((item) => [
        item.category || "—",
        item.score != null ? `${item.score} / 5` : "—",
        strip(item.observation) || "—",
      ])
      this.table(
        ["Risk Category", "Score", "Observation"],
        rfRows,
        [38, 18, CW - 56],
        { fontSize: 7.5, boldFirstCol: true }
      )
    } else {
      this.para("No risk assessment data available.")
    }

    // ── Investment Summary ──
    this.sectionTitle("Investment Summary")

    if (inv.writeup_overall_rating != null) {
      this.need(12)
      p.setFont("helvetica", "bold")
      p.setFontSize(12)
      p.setTextColor(...C.navy)
      p.text(`Overall Rating: ${inv.writeup_overall_rating}%`, MX + 3, this.y + 4)
      p.setTextColor(...C.text)
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
      this.subTitle("Section Ratings")
      for (const [key, value] of ratingEntries) {
        this.ratingBar(ratingLabels[key] || key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value)
      }
      this.gap(4)
    }

    if (inv.writeup_finalverdict_summary) {
      this.subTitle("Final Verdict")
      this.para(inv.writeup_finalverdict_summary)
    }

    /* ═══ DISCLAIMER PAGE ═════════════════════ */
    this.footer()
    p.addPage()
    this.pageNum++
    this.header()
    this.y = MX + HDR

    p.setFont("helvetica", "bold")
    p.setFontSize(16)
    p.setTextColor(...C.navy)
    p.text("Disclaimer", MX, this.y)
    this.y += 10

    const disclaimers = [
      "The information contained herein has been compiled by Monashee internally and may be based on unaudited data from the relevant funds' books and records, and hypothetical information that has not been verified or reconciled by such funds' administrator. As such, the information contained herein should not serve as any kind of basis for any investment decision.",
      "This document does not constitute advice or a recommendation or offer to sell or a solicitation to deal in any security or financial product. It is provided for information purposes only and on the understanding that the recipient has sufficient knowledge and experience to be able to understand and make their own evaluation of the proposals and services described herein, any risks associated therewith and any related legal, tax, accounting or other material considerations.",
      "Certain information contained herein has been obtained from third party sources and such information has not been independently verified by Monashee Investment Management. No representation, warranty, or undertaking, expressed or implied, is given to the accuracy or completeness of such information by Monashee Investment Management or any other person.",
      "Except where otherwise indicated, the information contained in this presentation is based on matters as they exist as of the date of preparation of such material and not as of the date of distribution or any future date. Recipients should not rely on this material in making any future investment decision.",
      "This presentation is confidential, is intended only for the person to whom it has been directly provided and under no circumstances may a copy be shown, copied, transmitted or otherwise be given to any person other than the authorized recipient without the prior written consent of Monashee Investment Management.",
      "There is no guarantee that the investment objectives will be achieved. Moreover, the past performance is not a guarantee or indicator of future results.",
    ]
    for (const para of disclaimers) {
      this.para(para, { fontSize: 8 })
      this.gap(3)
    }

    this.footer()
    return p
  }

  /* ── Financial Highlights structured rendering ─ */
  private renderFinancials(fh: Record<string, unknown>) {
    if (!fh || typeof fh !== "object" || Object.keys(fh).length === 0) {
      this.para("No financial highlights data available.")
      return
    }

    // The data can come in two formats:
    // FORMAT A (nested):  { "2024 A": { "Sales": 568, "EBITDA": 73 }, "2025 E": { ... } }
    // FORMAT B (flat):    { "2024 A > Sales": 568, "2024 A > EBITDA": 73, ... }

    type YearData = Record<string, number | string | null>
    const yearKeysSet = new Set<string>()
    const metricNames = new Set<string>()
    const parsed: Record<string, YearData> = {}

    // First try to detect FORMAT A (nested objects)
    let hasNested = false
    for (const [key, val] of Object.entries(fh)) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        hasNested = true
        yearKeysSet.add(key)
        parsed[key] = val as YearData
        for (const mk of Object.keys(val as object)) {
          metricNames.add(mk)
        }
      }
    }

    // If no nested objects found, try FORMAT B (flat keys with " > " separator)
    if (!hasNested) {
      for (const [key, val] of Object.entries(fh)) {
        const parts = key.split(" > ")
        if (parts.length === 2) {
          const yearKey = parts[0].trim()
          const metric = parts[1].trim()
          yearKeysSet.add(yearKey)
          metricNames.add(metric)
          if (!parsed[yearKey]) parsed[yearKey] = {}
          parsed[yearKey][metric] = val as number | string | null
        }
      }
    }

    const yearKeys = Array.from(yearKeysSet)

    // Sort year keys naturally (2024 A, 2025 E, 2026 E, 2027 E ...)
    yearKeys.sort((a, b) => {
      const ya = parseInt(a)
      const yb = parseInt(b)
      if (!isNaN(ya) && !isNaN(yb)) {
        if (ya !== yb) return ya - yb
      }
      return a.localeCompare(b)
    })

    if (yearKeys.length === 0) {
      // Truly flat with no recognizable structure — render as simple key-value
      const flatPairs: string[][] = []
      for (const [k, v] of Object.entries(fh)) {
        flatPairs.push([
          k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          n2s(v as any)
        ])
      }
      if (flatPairs.length > 0) {
        this.table(["Metric", "Value"], flatPairs, [75, CW - 75], { fontSize: 8, boldFirstCol: true })
      }
      return
    }

    // Build a proper financial table: Metric ($M) | 2024 A | 2025 E | 2026 E | ...
    const friendlyNames: Record<string, string> = {
      "Sales": "Revenue",
      "Sales Growth": "Revenue Growth",
      "EBITDA": "EBITDA",
      "EBITDA Margin": "EBITDA Margin",
      "EBIT": "EBIT",
      "EBIT Margin": "EBIT Margin",
      "Net Income": "Net Income",
      "Net Income Margin": "Net Income Margin",
    }

    // Order metrics logically
    const metricOrder = [
      "Sales", "Sales Growth",
      "EBITDA", "EBITDA Margin",
      "EBIT", "EBIT Margin",
      "Net Income", "Net Income Margin",
    ]
    const orderedMetrics = metricOrder.filter((m) => metricNames.has(m))
    for (const m of metricNames) {
      if (!orderedMetrics.includes(m)) orderedMetrics.push(m)
    }

    const headers = ["Metric ($M)", ...yearKeys]
    const metricColW = 40
    const yearColW = (CW - metricColW) / yearKeys.length
    const colWidths = [metricColW, ...yearKeys.map(() => yearColW)]

    const rows: string[][] = orderedMetrics.map((metric) => {
      const friendly = friendlyNames[metric] || metric.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      const vals = yearKeys.map((yk) => {
        const v = parsed[yk]?.[metric]
        if (v == null) return "—"
        const num = typeof v === "string" ? parseFloat(v) : v as number
        if (isNaN(num)) return String(v)
        // Margins and growth rates as percentages
        if (metric.toLowerCase().includes("margin") || metric.toLowerCase().includes("growth")) {
          return `${num.toFixed(1)}%`
        }
        return n2s(num)
      })
      return [friendly, ...vals]
    })

    this.table(headers, rows, colWidths, {
      fontSize: 7.5,
      boldFirstCol: true,
      rightAlignFrom: 1,
    })
  }
}

/* ═══════════════════════════════════════════════
   React Component
   ═══════════════════════════════════════════════ */
const IPOWriteUpPdfAutomation: React.FC<PdfAutomationProps> = ({
  ticker,
  issuerName,
  exchange,
  pricingDate,
}) => {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.REACT_APP_API_URL
      const token = localStorage.getItem("access_token")

      const res = await fetch(`${apiUrl}/api/ipo_writeup_pdf_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(`Failed to fetch PDF data: ${(err as any)?.error || res.statusText}`)
        return
      }

      const data: ApiResponse = await res.json()
      const companyName = data.deal_info?.company_name || issuerName || ticker
      const dataAsOf = pricingDate
        ? fDate(pricingDate)
        : data.deal_info?.pricing_date
          ? fDate(data.deal_info.pricing_date)
          : ""

      const builder = new DocBuilder(companyName, dataAsOf)
      const pdf = await builder.build(data, ticker, exchange, pricingDate)

      const todayStr = new Date().toISOString().slice(0, 10)
      pdf.save(`${ticker.toUpperCase()}_WriteUp_${todayStr}.pdf`)
    } catch (err) {
      console.error("PDF generation error:", err)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="contained"
      onClick={handleGenerate}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        fontSize: 13,
        borderRadius: 2,
        px: 2.5,
        py: 1,
        background: "linear-gradient(135deg, #002060 0%, #1a3a7a 100%)",
        "&:hover": {
          background: "linear-gradient(135deg, #001540 0%, #0d2860 100%)",
        },
        "&.Mui-disabled": {
          background: "#ccc",
        },
      }}
    >
      {loading ? "Generating Document..." : "Generate Document PDF"}
    </Button>
  )
}

export default IPOWriteUpPdfAutomation
