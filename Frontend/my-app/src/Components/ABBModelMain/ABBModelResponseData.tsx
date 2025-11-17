import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Typography } from "@mui/material";
import { green, red, blue } from "@mui/material/colors";

interface Payload {
  ticker: string;
  trade_date: string;
  launch_date: string;
  clean_up: boolean;
  seasoned: boolean;
  timing: boolean;
  primary: boolean;
  emerging_mkt: boolean;
  block_deal_shares: number;
  block_deal_percentage_of_market_cap: number;
  block_deal_value_in_local_currency: number;
  block_deal_value_in_dollar: number;
}

const ABBModelResponseData = ({ payload }: { payload: Payload }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/abb_factset_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [payload]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const formatNumber = (num: any, type: string) => {
    if (type === "currency") {
      return `$${num.toLocaleString()}`;
    } else if (type === "percent") {
      return `${num.toFixed(2)}%`;
    } else {
      return num.toLocaleString();
    }
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="response-data-table">
        <TableBody>
          {Object.entries(data).map(([key, value]) => {
            let label: string = key.replace(/_/g, " ");
            const isNumber = typeof value === "number";

            // Example: Formatting specific fields
            let valueFormatted: string = "";
            if (key.includes("percent")) {
              valueFormatted = formatNumber(value, "percent");
            } else if (key.includes("share_price") || key.includes("market_cap") || key.includes("value")) {
              valueFormatted = formatNumber(value, "currency");
            } else if (isNumber) {
              valueFormatted = formatNumber(value, "default");
            } else {
              valueFormatted = String(value);  // Ensure valueFormatted is always a string
            }

            return (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: 700, color: blue[800] }}>
                  <Typography variant="body2">{label}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: valueFormatted.includes('%') && parseFloat(valueFormatted) > 0
                        ? green[500]
                        : red[500],
                    }}
                  >
                    {valueFormatted}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ABBModelResponseData;
