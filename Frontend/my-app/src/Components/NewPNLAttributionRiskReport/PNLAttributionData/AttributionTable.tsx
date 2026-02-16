import React from "react";
import { Box } from "@mui/material";
import type { AttributionItem } from "./types";
import { formatCurrency } from "./utils";
import "./AttributionTable.css";

interface AttributionTableProps {
  data: AttributionItem[];
  showPct: boolean;
}

const formatPctVal = (value: number) => `${value.toFixed(2)}%`;

const AttributionTable: React.FC<AttributionTableProps> = ({
  data,
  showPct,
}) => {
  const fmt = (val: number, pct: number) =>
    showPct ? formatPctVal(pct) : formatCurrency(val);

  return (
    <Box className="attr-table-wrapper">
      <table className="attr-table">
        <thead>
          <tr>
            <th className="attr-table-th attr-table-th--left">Issuer</th>
            <th className="attr-table-th attr-table-th--right">DTD P&L</th>
            <th className="attr-table-th attr-table-th--right">MTD P&L</th>
            <th className="attr-table-th attr-table-th--right">YTD P&L</th>
            <th className="attr-table-th attr-table-th--right">Net Exp</th>
            <th className="attr-table-th attr-table-th--right">&beta; Adj Net</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={item.name} className={idx % 2 === 0 ? "attr-table-row--even" : ""}>
              <td className="attr-table-td attr-table-td--name">{item.name}</td>
              <td className="attr-table-td attr-table-td--right attr-table-td--pnl">
                {fmt(item.dtd_pnl, item.dtd_pnl_pct)}
              </td>
              <td className="attr-table-td attr-table-td--right attr-table-td--pnl">
                {fmt(item.mtd_pnl, item.mtd_pnl_pct)}
              </td>
              <td className="attr-table-td attr-table-td--right attr-table-td--pnl">
                {fmt(item.ytd_pnl, item.ytd_pnl_pct)}
              </td>
              <td className="attr-table-td attr-table-td--right attr-table-td--exposure">
                {fmt(item.net_exp, item.net_exp_pct)}
              </td>
              <td className="attr-table-td attr-table-td--right attr-table-td--exposure">
                {fmt(item.beta_adj_net, item.beta_adj_net_pct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default AttributionTable;
