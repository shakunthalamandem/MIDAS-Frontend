  export const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

export   const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "To Be Announced";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "To Be Announced";

    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  // Format deal size to $XM
export   const formatDealSize = (size: number | null): string => {
    if (size === null) return "TBA";
    return `$${(size / 1_000_000).toFixed(1)}M`;
  };