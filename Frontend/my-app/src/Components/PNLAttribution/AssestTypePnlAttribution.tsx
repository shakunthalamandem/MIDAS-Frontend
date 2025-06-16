import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
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

const AssestTypePnlAttribution: React.FC = () => {
  const [data, setData] = useState<ApiResponse>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

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

  const handleAssetClick = (assetType: string) => {
    const url = `/portfolio-attribution/details/${encodeURIComponent(assetType)}`;
    window.open(url, "_blank");
  };

  const sortedAssetTypes = assetOrder.filter((key) => data.hasOwnProperty(key));

  if (loading) return <Typography>Loading...</Typography>;
  if (!data || Object.keys(data).length === 0)
    return <Typography>No data available</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mb: 4, mt: 2 }}>
      <Typography
        variant="h3"
        align="left"
        sx={{ color: "#005166", fontSize: "1.75rem", mb: 3 }}
      >
        Fund-Level Performance Breakdown
      </Typography>
      <Typography variant="body1" align="left" sx={{ color: "#666", mb: 2 }}>
        Dive deeper into the performance drivers by analyzing how each
        individual fund has contributed to overall P&L. This breakdown allows
        for a granular view of asset-specific returns, strategy effectiveness,
        and risk-adjusted performance across the Monashee platform.
      </Typography>

      <TableContainer>
        <Table size="small" sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow sx={{ height: 30 }}>
              <TableCell
                sx={{
                  backgroundColor: "#002060",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid black",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  textAlign: "center",
                  // textDecoration: "underline", // Underlining the asset type header
                }}
              >
                Asset Type
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#002060",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid black",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                  minWidth: "80px",
                  maxWidth: "120px",
                  textAlign: "center",
                }}
              >
                Fund Name
              </TableCell>
              {allMonths.map((month) => (
                <TableCell
                  key={month}
                  sx={{
                    backgroundColor: "#002060",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid black",
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    textAlign: "center",
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
              const fundNames = Object.keys(funds).sort(); // Sort fund names alphabetically

              // Calculate totals per month
              const totals = allMonths.reduce<Record<string, number>>((acc, month) => {
                acc[month] = 0;

                return acc;
              }, {});

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
                        fontSize: "0.85rem",
                        padding: "4px 8px",
                        color: "#f52a0a",
                        textAlign: "center",
                        cursor: "pointer", // Indicating clickability
                        textDecoration: "underline", // Underline asset type column
                      }}
                      onClick={() => handleAssetClick(assetType)}
                    >
                      {assetType}
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [assetType]: true,
                        }))
                      }
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
                        textAlign: "center",
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
                        aria-label={`Expand ${assetType}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded((prev) => ({
                            ...prev,
                            [assetType]: true,
                          }));
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </TableCell>
                    {allMonths.map((month) => (
                      <TableCell
                        key={month}
                        sx={{
                          border: "1px solid black",
                          textAlign: "center",
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
                    console.log("fund",fund)
                    return (
                      <TableRow key={fundName}>
                        {idx === 0 && (
                          <TableCell
                            rowSpan={fundNames.length + 1}
                            sx={{
                              border: "1px solid black",
                              fontWeight: "bold",
                              fontSize: "0.85rem",
                              padding: "4px 8px",
                              color: "#f52a0a",
                              verticalAlign: "middle",
                              textAlign: "center",
                              cursor: "pointer", // Indicating clickability
                              textDecoration: "underline", // Underline asset type column
                            }}
                            onClick={() => handleAssetClick(assetType)}
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
                            textAlign: "center",
                          }}
                        >
                          {fundName}
                        </TableCell>
                        {allMonths.map((month) => (
                          <TableCell
                            key={month}
                            sx={{
                              border: "1px solid black",
                              textAlign: "center",
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
                      onClick={() => {
                        if (!alwaysExpandedAssets.includes(assetType)) {
                          setExpanded((prev) => ({
                            ...prev,
                            [assetType]: false,
                          }));
                        }
                      }}
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
                        textAlign: "center",
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
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
                          aria-label={`Collapse ${assetType}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((prev) => ({
                              ...prev,
                              [assetType]: false,
                            }));
                          }}
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
                          textAlign: "center",
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
