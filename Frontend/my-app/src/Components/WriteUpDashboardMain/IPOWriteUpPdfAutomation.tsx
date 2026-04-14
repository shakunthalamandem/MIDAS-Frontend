import React, { useState } from "react"
import { Button, CircularProgress } from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import jsPDF from "jspdf"
import monasheeLogo from "../../Assets/images/monashee_logo.png"
import introImage from "../../Assets/images/monashee_page1.png"

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */
const BRAND_NAVY = [0, 32, 96] as const
const BRAND_DARK = [30, 43, 90] as const
const HEADER_BG = [235, 241, 252] as const
const ROW_ALT = [245, 248, 255] as const
const WHITE = [255, 255, 255] as const
const BORDER_COLOR = [200, 210, 230] as const
const TEXT_DARK = [33, 37, 41] as const
const TEXT_MUTED = [100, 100, 100] as const
const GREEN = [34, 139, 34] as const
const YELLOW_DARK = [180, 140, 0] as const
const RED = [200, 50, 50] as const

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 15
const CONTENT_W = PAGE_W - MARGIN * 2
const HEADER_H = 28
const FOOTER_H = 25

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
const fmt = (v: number | string | null | undefined): string => {
  if (v == null || v === "") return "—"
  const n = typeof v === "string" ? parseFloat(v) : v
  if (isNaN(n)) return String(v)
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 })
}

const fmtDollar = (v: number | string | null | undefined): string => {
  if (v == null || v === "") return "—"
  const n = typeof v === "string" ? parseFloat(v) : v
  if (isNaN(n)) return String(v)
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
}

const fmtDate = (v: string | null | undefined): string => {
  if (!v) return "—"
  try {
    const d = new Date(v)
    if (isNaN(d.getTime())) return v
    const day = d.getDate().toString().padStart(2, "0")
    const month = d.toLocaleString("default", { month: "short" })
    const year = d.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return v
  }
}

const stripHtml = (html: string | null | undefined): string => {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim()
}

const colorForStatus = (color: string | null | undefined): readonly [number, number, number] => {
  if (!color) return TEXT_DARK
  const c = color.toLowerCase()
  if (c === "green") return GREEN
  if (c === "yellow" || c === "amber") return YELLOW_DARK
  if (c === "red") return RED
  return TEXT_DARK
}

/* ──────────────────────────────────────────────
   PDF Builder Class
   ────────────────────────────────────────────── */
class WriteupPdfBuilder {
  private pdf: jsPDF
  private cursorY = MARGIN + HEADER_H
  private logoImg: HTMLImageElement | null = null
  private introImg: HTMLImageElement | null = null
  private companyName: string
  private dataAsOf: string

  constructor(companyName: string, dataAsOf: string) {
    this.pdf = new jsPDF("p", "mm", "a4")
    this.companyName = companyName
    this.dataAsOf = dataAsOf
  }

