import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { DealRecommendationResponse } from "./DealRecommendationHome";

type Props = Pick<
  DealRecommendationResponse,
  | "peers_count"
  | "peers_ticker_list"
  | "peers_t1d_avg_price"
  | "peers_t1w_avg_price"
  | "peers_t1m_avg_price"
>;

export function PastDealsCard({
  peers_count,
  peers_ticker_list,
  peers_t1d_avg_price,
  peers_t1w_avg_price,
  peers_t1m_avg_price,
}: Props) {
  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 2,
        bgcolor: "#fff",
      }}
    >
      <CardContent>
        {/* Title */}
        <Typography variant="h6" fontWeight={700} textAlign="center" mb={1}>
          Deal Momentum (Peers Avg Returns)
        </Typography>

        {/* Subtitle */}
        <Typography variant="body2" color="#000000" textAlign="center" mb={2}>
          These peers are selected based on matching region, sector, and deal
          structure to ensure relevant benchmarking.
        </Typography>

        {/* Table Wrapper */}
        <Box
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, width: "20%" }}>
                  Peers
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: "15%" }}
                >
                  1st Day
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: "15%" }}
                >
                  1st Week
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: "15%" }}
                >
                  1st Month
                </TableCell>

                {/* New Column */}
                <TableCell sx={{ fontWeight: 600, width: "35%" }}>
                  Peer Tickers
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>Peers Average (Top {peers_count})</TableCell>

                <TableCell align="center">
                  {peers_t1d_avg_price?.toFixed(2)}%
                </TableCell>

                <TableCell align="center">
                  {peers_t1w_avg_price?.toFixed(2)}%
                </TableCell>

                <TableCell align="center">
                  {peers_t1m_avg_price?.toFixed(2)}%
                </TableCell>

                {/* Peer List Cell */}
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    {peers_ticker_list?.map((ticker) => (
                      <Chip
                        key={ticker}
                        label={ticker}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "11px",
                          height: 22,
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}
