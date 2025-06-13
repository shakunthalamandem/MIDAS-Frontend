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
  "#f3f6f9",
  "#fdf5e6",
  "#e6f7f1",
  "#fff0f6",
  "#f0f5ff",
  "#f9f0ff",
];

  export const cardSections = [
    { key: "business_overview", title: "Business Overview" },
    { key: "key_highlights", title: "Key Highlights" },
    { key: "strengths", title: "Strengths" },
    { key: "concerns", title: "Concerns" },
    // We'll inject FinancialForecastTable dynamically after this
    {
      key: "principal_stockholders_preipo",
      title: "Principal Stockholders (pre-IPO)",
    },
    { key: "key_management_personnel", title: "Key Management Personnel" },
  ];