  async loadImages() {
    this.logoImg = await this.loadImage(monasheeLogo)
    this.introImg = await this.loadImage(introImage)
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = () => resolve(img)
      img.src = src
    })
  }

  private get availableY(): number {
    return PAGE_H - FOOTER_H - this.cursorY
  }

  private ensureSpace(needed: number) {
    if (this.availableY < needed) {
      this.addPageBreak()
    }
  }

  private addPageBreak() {
    this.drawFooter()
    this.pdf.addPage()
    this.drawHeader()
    this.cursorY = MARGIN + HEADER_H
  }

  private drawHeader() {
    const pdf = this.pdf
    if (this.logoImg) {
      pdf.addImage(this.logoImg, "PNG", PAGE_W - MARGIN - 42, 8, 42, 12.6, undefined, "FAST")
    }
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.setTextColor(...BRAND_NAVY)
    pdf.text(this.companyName || "IPO Write-up", MARGIN, 15)
    pdf.setDrawColor(...BRAND_NAVY)
    pdf.setLineWidth(0.4)
    pdf.line(MARGIN, 22, PAGE_W - MARGIN, 22)
    pdf.setTextColor(...TEXT_DARK)
  }

  private drawFooter() {
    const pdf = this.pdf
    const y = PAGE_H - FOOTER_H
    pdf.setDrawColor(...BRAND_NAVY)
    pdf.setLineWidth(0.6)
    pdf.line(MARGIN, y, PAGE_W - MARGIN, y)
    pdf.setFontSize(6.5)
    pdf.setTextColor(...TEXT_MUTED)
    pdf.setFont("helvetica", "normal")
    const asOf = this.dataAsOf ? `Data as of ${this.dataAsOf}. ` : ""
    const footerText = `${asOf}Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable.`
    const lines: string[] = (pdf as any).splitTextToSize(footerText, CONTENT_W)
    pdf.text(lines, MARGIN, y + 3)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(128)
    pdf.text("Do not copy. Do not distribute.", PAGE_W / 2, PAGE_H - 6, { align: "center" })
    pdf.setTextColor(...TEXT_DARK)
  }

  /* ── Section heading ─────────────────────────── */
  private sectionHeading(title: string) {
    this.ensureSpace(14)
    const pdf = this.pdf
    const y = this.cursorY
    // Draw background bar
    pdf.setFillColor(...BRAND_NAVY)
    pdf.roundedRect(MARGIN, y, CONTENT_W, 9, 1.5, 1.5, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(11)
    pdf.setTextColor(...WHITE)
    pdf.text(title.toUpperCase(), MARGIN + 4, y + 6.5)
    pdf.setTextColor(...TEXT_DARK)
    this.cursorY = y + 13
  }

  /* ── Sub heading ─────────────────────────────── */
  private subHeading(title: string) {
    this.ensureSpace(10)
    const pdf = this.pdf
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(9.5)
    pdf.setTextColor(...BRAND_DARK)
    pdf.text(title, MARGIN, this.cursorY + 4)
    pdf.setDrawColor(...BORDER_COLOR)
    pdf.setLineWidth(0.2)
    pdf.line(MARGIN, this.cursorY + 6, PAGE_W - MARGIN, this.cursorY + 6)
    pdf.setTextColor(...TEXT_DARK)
    this.cursorY += 9
  }

  /* ── Body text (wrapping) ────────────────────── */
  private bodyText(text: string, indent = 0) {
    if (!text || !text.trim()) return
    const pdf = this.pdf
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8.5)
    pdf.setTextColor(...TEXT_DARK)
    const w = CONTENT_W - indent
    const cleaned = stripHtml(text)
    const lines: string[] = (pdf as any).splitTextToSize(cleaned, w)
    const lineH = 3.6
    for (const line of lines) {
      this.ensureSpace(lineH + 1)
      pdf.text(line, MARGIN + indent, this.cursorY)
      this.cursorY += lineH
    }
  }

  /* ── Bullet list ─────────────────────────────── */
  private bulletList(items: string[], indent = 3) {
    if (!items || items.length === 0) return
    const pdf = this.pdf
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8.5)
    pdf.setTextColor(...TEXT_DARK)
    const w = CONTENT_W - indent - 4
    const lineH = 3.6
    for (const item of items) {
      const cleaned = stripHtml(item)
      if (!cleaned) continue
      const lines: string[] = (pdf as any).splitTextToSize(cleaned, w)
      this.ensureSpace(lines.length * lineH + 2)
      pdf.text("\u2022", MARGIN + indent, this.cursorY)
      for (let i = 0; i < lines.length; i++) {
        pdf.text(lines[i], MARGIN + indent + 4, this.cursorY)
        this.cursorY += lineH
      }
      this.cursorY += 0.5
    }
  }

  /* ── Key-value pair row ──────────────────────── */
  private kvRow(label: string, value: string, labelWidth = 45) {
    this.ensureSpace(5)
    const pdf = this.pdf
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(8.5)
    pdf.setTextColor(...BRAND_DARK)
    pdf.text(label, MARGIN + 2, this.cursorY)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(...TEXT_DARK)
    pdf.text(value || "—", MARGIN + labelWidth, this.cursorY)
    this.cursorY += 4.5
  }

  /* ── Simple table ────────────────────────────── */
  private drawTable(
    headers: string[],
    rows: string[][],
    colWidths?: number[],
    options?: { headerBg?: readonly [number, number, number]; fontSize?: number; rightAlignFrom?: number }
  ) {
    const pdf = this.pdf
    const fontSize = options?.fontSize ?? 7.5
    const rowH = 5.5
    const headerBg = options?.headerBg ?? HEADER_BG
    const rightAlignFrom = options?.rightAlignFrom ?? -1

    // Calculate column widths
    const totalCols = headers.length
    const widths = colWidths || headers.map(() => CONTENT_W / totalCols)

    // Header
    this.ensureSpace(rowH * 2)
    let x = MARGIN
    pdf.setFillColor(...headerBg)
    pdf.rect(MARGIN, this.cursorY - 0.5, CONTENT_W, rowH + 1, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(fontSize)
    pdf.setTextColor(...BRAND_NAVY)
    for (let i = 0; i < totalCols; i++) {
      const align = i >= rightAlignFrom && rightAlignFrom >= 0 ? "right" : "left"
      const tx = align === "right" ? x + widths[i] - 2 : x + 2
      pdf.text(headers[i], tx, this.cursorY + 3.5, { align })
      x += widths[i]
    }
    this.cursorY += rowH + 1

    // Draw header bottom line
    pdf.setDrawColor(...BORDER_COLOR)
    pdf.setLineWidth(0.3)
    pdf.line(MARGIN, this.cursorY, PAGE_W - MARGIN, this.cursorY)
    this.cursorY += 0.5

    // Rows
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(...TEXT_DARK)
    for (let r = 0; r < rows.length; r++) {
      this.ensureSpace(rowH + 1)
      x = MARGIN

      // Alternating row background
      if (r % 2 === 1) {
        pdf.setFillColor(...ROW_ALT)
        pdf.rect(MARGIN, this.cursorY - 0.5, CONTENT_W, rowH, "F")
      }

      pdf.setFontSize(fontSize)
      pdf.setTextColor(...TEXT_DARK)
      for (let i = 0; i < totalCols; i++) {
        const cellText = rows[r][i] ?? "—"
        const align = i >= rightAlignFrom && rightAlignFrom >= 0 ? "right" : "left"
        const tx = align === "right" ? x + widths[i] - 2 : x + 2
        // Truncate if too wide
        const maxW = widths[i] - 4
        const truncated = pdf.getTextWidth(cellText) > maxW
          ? cellText.substring(0, Math.floor(cellText.length * (maxW / pdf.getTextWidth(cellText)))) + "..."
          : cellText
        pdf.text(truncated, tx, this.cursorY + 3, { align })
        x += widths[i]
      }
      this.cursorY += rowH
    }

    // Bottom border
    pdf.setDrawColor(...BORDER_COLOR)
    pdf.setLineWidth(0.2)
    pdf.line(MARGIN, this.cursorY, PAGE_W - MARGIN, this.cursorY)
    this.cursorY += 3
  }

  /* ── Rating bar ──────────────────────────────── */
  private ratingBar(label: string, value: number | null, maxVal = 10) {
    if (value == null) return
    this.ensureSpace(7)
    const pdf = this.pdf
    const barX = MARGIN + 55
    const barW = 80
    const barH = 4
    const pct = Math.min(Math.max(value / maxVal, 0), 1)

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(...TEXT_DARK)
    pdf.text(label, MARGIN + 2, this.cursorY + 3)

    // Background bar
    pdf.setFillColor(230, 233, 242)
    pdf.roundedRect(barX, this.cursorY, barW, barH, 2, 2, "F")

    // Fill bar
    const r = pct > 0.6 ? 34 : pct > 0.3 ? 200 : 200
    const g = pct > 0.6 ? 139 : pct > 0.3 ? 140 : 50
    const b = pct > 0.6 ? 34 : pct > 0.3 ? 0 : 50
    pdf.setFillColor(r, g, b)
    if (pct > 0) {
      pdf.roundedRect(barX, this.cursorY, barW * pct, barH, 2, 2, "F")
    }

    // Value text
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(8)
    pdf.text(`${value}/${maxVal}`, barX + barW + 3, this.cursorY + 3)

    this.cursorY += 7
  }

  /* ── Small spacing ───────────────────────────── */
  private space(mm = 3) {
    this.cursorY += mm
  }

  /* ══════════════════════════════════════════════
     BUILD THE PDF
     ══════════════════════════════════════════════ */
  async build(data: ApiResponse, ticker: string, exchange?: string | null, pricingDate?: string | null) {
    await this.loadImages()
    const pdf = this.pdf
    const di = data.deal_info
    const fv = data.fair_value
    const co = data.company_overview
    const km = data.key_metrics
    const cm = data.comparative_multiples
    const va = data.valuation
    const ra = data.risk_assessment
    const is_ = data.investment_summary
    const fh = data.financial_highlights

    /* ── INTRO / COVER PAGE ─────────────────────── */
    if (this.introImg) {
      pdf.addImage(this.introImg, "PNG", 0, 0, PAGE_W, PAGE_H)
    }
    // Ticker + Company on cover
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(18)
    pdf.setTextColor(...BRAND_NAVY)
    const tickerStr = ticker.toUpperCase()
    pdf.text(tickerStr, PAGE_W - MARGIN - pdf.getTextWidth(tickerStr), 22)
    if (di.company_name) {
      pdf.setFontSize(12)
      const nameStr = di.company_name.trim()
      pdf.text(nameStr, PAGE_W - MARGIN - pdf.getTextWidth(nameStr), 30)
    }
    const coverParts = [exchange || di.exchange, fmtDate(pricingDate || di.pricing_date)].filter(Boolean)
    if (coverParts.length) {
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      const infoStr = coverParts.join(" | ")
      pdf.text(infoStr, PAGE_W - MARGIN - pdf.getTextWidth(infoStr), 37)
    }

    /* ── PAGE 1: Deal Information ───────────────── */
    pdf.addPage()
    this.drawHeader()
    this.cursorY = MARGIN + HEADER_H

    this.sectionHeading("Deal Information")
    this.space(2)

    // Deal info as a two-column key-value grid
    const dealPairs: [string, string][] = [
      ["Ticker", di.ticker_name || ticker],
      ["Company", di.company_name || "—"],
      ["Exchange", di.exchange || "—"],
      ["Sector / Industry", [di.sector, di.industry].filter(Boolean).join(" — ") || "—"],
      ["Filed Date", fmtDate(di.filed_date)],
      ["Pricing Range Date", fmtDate(di.term_date)],
      ["Pricing Date", fmtDate(di.pricing_date)],
      ["First Trade Date", fmtDate(di.trade_date)],
      ["Price Range", di.lower_bound != null && di.upper_bound != null
        ? `$${fmt(di.lower_bound)} – $${fmt(di.upper_bound)}`
        : "—"],
      ["Deal Size ($ Million)", di.deal_size != null ? `$${fmt(di.deal_size)} M` : "—"],
      ["Shares Offered", fmt(di.shares_offered)],
      ["Shares Outstanding", di.nosh != null ? `${fmt(di.nosh)}M` : "—"],
      ["Established", di.established_year ? String(di.established_year) : "—"],
      ["Bookrunners", Array.isArray(di.bookrunners) && di.bookrunners.length > 0
        ? di.bookrunners.join(", ")
        : "—"],
    ]

    // Render as a clean table
    this.drawTable(
      ["Field", "Details"],
      dealPairs,
      [55, CONTENT_W - 55],
      { headerBg: HEADER_BG, fontSize: 8.5 }
    )

    /* ── Fair Value Estimate and IOI ────────────── */
    this.space(3)
    this.sectionHeading("Fair Value Estimate & Indication of Interest")
    this.space(2)

    const fvPairs: [string, string][] = [
      ["Fair Value Estimate", fv.fair_value_estimate != null ? fmtDollar(fv.fair_value_estimate) : "—"],
      ["Indication of Interest", stripHtml(fv.indication_of_interest) || "—"],
      ["After Market Threshold", stripHtml(fv.after_market_threshold) || "—"],
    ]
    this.drawTable(
      ["Metric", "Value"],
      fvPairs,
      [55, CONTENT_W - 55],
      { fontSize: 8.5 }
    )

    /* ── Company Overview ──────────────────────── */
    this.space(3)
    this.sectionHeading("Company Overview")
    this.space(2)

    if (co.business_overview?.length) {
      this.subHeading("Business Overview")
      this.bulletList(co.business_overview)
      this.space(2)
    }

    if (co.differentiated_summary?.length) {
      this.subHeading("Differentiated Summary")
      this.bulletList(co.differentiated_summary)
      this.space(2)
    }

    if (co.key_highlights?.length) {
      this.subHeading("Key Highlights")
      this.bulletList(co.key_highlights)
      this.space(2)
    }

    if (co.strengths?.length) {
      this.subHeading("Strengths")
      this.bulletList(co.strengths)
      this.space(2)
    }

    if (co.concerns?.length) {
      this.subHeading("Concerns")
      this.bulletList(co.concerns)
      this.space(2)
    }

    if (co.use_of_proceeds?.length) {
      this.subHeading("Use of Proceeds")
      this.bulletList(co.use_of_proceeds)
      this.space(2)
    }

    if (co.principal_stockholders_preipo?.length) {
      this.subHeading("Principal Stockholders (Pre-IPO)")
      this.bulletList(co.principal_stockholders_preipo)
      this.space(2)
    }

    if (co.key_management_personnel?.length) {
      this.subHeading("Key Management Personnel")
      this.bulletList(co.key_management_personnel)
      this.space(2)
    }

    /* ── Key Metrics ───────────────────────────── */
    this.space(3)
    this.sectionHeading("Key Metrics")
    this.space(2)

    const metricEntries = Object.entries(km)
    if (metricEntries.length > 0) {
      const metricRows: string[][] = metricEntries.map(([key, val]) => {
        const label = val?.category || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        const statusColor = val?.color || "—"
        const notes = stripHtml(val?.label) || "—"
        return [label, statusColor.charAt(0).toUpperCase() + statusColor.slice(1), notes]
      })
      // Custom rendering for color column
      const metricHeaders = ["Criteria", "Status", "Notes"]
      const metricColW = [50, 25, CONTENT_W - 75]
      this.drawTable(metricHeaders, metricRows, metricColW, { fontSize: 8 })
    } else {
      this.bodyText("No key metrics data available.")
    }

    /* ── Financial Highlights ──────────────────── */
    this.space(3)
    this.sectionHeading("Financial Highlights")
    this.space(2)

    if (fh && typeof fh === "object" && Object.keys(fh).length > 0) {
      this.renderFinancialHighlights(fh)
    } else {
      this.bodyText("No financial highlights data available.")
    }

    /* ── Comparative Multiples ─────────────────── */
    this.space(3)
    this.sectionHeading("Comparative Multiples")
    this.space(2)

    if (cm.data && cm.data.length > 0) {
      const compHeaders = [
        "Competitor", "Price ($)", "Mkt Cap", "EV ($M)",
        "EV/Sales CY", "EV/Sales NY", "P/E CY", "P/E NY",
        "Sales Gr%", "EPS Gr%"
      ]
      const compColW = [30, 14, 18, 18, 16, 16, 14, 14, 16, 16]
      // Scale to fit
      const totalW = compColW.reduce((a, b) => a + b, 0)
      const scaledColW = compColW.map((w) => (w / totalW) * CONTENT_W)

      const compRows = cm.data.map((row) => [
        row.competitor || "—",
        fmt(row.price_usd),
        fmt(row.market_cap),
        fmt(row.ev_usd_million),
        fmt(row.present_year_ev_sales),
        fmt(row.one_year_later_ev_sales),
        fmt(row.present_year_price_earning),
        fmt(row.one_year_later_price_earning),
        fmt(row.sales_growth),
        fmt(row.eps_growth),
      ])

      // Add averages/medians rows
      if (cm.aggregates) {
        const avgRow = [
          "Average", "", "", "",
          fmt(cm.aggregates.present_year_ev_sales?.average),
          fmt(cm.aggregates.one_year_later_ev_sales?.average),
          fmt(cm.aggregates.present_year_price_earning?.average),
          fmt(cm.aggregates.one_year_later_price_earning?.average),
          fmt(cm.aggregates.sales_growth?.average),
          fmt(cm.aggregates.eps_growth?.average),
        ]
        const medRow = [
          "Median", "", "", "",
          fmt(cm.aggregates.present_year_ev_sales?.median),
          fmt(cm.aggregates.one_year_later_ev_sales?.median),
          fmt(cm.aggregates.present_year_price_earning?.median),
          fmt(cm.aggregates.one_year_later_price_earning?.median),
          fmt(cm.aggregates.sales_growth?.median),
          fmt(cm.aggregates.eps_growth?.median),
        ]
        compRows.push(avgRow, medRow)
      }

      this.drawTable(compHeaders, compRows, scaledColW, { fontSize: 6.5, rightAlignFrom: 1 })

      if (cm.latest_updated_at) {
        this.pdf.setFontSize(7)
        this.pdf.setTextColor(...TEXT_MUTED)
        this.pdf.text(`Last updated: ${fmtDate(cm.latest_updated_at)}`, MARGIN + 2, this.cursorY)
        this.cursorY += 4
      }
    } else {
      this.bodyText("No comparable company data available.")
    }

    /* ── Valuation ─────────────────────────────── */
    this.space(3)
    this.sectionHeading("Valuation Analysis")
    this.space(2)

    if (va.narrative?.length) {
      this.bulletList(va.narrative)
    } else {
      this.bodyText("No valuation narrative available.")
    }

    /* ── Risk Assessment ───────────────────────── */
    this.space(3)
    this.sectionHeading("Risk Assessment")
    this.space(2)

    const redFlagItems = ra?.data || []
    if (Array.isArray(redFlagItems) && redFlagItems.length > 0) {
      const rfHeaders = ["Category", "Risk Score", "Observation"]
      const rfColW = [40, 20, CONTENT_W - 60]
      const rfRows = redFlagItems.map((item) => [
        item.category || "—",
        item.score != null ? `${item.score}/5` : "—",
        stripHtml(item.observation) || "—",
      ])
      this.drawTable(rfHeaders, rfRows, rfColW, { fontSize: 7.5 })
    } else {
      this.bodyText("No risk assessment data available.")
    }

    /* ── Investment Summary ─────────────────────── */
    this.space(3)
    this.sectionHeading("Investment Summary")
    this.space(2)

    // Overall rating
    if (is_.writeup_overall_rating != null) {
      this.kvRow("Overall Rating", `${is_.writeup_overall_rating}%`, 45)
      this.space(2)
    }

    // Section ratings
    const ratings = is_.writeup_ratings || {}
    const ratingLabels: Record<string, string> = {
      "business-overview": "Business Overview",
      "key-metrics": "Key Metrics",
      "financial-highlights": "Financial Highlights",
      "comps": "Comparative Multiples",
      "valuation-analysis": "Valuation Analysis",
      "red-flag": "Risk Assessment",
      "ai_indication": "AI Indication",
    }

    const ratingEntries = Object.entries(ratings)
    if (ratingEntries.length > 0) {
      this.subHeading("Section Ratings")
      for (const [key, value] of ratingEntries) {
        this.ratingBar(ratingLabels[key] || key, value)
      }
      this.space(3)
    }

    // Final verdict summary
    if (is_.writeup_finalverdict_summary) {
      this.subHeading("Final Verdict")
      this.bodyText(is_.writeup_finalverdict_summary)
    }

    /* ── DISCLAIMER PAGE ───────────────────────── */
    this.drawFooter()
    pdf.addPage()
    this.drawHeader()
    this.cursorY = MARGIN + HEADER_H

    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.setTextColor(...BRAND_NAVY)
    pdf.text("Disclaimer", MARGIN, this.cursorY)
    this.cursorY += 10

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(...TEXT_DARK)

    const disclaimerParagraphs = [
      "The information contained herein has been compiled by Monashee internally and may be based on unaudited data from the relevant funds' books and records, and hypothetical information that has not been verified or reconciled by such funds' administrator. As such, the information contained herein should not serve as any kind of basis for any investment decision.",
      "This document does not constitute advice or a recommendation or offer to sell or a solicitation to deal in any security or financial product. It is provided for information purposes only and on the understanding that the recipient has sufficient knowledge and experience to be able to understand and make their own evaluation of the proposals and services described herein, any risks associated therewith and any related legal, tax, accounting or other material considerations.",
      "Certain information contained herein has been obtained from third party sources and such information has not been independently verified by Monashee Investment Management. No representation, warranty, or undertaking, expressed or implied, is given to the accuracy or completeness of such information by Monashee Investment Management or any other person.",
      "Except where otherwise indicated, the information contained in this presentation is based on matters as they exist as of the date of preparation of such material and not as of the date of distribution or any future date. Recipients should not rely on this material in making any future investment decision.",
      "This presentation is confidential, is intended only for the person to whom it has been directly provided and under no circumstances may a copy be shown, copied, transmitted or otherwise be given to any person other than the authorized recipient without the prior written consent of Monashee Investment Management.",
      "There is no guarantee that the investment objectives will be achieved. Moreover, the past performance is not a guarantee or indicator of future results.",
    ]

    for (const para of disclaimerParagraphs) {
      const lines: string[] = (pdf as any).splitTextToSize(para, CONTENT_W)
      const blockH = lines.length * 3.5 + 3
      this.ensureSpace(blockH)
      pdf.text(lines, MARGIN, this.cursorY)
      this.cursorY += blockH
    }

    this.drawFooter()

    return pdf
  }

  /* ── Financial Highlights renderer ───────────── */
  private renderFinancialHighlights(fh: Record<string, unknown>) {
    // The financial_highlights is stored as meta_data JSON from FinancialForecastData
    // It can contain nested objects. We'll attempt to render it as a table.
    try {
      // Check if it has a "data" or table-like structure
      if (Array.isArray(fh)) {
        // Array of objects
        if (fh.length > 0 && typeof fh[0] === "object") {
          const keys = Object.keys(fh[0] as Record<string, unknown>)
          const headers = keys.map((k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
          const rows = (fh as Record<string, unknown>[]).map((row) =>
            keys.map((k) => String((row as Record<string, unknown>)[k] ?? "—"))
          )
          const colW = headers.map(() => CONTENT_W / headers.length)
          this.drawTable(headers, rows, colW, { fontSize: 7 })
        }
        return
      }

      // Object with nested structure - flatten and render
      const flatPairs: [string, string][] = []
      const renderObj = (obj: Record<string, unknown>, prefix = "") => {
        for (const [key, val] of Object.entries(obj)) {
          const label = prefix
            ? `${prefix} > ${key.replace(/_/g, " ")}`
            : key.replace(/_/g, " ")
          if (val != null && typeof val === "object" && !Array.isArray(val)) {
            renderObj(val as Record<string, unknown>, label)
          } else {
            flatPairs.push([
              label.replace(/\b\w/g, (c) => c.toUpperCase()),
              val != null ? String(val) : "—",
            ])
          }
        }
      }
      renderObj(fh as Record<string, unknown>)

      if (flatPairs.length > 0) {
        // Group into a table with max ~30 rows per table to avoid huge blocks
        const chunkSize = 30
        for (let i = 0; i < flatPairs.length; i += chunkSize) {
          const chunk = flatPairs.slice(i, i + chunkSize)
          this.drawTable(
            ["Metric", "Value"],
            chunk,
            [70, CONTENT_W - 70],
            { fontSize: 7.5 }
          )
          this.space(2)
        }
      } else {
        this.bodyText("Financial highlights data structure not recognized.")
      }
    } catch {
      this.bodyText("Unable to parse financial highlights data.")
    }
  }
}

/* ──────────────────────────────────────────────
   React Component
   ────────────────────────────────────────────── */
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
        ? fmtDate(pricingDate)
        : data.deal_info?.pricing_date
          ? fmtDate(data.deal_info.pricing_date)
          : ""

      const builder = new WriteupPdfBuilder(companyName, dataAsOf)
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
