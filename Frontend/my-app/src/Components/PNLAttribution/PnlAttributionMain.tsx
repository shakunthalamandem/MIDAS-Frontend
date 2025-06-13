import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Typography,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { ApiResponse, formatNumber } from "./UtilisPnlAttribution";

const PnlAttributionMain = () => {
  const [data, setData] = useState<ApiResponse>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/pnls_summary/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        if (json && typeof json === "object") setData(json);
        else setData({});
      } catch (err) {
        console.error(err);
        setData({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  const allMonths: string[] = React.useMemo(() => {
    const monthsSet = new Set<string>();
    Object.values(data).forEach((funds) => {
      Object.values(funds).forEach((fund) => {
        Object.keys(fund).forEach((key) => {
          if (key !== "asset_type") monthsSet.add(key);
        });
      });
    });
    const monthsArray = Array.from(monthsSet);
    monthsArray.sort((a, b) => {
      if (a === "YTD") return 1;
      if (b === "YTD") return -1;
      return a.localeCompare(b);
    });
    return monthsArray;
  }, [data]);

  if (loading) return <Typography>Loading...</Typography>;

  if (!data || Object.keys(data).length === 0)
    return <Typography>No data available</Typography>;

  const handleToggleExpand = (assetType: string) => {
    setExpanded((prev) => ({
      ...prev,
      [assetType]: !prev[assetType],
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
          fontSize: "0.875rem",
          mb: 1,
        }}
      >
        PnL Attribution
      </Typography>

      <TableContainer>
        <Table
          size="small"
          sx={{
            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            borderCollapse: "collapse",
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                height: 30,
              }}
            >
              <TableCell
                sx={{
                  backgroundColor: "rgb(70, 102, 117)",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid black",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                }}
              >
                Asset Type
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "rgb(70, 102, 117)",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid black",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                }}
              >
                Fund Name
              </TableCell>
              {allMonths.map((month) => (
                <TableCell
                  key={month}
                  sx={{
                    backgroundColor: "rgb(70, 102, 117)",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid black",
                    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {month}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.entries(data).map(([assetType, funds]) => {
              const fundNames = Object.keys(funds);

              // Calculate totals for asset type
              const totals = allMonths.reduce<Record<string, number>>(
                (acc, month) => {
                  acc[month] = 0;
                  return acc;
                },
                {}
              );

              fundNames.forEach((fundName) => {
                const fund = funds[fundName];
                allMonths.forEach((month) => {
                  const val = fund[month];
                  if (typeof val === "number") totals[month] += val;
                });
              });

              const isExpanded = expanded[assetType] || false;

              if (!isExpanded) {
                // Collapsed: show one row per asset type with Total and expand icon on Fund Name cell
                return (
                  <TableRow
                    key={assetType}
                    sx={{
                      fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                      height: 26,
                    }}
                  >
                    <TableCell
                      sx={{
                        border: "1px solid black",
                        fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        padding: "4px 8px",
                        verticalAlign: "middle",
                      }}
                    >
                      {assetType}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid black",
                        fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        padding: "4px 8px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        position: "relative",
                        paddingRight: "32px", // space for icon
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleToggleExpand(assetType)}
                    >
                      Total
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          right: 4,
                          top: "50%",
                          transform: "translateY(-50%)",
                          padding: "2px",
                        }}
                        aria-label="Expand"
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </TableCell>
                    {allMonths.map((month) => (
                      <TableCell
                        key={month}
                        sx={{
                          border: "1px solid black",
                          fontWeight: "bold",
                          textAlign: "right",
                          padding: "4px 8px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                          fontSize: "0.75rem",
                        }}
                      >
                        {formatNumber(totals[month])}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              }

              // Expanded: show all funds plus total row, with asset type cell spanning all fund+total rows
              return (
                <React.Fragment key={assetType}>
                  {fundNames.map((fundName, idx) => {
                    const fund = funds[fundName];
                    return (
                      <TableRow
                        key={fundName}
                        sx={{
                          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                          height: 26,
                        }}
                      >
                        {idx === 0 ? (
                          <TableCell
                            rowSpan={fundNames.length + 1} // all funds + total row
                            sx={{
                              border: "1px solid black",
                              verticalAlign: "middle",
                              fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              padding: "4px 8px",
                            }}
                          >
                            {assetType}
                          </TableCell>
                        ) : null}
                        <TableCell
                          sx={{
                            border: "1px solid black",
                            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                            fontSize: "0.75rem",
                            fontWeight: "normal",
                            padding: "4px 8px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {fundName}
                        </TableCell>
                        {allMonths.map((month) => {
                          const val = fund[month];
                          return (
                            <TableCell
                              key={month}
                              sx={{
                                border: "1px solid black",
                                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                                fontSize: "0.75rem",
                                textAlign: "right",
                                padding: "4px 8px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {val !== undefined ? formatNumber(val) : "N/A"}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}

                  {/* Total Row without icon */}
                  <TableRow
                    sx={{
                      backgroundColor: "rgb(145, 206, 137)",
                      fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                    }}
                  >
                    <TableCell
                      colSpan={1}
                      sx={{
                        border: "1px solid black",
                        padding: "4px 8px",
                        fontWeight: "bold",
                        fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                        fontSize: "0.75rem",
                        textAlign: "left",
                      }}
                    >
                      Total
                    </TableCell>
                    {allMonths.map((month) => (
                      <TableCell
                        key={month}
                        sx={{
                          border: "1px solid black",
                          fontWeight: "bold",
                          textAlign: "right",
                          padding: "4px 8px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                          fontSize: "0.75rem",
                        }}
                      >
                        {formatNumber(totals[month])}
                      </TableCell>
                    ))}
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

export default PnlAttributionMain;
