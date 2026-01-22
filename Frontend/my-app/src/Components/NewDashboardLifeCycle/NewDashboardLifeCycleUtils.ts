import dayjs from "dayjs";

export type DealCardTag = {
  label: string;
  color?: string;
  bg?: string;
};

export const formatDate = (value: any): string => {
  if (!value) return "TBA";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD MMM YYYY") : String(value);
};

export const formatDateISO = (value: any): string => {
  if (!value) return "TBA";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : String(value);
};

export const formatTwoDecimals = (value: any): string => {
  if (value == null || value === "") return "N/A";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toFixed(2);
};
export const formatDealSize = (value: any): string => {
  if (value == null || value === "") return "TBA";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const millions = num / 1_000_000;
  return `$${millions.toFixed(1)}M`;
};

export const formatPriceValue = (row: any): string => {
  if (row?.deal_type?.toString().toUpperCase() === "FO") {
    const price = Number(row?.issue_price);
    return Number.isNaN(price) ? "TBD" : `$${price.toFixed(2)}`;
  }
  if (row?.pricing_range_min != null && row?.pricing_range_max != null) {
    const min = Number(row.pricing_range_min);
    const max = Number(row.pricing_range_max);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      return `$${min.toFixed(0)} - $${max.toFixed(0)}`;
    }
  }
  if (row?.price_range) return String(row.price_range);
  return "TBD";
};

export const buildCardTags = (row: any): DealCardTag[] => {
  const tags: DealCardTag[] = [];

  if (row?.writeup_available) {
    const hasWriteup = row.writeup_available.toString().toLowerCase() === "yes";
    tags.push({
      label: hasWriteup ? "Write-up Ready" : "No Write-up",
      bg: hasWriteup ? "#dcfce7" : "#fee2e2",
      color: hasWriteup ? "#166534" : "#991b1b",
    });
  }
  return tags;
};
