import React, { useState } from "react"
import { Box, Button, CircularProgress } from "@mui/material"
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

const drawHeader = (pdf: jsPDF, headerTitle: string) => {
  const pdfWidth = pdf.internal.pageSize.getWidth()
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(12)
  pdf.setTextColor(0, 32, 96)
  const title = headerTitle?.trim?.() || "IPO Write-up"
  pdf.text(title, 10, 12)
  pdf.setDrawColor(0, 32, 96)
  pdf.setLineWidth(0.3)
  pdf.line(10, 15, pdfWidth - 10, 15)
  pdf.setTextColor(0, 0, 0)
  return 20
}

const drawFooter = (pdf: jsPDF, dataAsOfText: string) => {
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const marginX = 10
  const footerTextTopY = pdfHeight - 22
  pdf.setDrawColor(0, 32, 96)
  pdf.setLineWidth(1)
  pdf.line(marginX, footerTextTopY - 4, pdfWidth - marginX, footerTextTopY - 4)
  pdf.setFontSize(7)
  pdf.setTextColor(100)
  pdf.setFont("helvetica", "normal")
  const asOfLabel = dataAsOfText ? `Data as of ${dataAsOfText}. ` : ""
  pdf.text(
    `${asOfLabel}Data from company management. The specific investment described herein does not represent all investment decisions made by Monashee Investment Management. The reader should not assume that investment decisions identified and discussed were or will be profitable. Specific investment advice references provided herein are for illustrative purposes only and are not necessarily representative of investments that will be made in the future.`,
    marginX,
    footerTextTopY,
    { maxWidth: pdfWidth - marginX * 2 }
  )
  pdf.setFontSize(9)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(128)
  pdf.text("Do not copy. Do not distribute.", pdfWidth / 2, pdfHeight - 10, {
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
  pricingDate
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
      const bottomMargin = 18
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
        const label = pricingDate
          ? `${ticker.toUpperCase()} • ${pricingDate}`
          : ticker.toUpperCase()
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(14)
        pdf.setTextColor(0, 32, 96)
        pdf.text(label, pdfWidth - marginX - pdf.getTextWidth(label), 24)
      }

      pdf.addPage()
      let cursorY = drawHeader(pdf, headerTitle)

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
          cursorY = drawHeader(pdf, headerTitle)
        } else if (
          !breakBefore &&
          cursorY > pdfHeight - bottomMargin - minRemainingMm
        ) {
          drawFooter(pdf, dataAsOfText)
          pdf.addPage()
          cursorY = drawHeader(pdf, headerTitle)
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

              // Enhance font sizes for better PDF readability
              const allText = cloned.querySelectorAll<HTMLElement>('*')
              allText.forEach((el) => {
                const computed = window.getComputedStyle(el)
                const fontSize = parseFloat(computed.fontSize)
                if (fontSize > 0) {
                  el.style.fontSize = `${Math.max(fontSize * 1.15, 12)}px`
                }
                // Ensure proper box sizing
                el.style.boxSizing = 'border-box'
              })
            }
          }
        })

        const mmPerPx = contentWidth / canvas.width
        const gapMm = 6
        const overlapPx = 40
        let offsetPx = 0

        while (offsetPx < canvas.height) {
          const remainingPx = canvas.height - offsetPx
          const availableHeightMm = pdfHeight - bottomMargin - cursorY

          if (availableHeightMm <= 0) {
            drawFooter(pdf, dataAsOfText)
            pdf.addPage()
            cursorY = drawHeader(pdf, headerTitle)
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
            cursorY = drawHeader(pdf, headerTitle)
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
      const headerLogoWidth = 55
      const headerLogoHeight = 16.5
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
          fontSize: 12,
        }}
        startIcon={loading ? <CircularProgress color="inherit" size={18} /> : null}
      >
        {loading ? loadingLabel : buttonLabel}
      </Button>
    </Box>
  )
}

export default FebIPOWriteUpPdfExporter
