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

const assetOrder = [
  "Equities",
  "Convertible Bond",
  "Corporate Bond",
  "Cash",
  "Warrants",
  "Futures",
];

const alwaysExpandedAssets = ["Equities", "Convertible Bond", "Corporate Bond"];

const AssestTypePnlAttribution = () => {
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
    if (alwaysExpandedAssets.includes(assetType)) return;
    setExpanded((prev) => ({
      ...prev,
      [assetType]: !prev[assetType],
    }));
  };

  const sortedAssetTypes = assetOrder.filter((key) => data.hasOwnProperty(key));

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Typography
        variant="h3"
        align="center"
        sx={{
          color: "#005166",
          fontSize: "1.75rem",
          mb: 3,
        }}
      >
        PnL Attribution
      </Typography>

      <TableContainer>
        <Table size="small" sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow sx={{ height: 30 }}>
              <TableCell
                sx={{
                  backgroundColor: "rgb(70, 102, 117)",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid black",
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
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  minWidth: "80px",
                  maxWidth: "120px",
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
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    textAlign: "right",
                  }}
                >
                  {month}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedAssetTypes.map((assetType) => {
              const funds = data[assetType];
              const fundNames = Object.keys(funds);

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

              const isExpanded =
                alwaysExpandedAssets.includes(assetType) || expanded[assetType];

              if (!isExpanded) {
                return (
                  <TableRow key={assetType}>
                    <TableCell
                      sx={{
                        border: "1px solid black",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                      }}
                    >
                      {assetType}
                    </TableCell>
                    <TableCell
                      onClick={() => handleToggleExpand(assetType)}
                      sx={{
                        border: "1px solid black",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        position: "relative",
                        cursor: "pointer",
                        paddingRight: "32px",
                        minWidth: "80px",
                        maxWidth: "120px",
                      }}
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
                          textAlign: "right",
                          padding: "4px 8px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {formatNumber(totals[month])}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              }

              return (
                <React.Fragment key={assetType}>
                  {fundNames.map((fundName, idx) => {
                    const fund = funds[fundName];
                    return (
                      <TableRow key={fundName}>
                        {idx === 0 && (
                          <TableCell
                            rowSpan={fundNames.length + 1}
                            sx={{
                              border: "1px solid black",
                              fontWeight: "bold",
                              fontSize: "0.75rem",
                              padding: "4px 8px",
                              verticalAlign: "middle",
                            }}
                          >
                            {assetType}
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            border: "1px solid black",
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            minWidth: "80px",
                            maxWidth: "120px",
                          }}
                        >
                          {fundName}
                        </TableCell>
                        {allMonths.map((month) => (
                          <TableCell
                            key={month}
                            sx={{
                              border: "1px solid black",
                              textAlign: "right",
                              padding: "4px 8px",
                              fontSize: "0.75rem",
                            }}
                          >
                            {fund[month] !== undefined
                              ? formatNumber(fund[month])
                              : "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}

                  <TableRow
                    sx={{
                      backgroundColor: "rgb(145, 206, 137)",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                    }}
                  >
                    <TableCell
                      colSpan={1}
                      onClick={() => handleToggleExpand(assetType)}
                      sx={{
                        border: "1px solid black",
                        padding: "4px 8px",
                        position: "relative",
                        paddingRight: alwaysExpandedAssets.includes(assetType)
                          ? "8px"
                          : "32px",
                        cursor: alwaysExpandedAssets.includes(assetType)
                          ? "default"
                          : "pointer",
                      }}
                    >
                      Total
                      {!alwaysExpandedAssets.includes(assetType) && (
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            right: 4,
                            top: "50%",
                            transform: "translateY(-50%)",
                            padding: "2px",
                          }}
                          aria-label="Collapse"
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                    {allMonths.map((month) => (
                      <TableCell
                        key={month}
                        sx={{
                          border: "1px solid black",
                          textAlign: "right",
                          padding: "4px 8px",
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

export default AssestTypePnlAttribution;
