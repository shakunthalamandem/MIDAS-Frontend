import React, { useState } from "react"
import { Box, Button, CircularProgress, Dialog, DialogContent, Stack, Typography } from "@mui/material"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import introImage from "../../Assets/images/monashee_page1.png"
import monasheeLogo from "../../Assets/images/monashee_logo.png"

type FebIPOWriteUpPdfExporterProps = {
  targetId: string
  fileName: string
  headerTitle?: string
  onTogglePdfMode?: (active: boolean) => void
  buttonLabel?: string
  loadingLabel?: string
  className?: string
  ticker?: string | null
  pricingDate?: string | null
  issuerName?: string | null
  exchange?: string | null
}

const waitForLayout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 120))
  })

const waitForContentReady = async (
  root: HTMLElement,
  { timeoutMs = 8000, intervalMs = 250 } = {}
) => {
  const started = Date.now()

  const hasLoadingIndicators = () => {
    if (root.querySelector("[role='progressbar'], .MuiCircularProgress-root")) {
      return true
    }
    const text = root.textContent || ""
    return /loading/i.test(text)
  }

  while (Date.now() - started < timeoutMs) {
    if (!hasLoadingIndicators()) return
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}

const drawHeader = (
  pdf: jsPDF,
  headerTitle: string,
  logoImg?: HTMLImageElement | null
) => {
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const marginX = 10
  const logoWidth = 45
  const logoHeight = 13.5
  const logoX = pdfWidth - marginX - logoWidth
  const logoY = 8

  if (logoImg) {
    pdf.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight, undefined, "FAST")
  }

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(12)
  pdf.setTextColor(0, 32, 96)
  const title = headerTitle?.trim?.() || "IPO Write-up"
  pdf.text(title, marginX, 14)
  pdf.setDrawColor(0, 32, 96)
  pdf.setLineWidth(0.3)
  const lineY = logoY + logoHeight + 2
  pdf.line(marginX, lineY, pdfWidth - marginX, lineY)
  pdf.setTextColor(0, 0, 0)
  return lineY + 5
}

const getFooterLayout = (pdf: jsPDF, dataAsOfText: string, marginX: number) => {
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  pdf.setFontSize(7)
  pdf.setTextColor(100)
  pdf.setFont("helvetica", "normal")
  const asOfLabel = dataAsOfText ? `Data as of ${dataAsOfText}. ` : ""
  const footerText = `${asOfLabel}Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`
  const footerLines: string[] = (pdf as any).splitTextToSize(
    footerText,
    pdfWidth - marginX * 2
  )
  const lineHeightMm = pdf.getFontSize() * 0.3528 * 1.2
  const bottomTextY = pdfHeight - 10
  const footerTextHeight = footerLines.length * lineHeightMm
  const footerTextTopY = bottomTextY - 6 - footerTextHeight
  const footerLineY = footerTextTopY - 3
  const footerTopY = footerLineY - 2
  const footerHeight = pdfHeight - footerTopY

  return {
    footerLines,
    footerTextTopY,
    footerLineY,
    footerHeight,
    bottomTextY
  }
}

const drawFooter = (pdf: jsPDF, dataAsOfText: string, marginX = 10) => {
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const layout = getFooterLayout(pdf, dataAsOfText, marginX)

  pdf.setDrawColor(0, 32, 96)
  pdf.setLineWidth(1)
  pdf.line(marginX, layout.footerLineY, pdfWidth - marginX, layout.footerLineY)
  pdf.setFontSize(7)
  pdf.setTextColor(100)
  pdf.setFont("helvetica", "normal")
  pdf.text(layout.footerLines, marginX, layout.footerTextTopY, {
    maxWidth: pdfWidth - marginX * 2
  })
  pdf.setFontSize(9)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(128)
  pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, layout.bottomTextY, {
    align: "center"
  })
  pdf.setTextColor(0, 0, 0)
}

const getCanvasScale = () => {
  if (typeof window === "undefined") return 2
  const ratio = window.devicePixelRatio || 1
  return Math.min(Math.max(ratio, 1.5), 3)
}

const dedupePdfSections = (sections: HTMLElement[]): HTMLElement[] => {
  const seenKeys = new Set<string>()
  const result: HTMLElement[] = []

  for (let i = sections.length - 1; i >= 0; i--) {
    const sec = sections[i]

    const heading =
      sec.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim() || ""
    const key =
      sec.dataset.pdfKey ||
      sec.getAttribute("data-pdf-title") ||
      heading ||
      `__index_${i}`

    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      result.unshift(sec)
    }
  }

  return result
}

