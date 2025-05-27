import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";

interface SectorMetrics {
  "Allocation Return"?: number;
  "AM Return"?: number;
  "Model Return 1% Allocation"?: number;
  "Model AM Return"?: number;
}

interface SectorData {
  [sector: string]: SectorMetrics;
}

interface CombinedSectorData {
  [sector: string]: {
    FO?: SectorMetrics;
    IPO?: SectorMetrics;
  };
}

const DashboardSectorWiseTable: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL!;
  const token = localStorage.getItem("access_token");

  const [foData, setFoData] = useState<SectorData | null>(null);
  const [ipoData, setIpoData] = useState<SectorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGapAnalysis = async (dealType: string): Promise<SectorData> => {
    const payload = {
      years: [2025],
      period: [],
      deal_type: [dealType],
      fo_type: [],
      broad_region: [],
      gics_sector: [],
      deal_captain: [],
      selected_bank: [],
      filter_type: "gics_sector_from_bloomberg",
    };

    const response = await fetch(`${apiUrl}/api/gap_analysis/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data["2025"];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [foResult, ipoResult] = await Promise.all([
          fetchGapAnalysis("FO"),
          fetchGapAnalysis("IPO"),
        ]);
        setFoData(foResult);
        setIpoData(ipoResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);


  const handleCardClick = () => {
  window.open("/equity/monashee-deals/gap-analysis", "_blank");
};

  const formatValue = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return "-";
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (absValue >= 1_000_000_000)
      return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
    if (absValue >= 1_000_000)
      return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
    if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;
    return `${sign}$${absValue.toFixed(2)}`;
  };

  const calculateTotal = (metrics?: SectorMetrics): number | null => {
    if (!metrics) return null;
    const ar = metrics["Allocation Return"];
    const am = metrics["AM Return"];
    if (ar === undefined || am === undefined || isNaN(ar) || isNaN(am))
      return null;
    return ar + am;
  };

  const calculateModelTotal = (metrics?: SectorMetrics): number | null => {
    if (!metrics) return null;
    const mra = metrics["Model Return 1% Allocation"];
    const mam = metrics["Model AM Return"];
    if (mra === undefined || mam === undefined || isNaN(mra) || isNaN(mam))
      return null;
    return mra + mam;
  };

  const mergeData = (): CombinedSectorData => {
    const combined: CombinedSectorData = {};

    if (foData) {
      Object.entries(foData).forEach(([sector, metrics]) => {
        combined[sector] = { ...combined[sector], FO: metrics };
      });
    }

    if (ipoData) {
      Object.entries(ipoData).forEach(([sector, metrics]) => {
        combined[sector] = { ...combined[sector], IPO: metrics };
      });
    }

    return combined;
  };

  if (loading) return <CircularProgress />;

  const combinedData = mergeData();
  const sectorNames = Object.keys(combinedData).filter((s) => s !== "Summary");
  const summary = combinedData["Summary"];

  // Prepare arrays of values for each FO and IPO metric (actual, model, gap)
  const foActualValues: number[] = [];
  const foModelValues: number[] = [];
  const foGapValues: number[] = [];

  const ipoActualValues: number[] = [];
  const ipoModelValues: number[] = [];
  const ipoGapValues: number[] = [];

  sectorNames.forEach((sector) => {
    const fo = combinedData[sector]?.FO;
    const ipo = combinedData[sector]?.IPO;

    const foActual = calculateTotal(fo);
    const foModel = calculateModelTotal(fo);
    const foGap =
      foActual !== null && foModel !== null ? foActual - foModel : null;

    const ipoActual = calculateTotal(ipo);
    const ipoModel = calculateModelTotal(ipo);
    const ipoGap =
      ipoActual !== null && ipoModel !== null ? ipoActual - ipoModel : null;

    if (foActual !== null) foActualValues.push(foActual);
    if (foModel !== null) foModelValues.push(foModel);
    if (foGap !== null) foGapValues.push(foGap);

    if (ipoActual !== null) ipoActualValues.push(ipoActual);
    if (ipoModel !== null) ipoModelValues.push(ipoModel);
    if (ipoGap !== null) ipoGapValues.push(ipoGap);
  });

  // Utility to get top 3 unique values sorted descending
  const getTop3 = (arr: number[]) => {
    return Array.from(new Set(arr))
      .sort((a, b) => b - a)
      .slice(0, 3);
  };

  const top3 = {
    foActual: getTop3(foActualValues),
    foModel: getTop3(foModelValues),
    foGap: getTop3(foGapValues),
    ipoActual: getTop3(ipoActualValues),
    ipoModel: getTop3(ipoModelValues),
    ipoGap: getTop3(ipoGapValues),
  };

  return (
    <Box sx={{maxWidth:'1000px'}}  onClick={handleCardClick}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: "bold",
          textAlign: "center",
          color: "#002060",
        }}
      >
        Sector Wise IPO and FO Data for 2025
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small" sx={{borderRadius: 3, overflow: 'hidden'}}>
          <TableHead>
            <TableRow>
              <TableCell
                rowSpan={2}
                sx={{
                  backgroundColor: "#002060",
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  textAlign: "center",
                  verticalAlign: "middle",
                  minWidth: 160,
                }}
              >
                Sector
              </TableCell>

              <TableCell
                colSpan={3}
                align="center"
                sx={{
                  backgroundColor: "#0F4A85",
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                }}
              >
                FO
              </TableCell>
              <TableCell
                colSpan={3}
                align="center"
                sx={{
                  backgroundColor: "#0F4A85",
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                }}
              >
                IPO
              </TableCell>
            </TableRow>
            <TableRow>
              {[
                "Monashee Actual<br />Total PnL (Gross)",
                "Model Actual<br />Total PnL (Gross)",
                "Total Gap",
              ].map((label, index) => (
                <TableCell
                  key={`fo-header-${index}`}
                  sx={{
                    backgroundColor: "#002060",
                    color: "#fff",
                    fontWeight: "bold",
                    border: 1,
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: label }} />
                </TableCell>
              ))}
              {[
                "Monashee Actual<br />Total PnL (Gross)",
                "Model Actual<br />Total PnL (Gross)",
                "Total Gap",
              ].map((label, index) => (
                <TableCell
                  key={`ipo-header-${index}`}
                  sx={{
                    backgroundColor: "#002060",
                    color: "#fff",
                    fontWeight: "bold",
                    border: 1,
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: label }} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sectorNames.map((sector) => {
              const fo = combinedData[sector]?.FO;
              const ipo = combinedData[sector]?.IPO;

              const foActual = calculateTotal(fo);
              const foModel = calculateModelTotal(fo);
              const foGap =
                foActual !== null && foModel !== null
                  ? foActual - foModel
                  : null;

              const ipoActual = calculateTotal(ipo);
              const ipoModel = calculateModelTotal(ipo);
              const ipoGap =
                ipoActual !== null && ipoModel !== null
                  ? ipoActual - ipoModel
                  : null;

              return (
                <TableRow key={sector}>
                  <TableCell sx={{ border: 1 }}>{sector}</TableCell>

                  <TableCell
                    sx={{
                      border: 1,
                      backgroundColor: top3.foActual.includes(foActual ?? NaN)
                        ? "#ffd9b3"
                        : undefined,
                    }}
                  >
                    {formatValue(foActual ?? NaN)}
                  </TableCell>

                  <TableCell
                    sx={{
                      border: 1,
                      backgroundColor: top3.foModel.includes(foModel ?? NaN)
                        ? "#ffd9b3"
                        : undefined,
                    }}
                  >
                    {formatValue(foModel ?? NaN)}
                  </TableCell>

                  <TableCell
                    sx={{
                      border: 1,
                      backgroundColor: top3.foGap.includes(foGap ?? NaN)
                        ? "#ffd9b3"
                        : undefined,
                    }}
                  >
                    {formatValue(foGap ?? NaN)}
                  </TableCell>

                  <TableCell
                    sx={{
                      border: 1,
                      backgroundColor: top3.ipoActual.includes(ipoActual ?? NaN)
                        ? "#ffd9b3"
                        : undefined,
                    }}
                  >
                    {formatValue(ipoActual ?? NaN)}
                  </TableCell>

                  <TableCell
                    sx={{
                      border: 1,
                      backgroundColor: top3.ipoModel.includes(ipoModel ?? NaN)
                        ? "#ffd9b3"
                        : undefined,
                    }}
                  >
                    {formatValue(ipoModel ?? NaN)}
                  </TableCell>

                  <TableCell
                    sx={{
                      border: 1,
                      backgroundColor: top3.ipoGap.includes(ipoGap ?? NaN)
                        ? "#ffd9b3"
                        : undefined,
                    }}
                  >
                    {formatValue(ipoGap ?? NaN)}
                  </TableCell>
                </TableRow>
              );
            })}

            {summary && (
              <TableRow sx={{ backgroundColor: "#7bcf60" }}>
                <TableCell sx={{ fontWeight: "bold", border: 1 }}>
                  Summary
                </TableCell>
                {["FO", "IPO"].flatMap((type) => {
                  const data = summary[type as keyof typeof summary];
                  const actual = calculateTotal(data);
                  const model = calculateModelTotal(data);
                  const gap =
                    actual !== null && model !== null ? actual - model : null;

                  return [
                    <TableCell
                      key={`${type}-actual`}
                      sx={{ fontWeight: "bold", border: 1 }}
                    >
                      {formatValue(actual ?? NaN)}
                    </TableCell>,
                    <TableCell
                      key={`${type}-model`}
                      sx={{ fontWeight: "bold", border: 1 }}
                    >
                      {formatValue(model ?? NaN)}
                    </TableCell>,
                    <TableCell
                      key={`${type}-gap`}
                      sx={{ fontWeight: "bold", border: 1 }}
                    >
                      {formatValue(gap ?? NaN)}
                    </TableCell>,
                  ];
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DashboardSectorWiseTable;
