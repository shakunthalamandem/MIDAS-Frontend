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
} from "@mui/material";
import { useParams } from "react-router-dom";

interface BaseData {
  broad_region: string;
  YTD: number;
  June: number;
  asset_type: string;
  [key: string]: string | number;
}

const formatNumber = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) return "-";
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formattedValue = absValue >= 1000
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
          body: JSON.stringify({ asset_type: assetType }), // Use assetType from params here
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const jsonData: Record<string, Record<string, BaseData>> = await response.json();
        setData(jsonData);
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
    <TableContainer component={Paper}>
      <Table aria-label="Detailed Region PnL Attribution">
        <TableHead>
          <TableRow>
            <TableCell>Broad Region</TableCell>
            <TableCell>Key</TableCell>
            <TableCell align="right">June</TableCell>
            <TableCell align="right">YTD</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(data).map(([region, keys]) =>
            Object.entries(keys).map(([key, row]) => (
              <TableRow key={`${region}-${key}`}>
                <TableCell>{region}</TableCell>
                <TableCell>{key}</TableCell>
                <TableCell align="right">{formatNumber(row.June as number)}</TableCell>
                <TableCell align="right">{formatNumber(row.YTD as number)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeatiledRegionPnlAttribution;
