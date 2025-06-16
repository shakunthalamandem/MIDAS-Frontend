import React from "react";

interface DealData {
  opportunity_value_ex: number;
  count?: number;
}

interface IPODashboardTableProps {
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
  if (!parts) return 0;
  const monthNum = parseInt(parts[parts.length - 1], 10); // assumes MM is at end
  return monthNum - 1;
};

const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) return `₹${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)}M`;
  return `₹${value.toFixed(2)}`;
};

const IPODashboardTable: React.FC<IPODashboardTableProps> = ({ payload }) => {
  const monthData: { [index: number]: DealData } = {};

  Object.entries(payload).forEach(([month, dealTypes]) => {
    const idx = getMonthIndex(month);
    const deal = dealTypes["IPO"];
    if (deal) {
      monthData[idx] = deal;
    }
  });

  return (
    <div>
      <h3>IPO Deal Summary by Month</h3>
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

export default IPODashboardTable;
