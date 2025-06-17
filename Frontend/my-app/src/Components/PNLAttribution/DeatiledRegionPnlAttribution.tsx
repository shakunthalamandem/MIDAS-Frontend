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
  Typography,
  Container,
} from "@mui/material";
import { useParams } from "react-router-dom";

interface BaseData {
  broad_region: string;
  YTD: number;
  asset_type: string;
  [key: string]: string | number;
}

const formatNumber = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) return "-";
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formattedValue =
    absValue >= 1000
      ? `${Math.floor(absValue / 1000).toLocaleString()}K`
      : absValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
};

const DeatiledRegionPnlAttribution: React.FC = () => {
  const { assetType } = useParams<{ assetType: string }>();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [data, setData] = useState<Record<string, Record<string, BaseData>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthColumns, setMonthColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!assetType) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/detailed_pnl/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ asset_type: assetType }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const jsonData: Record<string, Record<string, BaseData>> = await response.json();
        setData(jsonData);

        const firstRegion = Object.values(jsonData)[0];
        const firstFund = firstRegion ? Object.values(firstRegion)[0] : null;

        if (firstFund) {
          const knownKeys = new Set(["broad_region", "YTD", "asset_type"]);
          const months = Object.keys(firstFund).filter((key) => !knownKeys.has(key));
          setMonthColumns(months);
        } else {
          setMonthColumns([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assetType, apiUrl, token]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!data || Object.keys(data).length === 0) {
    return (
      <Typography>
        No data available for asset type <strong>{assetType}</strong>
      </Typography>
    );
  }

  const regionOrder = ["US", "EMEA", "APAC", "Non-US America"];

  // Overall total calculation
  const overallTotals: Record<string, number> = {};
  Object.values(data).forEach((regionData) => {
    Object.values(regionData).forEach((fund) => {
      monthColumns.forEach((month) => {
        overallTotals[month] = (overallTotals[month] || 0) + (Number(fund[month]) || 0);
      });
      overallTotals.YTD = (overallTotals.YTD || 0) + (Number(fund.YTD) || 0);
    });
  });

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#002060", mb: 2, textAlign: "center" }}
      >
        Detailed Region-wise PnL for {assetType}
      </Typography>
      <TableContainer component={Paper} sx={{ border: "1px solid #000" }}>
        <Table aria-label="Detailed Region PnL Attribution" sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              <TableCell
                sx={{
                  color: "#fff",
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "4px 8px",
                  fontSize: "0.875rem",
                  width: "120px",
                }}
              >
                Region
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "4px 8px",
                  fontSize: "0.875rem",
                }}
              >
                Fund
              </TableCell>
              {monthColumns.map((month) => (
                <TableCell
                  key={month}
                  sx={{
                    color: "#fff",
                    border: "1px solid #000",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "4px 8px",
                    fontSize: "0.875rem",
                  }}
                >
                  {month}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  color: "#fff",
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "4px 8px",
                  fontSize: "0.875rem",
                }}
              >
                YTD
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {regionOrder
              .filter((region) => data[region])
              .map((region) => {
                const funds = data[region];
                const fundEntries = Object.entries(funds).sort(([a], [b]) => a.localeCompare(b));
                const regionSpan = fundEntries.length;

                const totals = fundEntries.reduce(
                  (acc, [, row]) => {
                    monthColumns.forEach((month) => {
                      const val = Number(row[month]) || 0;
                      acc[month] = (acc[month] || 0) + val;
                    });
                    acc.YTD = (acc.YTD || 0) + (Number(row.YTD) || 0);
                    return acc;
                  },
                  {} as Record<string, number>
                );

                return (
                  <React.Fragment key={region}>
                    {fundEntries.map(([fundName, row], idx) => {
                      const isLast = idx === fundEntries.length - 1;
                      return (
                        <TableRow
                          key={`${region}-${fundName}`}
                          sx={{ borderBottom: isLast ? "2px solid #000" : undefined }}
                        >
                          {idx === 0 && (
                            <TableCell
                              rowSpan={regionSpan + 1}
                              sx={{
                                border: "none",
                                borderRight: "1px solid #000",
                                borderBottom: isLast ? "2px solid #000" : "none",
                                textAlign: "center",
                                verticalAlign: "middle",
                                fontWeight: "bold",
                                width: "120px",
                                padding: "4px 8px",
                                fontSize: "0.875rem",
                              }}
                            >
                              {region}
                            </TableCell>
                          )}
                          <TableCell
                            sx={{
                              border: "1px solid #000",
                              textAlign: "center",
                              padding: "4px 8px",
                              fontSize: "0.875rem",
                            }}
                          >
                            {fundName}
                          </TableCell>
                          {monthColumns.map((month) => (
                            <TableCell
                              key={`${region}-${fundName}-${month}`}
                              sx={{
                                border: "1px solid #000",
                                textAlign: "center",
                                padding: "4px 8px",
                                fontSize: "0.875rem",
                              }}
                            >
                              {formatNumber(row[month] as number)}
                            </TableCell>
                          ))}
                          <TableCell
                            sx={{
                              border: "1px solid #000",
                              textAlign: "center",
                              padding: "4px 8px",
                              fontSize: "0.875rem",
                            }}
                          >
                            {formatNumber(row.YTD)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow
                      sx={{
                        backgroundColor: "rgb(145, 206, 137)",
                        fontWeight: "bold",
                        borderTop: "2px solid #000",
                        borderBottom: "2px solid #000",
                      }}
                    >
                      <TableCell
                        colSpan={1}
                        sx={{
                          border: "1px solid #000",
                          fontWeight: "bold",
                          textAlign: "center",
                          padding: "4px 8px",
                          fontSize: "0.875rem",
                        }}
                      >
                        Sum
                      </TableCell>
                      {monthColumns.map((month) => (
                        <TableCell
                          key={`${region}-total-${month}`}
                          sx={{
                            border: "1px solid #000",
                            textAlign: "center",
                            padding: "4px 8px",
                            fontSize: "0.875rem",
                          }}
                        >
                          {formatNumber(totals[month])}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          border: "1px solid #000",
                          textAlign: "center",
                          padding: "4px 8px",
                          fontSize: "0.875rem",
                        }}
                      >
                        {formatNumber(totals.YTD)}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            {/* Overall Total Row */}
            <TableRow
              sx={{
                backgroundColor: "#fde8b7",
                fontWeight: "bold",
                borderTop: "3px solid #000",
                borderBottom: "3px solid #000",
              }}
            >
              <TableCell
                colSpan={2}
                sx={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "4px 8px",
                  fontSize: "0.875rem",
                }}
              >
                Overall Total
              </TableCell>
              {monthColumns.map((month) => (
                <TableCell
                  key={`overall-${month}`}
                  sx={{
                    border: "1px solid #000",
                    textAlign: "center",
                    padding: "4px 8px",
                    fontSize: "0.875rem",
                  }}
                >
                  {formatNumber(overallTotals[month])}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  border: "1px solid #000",
                  textAlign: "center",
                  padding: "4px 8px",
                  fontSize: "0.875rem",
                }}
              >
                {formatNumber(overallTotals.YTD)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DeatiledRegionPnlAttribution;
