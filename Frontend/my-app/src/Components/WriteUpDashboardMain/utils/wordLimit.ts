const normalizeWhitespace = (value: string) =>
  value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()

export const htmlToPlainText = (value: string) => {
  if (!value) return ""

  if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(value, "text/html")
    return normalizeWhitespace(doc.body.textContent || "")
  }

  return normalizeWhitespace(value.replace(/<[^>]*>/g, " "))
}

export const countWordsFromPlainText = (value: string) => {
  const cleaned = normalizeWhitespace(value)
  if (!cleaned) return 0
  return cleaned.split(" ").length
}

export const countWordsFromHtml = (value: string) => {
  return countWordsFromPlainText(htmlToPlainText(value))
}

export const truncatePlainTextToWordLimit = (value: string, limit: number) => {
  const cleaned = normalizeWhitespace(value)
  if (!cleaned || limit <= 0) return ""

  const words = cleaned.split(" ")
  if (words.length <= limit) return cleaned
  return words.slice(0, limit).join(" ")
}

export const clampHtmlToWordLimit = (value: string, limit: number) => {
  const plainText = htmlToPlainText(value)
  const truncated = truncatePlainTextToWordLimit(plainText, limit)

  if (truncated === plainText) {
    return value
  }

  return truncated
}

export const getWordLimitStats = (wordCount: number, limit: number) => {
  const used = Math.max(0, wordCount)
  const remaining = Math.max(limit - used, 0)
  const isAtLimit = remaining === 0
  const isOverLimit = used > limit
  return { used, remaining, limit, isAtLimit, isOverLimit }
}
