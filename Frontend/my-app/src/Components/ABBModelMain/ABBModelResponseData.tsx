import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
interface Payload {
  ticker: string;
  trade_date: string;
  launch_date: string;
  clean_up: string;
  seasoned: string;
  timing: string;
  primary: string;
  emerging_mkt: string;
  block_deal_shares: string;
  block_deal_percentage_of_market_cap: string;
  block_deal_value_in_local_currency: string;
  block_deal_value_in_dollar: string;
}
const ABBModelResponseData = ({ payload }: { payload: Payload }) => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${apiUrl}/api/abb_factset_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setData(result);
    };

    fetchData();
  }, [payload]);

  if (!data) return <p>Loading...</p>;

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableBody>
          {Object.entries(data).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell sx={{ fontWeight: 700 }}>{key}</TableCell>
              <TableCell>{String(value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ABBModelResponseData;
