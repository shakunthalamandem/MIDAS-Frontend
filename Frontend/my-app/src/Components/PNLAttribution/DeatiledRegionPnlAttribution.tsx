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

        // Extract dynamic month columns by excluding known keys
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

  return (
    <Container>
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
                Broad Region
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  border: "1px solid #000",
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
                  align="right"
                  sx={{
                    color: "#fff",
                    border: "1px solid #000",
                    fontWeight: "bold",
                    padding: "4px 8px",
                    fontSize: "0.875rem",
                  }}
                >
                  {month}
                </TableCell>
              ))}

              <TableCell
                align="right"
                sx={{
                  color: "#fff",
                  border: "1px solid #000",
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
            {Object.entries(data).map(([region, keys]) => {
              const fundEntries = Object.entries(keys);
              const regionSpan = fundEntries.length;

              // Calculate totals for the region
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
                  {fundEntries.map(([key, row], idx) => {
                    const isLastInRegion = idx === fundEntries.length - 1;
                    return (
                      <TableRow
                        key={`${region}-${key}`}
                        sx={{
                          borderBottom: isLastInRegion ? "2px solid #000" : undefined,
                        }}
                      >
                        {/* Render broad_region cell once per region with rowSpan */}
                        {idx === 0 && (
                          <TableCell
                            rowSpan={regionSpan + 1} // +1 for total row
                            sx={{
                              border: "none",
                              borderRight: "1px solid #000",
                              borderBottom: isLastInRegion ? "2px solid #000" : "none",
                              textAlign: "center",
                              verticalAlign: "middle",
                              fontWeight: "bold",
                              backgroundColor: "#f5f5f5",
                              width: "120px",
                              padding: "4px 8px",
                              fontSize: "0.875rem",
                            }}
                          >
                            {row.broad_region}
                          </TableCell>
                        )}

                        <TableCell
                          sx={{
                            border: "1px solid #000",
                            padding: "4px 8px",
                            fontSize: "0.875rem",
                          }}
                        >
                          {key}
                        </TableCell>

                        {monthColumns.map((month) => (
                          <TableCell
                            key={`${region}-${key}-${month}`}
                            align="right"
                            sx={{ border: "1px solid #000", padding: "4px 8px", fontSize: "0.875rem" }}
                          >
                            {formatNumber(row[month] as number)}
                          </TableCell>
                        ))}

                        <TableCell
                          align="right"
                          sx={{ border: "1px solid #000", padding: "4px 8px", fontSize: "0.875rem" }}
                        >
                          {formatNumber(row.YTD as number)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Total Row for region */}
                  <TableRow
                    sx={{
                      backgroundColor: "#e6f0ff",
                      fontWeight: "bold",
                      borderTop: "2px solid #000",
                      borderBottom: "2px solid #000",
                    }}
                  >
                    {/* Broad Region & Fund combined cell with colspan=2 */}
                    <TableCell
                      colSpan={1}
                      sx={{
                        border: "1px solid #000",
                        fontWeight: "bold",
                        padding: "4px 8px",
                        fontSize: "0.875rem",
                        textAlign: "center",
                      }}
                    >
                      Total for {region}
                    </TableCell>

                    {monthColumns.map((month) => (
                      <TableCell
                        key={`${region}-total-${month}`}
                        align="right"
                        sx={{ border: "1px solid #000", padding: "4px 8px", fontSize: "0.875rem" }}
                      >
                        {formatNumber(totals[month])}
                      </TableCell>
                    ))}

                    <TableCell
                      align="right"
                      sx={{ border: "1px solid #000", padding: "4px 8px", fontSize: "0.875rem" }}
                    >
                      {formatNumber(totals.YTD)}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DeatiledRegionPnlAttribution;