const FebIPOWriteUpPdfExporter: React.FC<FebIPOWriteUpPdfExporterProps> = ({
  targetId,
  fileName,
  headerTitle = "IPO Write-up",
  onTogglePdfMode,
  buttonLabel = "Generate Monashee PDF",
  loadingLabel = "Generating...",
  className,
  ticker,
  pricingDate,
  issuerName,
  exchange
}) => {
  const [loading, setLoading] = useState(false)

  const formatDataAsOf = (value?: string | null) => {
    if (!value) return ""
    const cleanValue = value.replace(/(\d+)(st|nd|rd|th)/, "$1")
    const dateObj = new Date(cleanValue)
    if (Number.isNaN(dateObj.getTime())) return value
    const month = dateObj.toLocaleString("default", { month: "short" })
    const year = dateObj.getFullYear()
    return `${month} ${year}`
  }

  const handleExport = async () => {
    setLoading(true)
    onTogglePdfMode?.(true)
    const hiddenEls: Array<{ el: HTMLElement; display: string }> = []

    try {
      await waitForLayout()
      const root = document.getElementById(targetId)
      if (!root) {
        console.error(`PDF export root #${targetId} not found`)
        return
      }
      await waitForContentReady(root)

      const pdf = new jsPDF("p", "mm", "a4")
      if (typeof (pdf as any).setDisplayMode === "function") {
        ;(pdf as any).setDisplayMode(150)
      }
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const marginX = 10
      const contentWidth = pdfWidth - marginX * 2
      const dataAsOfText = formatDataAsOf(pricingDate)

      const logoImg = new Image()
      logoImg.src = monasheeLogo
      await new Promise<void>((resolve) => {
        logoImg.onload = () => resolve()
      })

      const introImg = new Image()
      introImg.src = introImage
      await new Promise<void>((resolve) => {
        introImg.onload = () => resolve()
      })

      // Intro page
      pdf.addImage(introImg, "PNG", 0, 0, pdfWidth, pdfHeight)
      if (ticker) {
        // Ticker at top right
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(16)
        pdf.setTextColor(0, 32, 96)
        const tickerText = ticker.toUpperCase()
        pdf.text(tickerText, pdfWidth - marginX - pdf.getTextWidth(tickerText), 20)

        // Company name below ticker
        if (issuerName?.trim()) {
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(12)
          pdf.setTextColor(0, 32, 96)
          const displayName = issuerName.trim()
          pdf.text(displayName, pdfWidth - marginX - pdf.getTextWidth(displayName), 28)
        }

        // Exchange and pricing date below company name
        const additionalParts = [
          exchange?.trim(),
          pricingDate?.trim()
        ].filter(Boolean)
        if (additionalParts.length > 0) {
          const additionalText = additionalParts.join(" | ")
          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(10)
          pdf.setTextColor(60, 60, 60)
          pdf.text(additionalText, pdfWidth - marginX - pdf.getTextWidth(additionalText), 35)
        }
      }

      pdf.addPage()
      const displayHeaderTitle = issuerName?.trim() || headerTitle
      let cursorY = drawHeader(pdf, displayHeaderTitle, logoImg)
      const footerLayout = getFooterLayout(pdf, dataAsOfText, marginX)
      const bottomMargin = Math.max(footerLayout.footerHeight + 4, 30)

      const hideForPdf = (el: HTMLElement) => {
        hiddenEls.push({ el, display: el.style.display })
        el.style.display = "none"
      }

      root
        .querySelectorAll<HTMLElement>(".MuiIconButton-root, .pdf-hidden")
        .forEach(hideForPdf)

      const rawSections =
        Array.from(root.querySelectorAll<HTMLElement>(".mdr-pdf-section")) || []
      const sections = rawSections.length ? dedupePdfSections(rawSections) : []
      const targets = sections.length ? sections : [root]
      let isFirstSection = true

      for (const section of targets) {
        const attrBreakBefore =
          section.dataset.pdfBreakBefore === "true" ||
          section.dataset.pdfBreakBefore === "1"

        const minRemainingMm = 30
        const pxToMm = 25.4 / 96
        const estimatedSectionHeightMm =
          (section.scrollHeight || section.getBoundingClientRect().height || 0) *
          pxToMm
        const availableHeightMmBefore = pdfHeight - bottomMargin - cursorY

        let breakBefore = attrBreakBefore

        if (
          !breakBefore &&
          !isFirstSection &&
          estimatedSectionHeightMm > 0 &&
          availableHeightMmBefore > 0 &&
          availableHeightMmBefore < estimatedSectionHeightMm * 0.9
        ) {
          breakBefore = true
        }

        if (breakBefore && !isFirstSection) {
          drawFooter(pdf, dataAsOfText)
          pdf.addPage()
          cursorY = drawHeader(pdf, displayHeaderTitle, logoImg)
        } else if (
          !breakBefore &&
          cursorY > pdfHeight - bottomMargin - minRemainingMm
        ) {
          drawFooter(pdf, dataAsOfText)
          pdf.addPage()
          cursorY = drawHeader(pdf, displayHeaderTitle, logoImg)
        }

        // Calculate optimal capture width for clean PDF rendering
        const captureViewportWidth = 1200
        const captureWidth = captureViewportWidth

        const prevStyles: Array<{
          el: HTMLElement
          key: string
          val: string | null
        }> = []
        const remember = (el: HTMLElement, key: string, val: string) => {
          prevStyles.push({ el, key, val: (el.style as any)[key] ?? null })
          ;(el.style as any)[key] = val
        }

        const relaxLayout = (el: HTMLElement) => {
          const width = Math.max(el.scrollWidth, el.clientWidth, captureViewportWidth)
          remember(el, "overflow", "visible")
          remember(el, "overflowX", "visible")
          remember(el, "overflowY", "visible")
          remember(el, "maxHeight", "none")
          remember(el, "height", "auto")
          remember(el, "width", `${width}px`)
          remember(el, "minWidth", `${width}px`)
          remember(el, "boxSizing", "border-box")

          const children = Array.from(el.querySelectorAll<HTMLElement>("*"))
          children.forEach((child) => {
            remember(child, "overflow", "visible")
            remember(child, "overflowX", "visible")
            remember(child, "overflowY", "visible")
            remember(child, "maxHeight", "none")
            remember(child, "height", "auto")
            remember(child, "boxSizing", "border-box")

            // Ensure tables and wide elements scale properly
            if (child.tagName === 'TABLE' || child.classList.contains('MuiTable-root')) {
              remember(child, "width", "100%")
            }
          })
        }

        relaxLayout(section)

        const canvas = await html2canvas(section, {
          scale: Math.max(getCanvasScale(), 2.5),
          useCORS: true,
          backgroundColor: null,
          allowTaint: true,
          width: captureWidth,
          windowWidth: captureWidth,
          windowHeight: section.scrollHeight,
          scrollY: -window.scrollY,
          ignoreElements: (el) =>
            (el as HTMLElement).classList?.contains("pdf-hidden") ?? false,
          onclone: (doc) => {
            const cloned = doc.getElementById(section.id)
            if (cloned) {
              cloned.style.width = `${captureWidth}px`
              cloned.style.maxWidth = `${captureWidth}px`
              cloned.style.minWidth = `${captureWidth}px`
              cloned.style.margin = '0'
              cloned.style.padding = '0'
              cloned.style.boxSizing = 'border-box'

              // Expand all accordions in the cloned document
              const accordions = cloned.querySelectorAll<HTMLElement>('.MuiAccordion-root')
              accordions.forEach((accordion) => {
                accordion.classList.add('Mui-expanded')
                const content = accordion.querySelector<HTMLElement>('.MuiCollapse-root')
                if (content) {
                  content.style.height = 'auto'
                  content.style.visibility = 'visible'
                  content.classList.add('MuiCollapse-entered')
                }
              })

              // Enhance font sizes for better PDF readability
              const allText = cloned.querySelectorAll<HTMLElement>('*')
              allText.forEach((el) => {
                const computed = window.getComputedStyle(el)
                const fontSize = parseFloat(computed.fontSize)
                if (fontSize > 0) {
                  // Increase font size with min 12px and max 24px to prevent oversized text
                  const newSize = Math.max(fontSize * 1.15, 12)
                  el.style.fontSize = `${Math.min(newSize, 24)}px`
                }
                // Ensure proper box sizing
                el.style.boxSizing = 'border-box'

                // Preserve background colors and gradients from computed styles
                const backgroundColor = computed.backgroundColor
                if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                  el.style.backgroundColor = backgroundColor
                }

                // Preserve background images (includes gradients)
                const backgroundImage = computed.backgroundImage
                if (backgroundImage && backgroundImage !== 'none') {
                  el.style.backgroundImage = backgroundImage
                }

                // Preserve border colors
                const borderColor = computed.borderColor
                if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
                  el.style.borderColor = borderColor
                }
              })

              // Special handling for risk meter elements
              const riskMeterBars = cloned.querySelectorAll<HTMLElement>('.risk-meter-bar')
              riskMeterBars.forEach((bar) => {
                bar.style.backgroundImage = 'linear-gradient(90deg, #22c55e 0%, #facc15 55%, #ef4444 100%)'
                bar.style.background = 'linear-gradient(90deg, #22c55e 0%, #facc15 55%, #ef4444 100%)'
                bar.style.height = '12px'
                bar.style.width = '100%'
                bar.style.borderRadius = '999px'
              })

              const riskMeterBadges = cloned.querySelectorAll<HTMLElement>('.risk-meter-badge')
              riskMeterBadges.forEach((badge) => {
                badge.style.backgroundColor = '#6b5bd2'
                badge.style.color = '#ffffff'
                badge.style.zIndex = '10'
              })
            }
          }
        })

        const mmPerPx = contentWidth / canvas.width
        const gapMm = 3
        const overlapPx = 80
        let offsetPx = 0

        while (offsetPx < canvas.height) {
          const remainingPx = canvas.height - offsetPx
          const availableHeightMm = pdfHeight - bottomMargin - cursorY

          if (availableHeightMm <= 0) {
            drawFooter(pdf, dataAsOfText)
            pdf.addPage()
            cursorY = drawHeader(pdf, displayHeaderTitle, logoImg)
            continue
          }

          const availableHeightPx = availableHeightMm / mmPerPx
          const sliceHeightPx = Math.min(
            remainingPx,
            Math.floor(availableHeightPx)
          )
          if (sliceHeightPx <= 0) break

          const sliceCanvas = document.createElement("canvas")
          sliceCanvas.width = canvas.width
          sliceCanvas.height = Math.ceil(sliceHeightPx)
          const ctx = sliceCanvas.getContext("2d")
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
            )
          }

          const sliceImg = sliceCanvas.toDataURL("image/png", 1.0)
          const sliceHeightMm = sliceHeightPx * mmPerPx

          pdf.addImage(
            sliceImg,
            "PNG",
            marginX,
            cursorY,
            contentWidth,
            sliceHeightMm,
            undefined,
            "FAST"
          )

          const isLastSlice = remainingPx <= availableHeightPx
          if (isLastSlice) {
            offsetPx = canvas.height
          } else {
            const stepPx =
              sliceHeightPx - Math.min(overlapPx, sliceHeightPx * 0.2)
            offsetPx += stepPx > 0 ? stepPx : sliceHeightPx
          }

          cursorY += sliceHeightMm + gapMm

          if (cursorY > pdfHeight - bottomMargin) {
            drawFooter(pdf, dataAsOfText)
            pdf.addPage()
            cursorY = drawHeader(pdf, displayHeaderTitle, logoImg)
          }
        }

        prevStyles.forEach(({ el, key, val }) => {
          ;(el.style as any)[key] = val ?? ""
        })

        isFirstSection = false
      }

      drawFooter(pdf, dataAsOfText)

      // Disclaimer page (last)
      pdf.addPage()
      const headerLogoWidth = 45
      const headerLogoHeight = 13.5
      const headerLogoX = pdfWidth - headerLogoWidth - 10
      const headerLogoY = 10
      pdf.addImage(
        logoImg,
        "JPEG",
        headerLogoX,
        headerLogoY,
        headerLogoWidth,
        headerLogoHeight,
        undefined,
        "FAST"
      )
      const headerLineY = headerLogoY + headerLogoHeight + 2
      pdf.setDrawColor(0, 32, 96)
      pdf.setLineWidth(1)
      pdf.line(10, headerLineY, pdfWidth - 10, headerLineY)

      const titleY = headerLineY + 6
      pdf.setTextColor(0, 32, 96)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(16)
      pdf.text("Disclaimer", marginX, titleY)

      const bodyY = titleY + 10
      const disclaimerText =
        "The information contained herein has been compiled by Monashee internally and may be based on unaudited data from the relevant funds' books and records, and hypothetical information that has not been verified or reconciled by such funds' administrator. As such, the information contained herein should not serve as any kind of basis for any investment decision.\n\n" +
        "This document does not constitute advice or a recommendation or offer to sell or a solicitation to deal in any security or financial product. It is provided for information purposes only and on the understanding that the recipient has sufficient knowledge and experience to be able to understand and make their own evaluation of the proposals and services described herein, any risks associated therewith and any related legal, tax, accounting or other material considerations. To the extent that the reader has any questions regarding the applicability of any specific issue discussed above to their specific portfolio or situation, prospective investors are encouraged to contact Monashee Investment Management or consult with the professional advisor of their choosing.\n\n" +
        "Certain information contained herein has been obtained from third party sources and such information has not been independently verified by Monashee Investment Management. No representation, warranty, or undertaking, expressed or implied, is given to the accuracy or completeness of such information by Monashee Investment Management or any other person. While such sources are believed to be reliable. Monashee Investment Management does not assume any responsibility for the accuracy or completeness of such information. Monashee Investment Management does not undertake any obligation to update the information contained herein as of any future date.\n\n" +
        "Except where otherwise indicated, the information contained in this presentation is based on matters as they exist as of the date of preparation of such material and not as of the date of distribution or any future date. Recipients should not rely on this material in making any future investment decision.\n\n" +
        "This presentation is confidential, is intended only for the person to whom it has been directly provided and under no circumstances may a copy be shown, copied, transmitted or otherwise be given to any person other than the authorized recipient without the prior written consent of Monashee Investment Management.\n\n" +
        "There is no guarantee that the investment objectives will be achieved. Moreover, the past performance is not a guarantee or indicator of future results.\n\n" +
        'Certain information contained herein constitutes "forward-looking statements," which can be identified by the use of forward-looking terminology such as "may," "will." "should," "expect," "anticipate," "project," "estimate," "intend," "continue," or "believe." or the negatives thereof or other variations thereon or comparable terminology. Due to various risks and uncertainties, actual events, results or actual performance may differ materially from those reflected or contemplated in such forward-looking statements. Nothing contained herein may be relied upon as a guarantee, promise, assurance or a representation as to the future'

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10.5)
      pdf.setTextColor(60)
      const maxWidth = pdfWidth - marginX * 2
      const lines: string[] = (pdf as any).splitTextToSize(
        disclaimerText,
        maxWidth
      )
      const lineHeightMm = pdf.getFontSize() * 0.3528 * 1.2
      let yCursor = bodyY
      const bottomLimit = pdfHeight - 28
      let idx = 0
      while (idx < lines.length) {
        const linesFit = Math.max(
          1,
          Math.floor((bottomLimit - yCursor) / lineHeightMm)
        )
        const chunk = lines.slice(idx, idx + linesFit)
        pdf.text(chunk, marginX, yCursor, { maxWidth })
        idx += linesFit
        if (idx < lines.length) {
          drawFooter(pdf, dataAsOfText)
          pdf.addPage()
          pdf.addImage(
            logoImg,
            "JPEG",
            headerLogoX,
            headerLogoY,
            headerLogoWidth,
            headerLogoHeight,
            undefined,
            "FAST"
          )
          const headerLineYC = headerLogoY + headerLogoHeight + 2
          pdf.setDrawColor(0, 32, 96)
          pdf.setLineWidth(1)
          pdf.line(10, headerLineYC, pdfWidth - 10, headerLineYC)
          pdf.setTextColor(0, 32, 96)
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(16)
          pdf.text("Disclaimer", marginX, headerLineYC + 6)
          pdf.setFont("helvetica", "normal")
          pdf.setFontSize(10.5)
          pdf.setTextColor(60)
          yCursor = headerLineYC + 16
        }
      }

      drawFooter(pdf, dataAsOfText)
      pdf.save(fileName)
    } catch (err) {
      console.error("Failed to generate IPO write-up PDF:", err)
    } finally {
      hiddenEls.forEach(({ el, display }) => {
        el.style.display = display
      })
      onTogglePdfMode?.(false)
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={loading} PaperProps={{
        sx: {
          borderRadius: 3,
          px: 4,
          py: 3,
          minWidth: 320
        }
      }}>
        <DialogContent>
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={60} thickness={4} sx={{ color: "#002060" }} />
            <Stack spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#002060" }}>
                Downloading the Monashee PDF
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280", textAlign: "center" }}>
                Please wait while we generate your document...
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Box position="relative" display="inline-flex">
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          className={className}
          sx={{
            backgroundColor: "#002060",
            color: "#fff",
            textTransform: "none",
            px: 1.5,
            minWidth: 180,
            fontSize: 12
          }}
          startIcon={loading ? <CircularProgress color="inherit" size={18} /> : null}
        >
          {loading ? loadingLabel : buttonLabel}
        </Button>
      </Box>
    </>
  )
}

export default FebIPOWriteUpPdfExporter
