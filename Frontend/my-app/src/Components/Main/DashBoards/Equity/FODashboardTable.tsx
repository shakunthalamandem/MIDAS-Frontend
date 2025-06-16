import React from "react";

interface DealData {
  opportunity_value_ex: number;
  count?: number; // Optional if not in response yet
}

interface FODashboardTableProps {
  payload: {
    [month: string]: {
      [dealType: string]: DealData;
    };
  };
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getMonthIndex = (monthKey: string): number => {
  const parts = monthKey.match(/\d+/g);
  const monthNum = parseInt(parts?.[1] || "1", 10);
  return monthNum - 1;
};

const formatValue = (value: number): string => {
  if (value >= 1_000_000_000) return `₹${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)}M`;
  return `₹${value.toFixed(2)}`;
};

const FODashboardTable: React.FC<FODashboardTableProps> = ({ payload }) => {
  const monthData: { [index: number]: DealData } = {};

  Object.entries(payload).forEach(([month, dealTypes]) => {
    const idx = getMonthIndex(month);
    const deal = dealTypes["FO"];
    if (deal) monthData[idx] = deal;
  });

  return (
    <div>
      <h3>FO Deal Summary by Month</h3>
      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Metric</th>
            {monthNames.map((name, idx) => (
              <th key={idx}>{name.slice(0, 3)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Count</td>
            {monthNames.map((_, idx) => (
              <td key={idx}>{monthData[idx]?.count ?? "-"}</td>
            ))}
          </tr>
          <tr>
            <td>Deal Value</td>
            {monthNames.map((_, idx) => (
              <td key={idx}>
                {monthData[idx]?.opportunity_value_ex
                  ? formatValue(monthData[idx].opportunity_value_ex)
                  : "-"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FODashboardTable;
