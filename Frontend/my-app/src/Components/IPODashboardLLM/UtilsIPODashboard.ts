export const cardStyle = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: 2,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  padding: 2.5,
  minHeight: 320,
  width: "100%",
  display: "flex",
  flexDirection: "column" as const,
};

export const cardColors = [
  "#f0f5ff",
  "#f0f5ff",
  "#f0f5ff",
  "#f0f5ff",
  "#f0f5ff",
  "#f0f5ff",
];

  export const cardSections = [
    { key: "business_overview", title: "Business Overview" },
    { key: "key_highlights", title: "Key Highlights" },
    { key: "strengths", title: "Strengths" },
    { key: "concerns", title: "Concerns" },
    // We'll inject FinancialForecastTable dynamically after this
    {
      key: "principal_stockholders_preipo",
      title: "Principal Stockholders (post-IPO)",
    },
    { key: "key_management_personnel", title: "Key Management Personnel" },
  ];


export  const getOrdinalSuffix = (n: number): string => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  
  export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };