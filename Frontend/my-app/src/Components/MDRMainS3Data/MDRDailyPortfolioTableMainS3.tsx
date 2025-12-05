// MDRDailyPortfolioTableMainS3.tsx
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import MDRDailyPortfolioTableView from "./MDRDailyPortfolioTableView";
import { MDRDailyPortfolioRow } from "./MDRDailyPortfolioTypes";

interface MDRDailyPortfolioTableMainS3Props {
  rows: MDRDailyPortfolioRow[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  tradeDate?: string;
  pdfMode?: boolean;
}

/* ========= Helpers used by container ========= */

// Safe filename for Excel
const getExcelFileName = (tradeDate?: string) => {
  const safeSuffix = tradeDate
    ? `_${String(tradeDate).replace(/[^0-9A-Za-z]/g, "_")}`
    : "";
  return `Monashee_Daily_Report${safeSuffix}.xlsx`;
};

// Trade date label: "01st Dec 2025"
const formatTradeDateDisplay = (tradeDate?: string): string => {
  if (!tradeDate) return "";

  // Expecting "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS"
  const [yearStr, monthStr, dayStr] = tradeDate.split(/[-T]/);
  const year = Number(yearStr);
  const month = Number(monthStr); // 1–12
  const day = Number(dayStr);

  if (!year || !month || !day) return tradeDate;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getDaySuffix = (d: number) => {
    if (d >= 11 && d <= 13) return "th";
    const last = d % 10;
    if (last === 1) return "st";
    if (last === 2) return "nd";
    if (last === 3) return "rd";
    return "th";
  };

  const dayPadded = day.toString().padStart(2, "0");
  const suffix = getDaySuffix(day);
  const monthName = monthNames[month - 1] ?? monthStr.toLowerCase();

  return `${dayPadded}${suffix} ${monthName} ${year}`;
};

const MDRDailyPortfolioTableMainS3: React.FC<
  MDRDailyPortfolioTableMainS3Props
> = ({ rows, loading, error, onRefresh, tradeDate, pdfMode = false }) => {
  const [searchText, setSearchText] = useState<string>("");

  // Excel export
  const exportToExcel = () => {
    const exportData = rows.map(({ id, ...row }: MDRDailyPortfolioRow) => row);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deals");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, getExcelFileName(tradeDate));
  };

  // Ticker options for autocomplete
  const tickerOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.ticker)))
        .filter(Boolean)
        .sort(),
    [rows]
  );

  // Filter rows by ticker search
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const value = searchText.toLowerCase();
    return rows.filter((row) => row.ticker.toLowerCase().includes(value));
  }, [rows, searchText]);

  const formattedTradeDate = formatTradeDateDisplay(tradeDate);

  return (
    <MDRDailyPortfolioTableView
      rows={filteredRows}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      titleSuffix={formattedTradeDate}
      tickerOptions={tickerOptions}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      onExport={exportToExcel}
      pdfMode={pdfMode}
    />
  );
};

export default MDRDailyPortfolioTableMainS3;
