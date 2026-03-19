import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

interface UnsupervisedDealData {
  ticker: string;
  issuer_name: string;
  pricing_date: string | null;
  unique_deal_id: string;
  few_shot_review: string;
}

const UnsupervisedDealSummary: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [data, setData] = useState<UnsupervisedDealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<UnsupervisedDealData[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchUnsupervisedData = async () => {
      if (!apiUrl) {
        setError("API URL is missing");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${apiUrl}/api/unsupervised_summary/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed: ${response.statusText}`);
        }

        const result = await response.json();
        const arr = Array.isArray(result) ? result : result.data || [];

        const mapped = arr.map((item: any) => ({
          ticker: item.ticker,
          issuer_name: item.issuer_name,
          pricing_date: item.pricing_date,
          unique_deal_id: item.unique_deal_id,
          few_shot_review: item.few_shot_review,
        }));

        setData(mapped);
        setFilteredData(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to load unsupervised summary data");
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnsupervisedData();
  }, [apiUrl]);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredData(
        data.filter(
          (item) =>
            item.ticker.toLowerCase().includes(term) ||
            item.issuer_name.toLowerCase().includes(term) ||
            item.unique_deal_id.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, data]);

  // Navigation to AI Few Shot Analysis with auto-filled fields
  const handleRowClick = (row: UnsupervisedDealData) => {
    navigate(
      `/ai_fewshot_analysis?ticker=${encodeURIComponent(
        row.ticker
      )}&unique_deal_id=${encodeURIComponent(row.unique_deal_id)}`
    );
  };

  // Loading
  if (loading) {
    return (
      <Container maxWidth={false}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <Box sx={{ width: "95%", mx: "auto", mt: 3 }}>
        {/* Header + Search */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Unsupervised Deal Summary Dashboard
          </Typography>

          <TextField
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 260 }}
            InputProps={{
              startAdornment: (
                <SearchOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />
              ),
            }}
          />
        </Box>

        {/* Count */}
        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
          Showing {filteredData.length} of {data.length}
        </Typography>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 500,
            overflow: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Ticker</b>
                </TableCell>
                <TableCell>
                  <b>Issuer Name</b>
                </TableCell>
                <TableCell>
                  <b>Pricing Date</b>
                </TableCell>
                <TableCell>
                  <b>Deal ID</b>
                </TableCell>
                <TableCell>
                  <b>Action</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <TableRow
                    key={index}
                    hover
                    onClick={() => handleRowClick(row)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {row.ticker}
                    </TableCell>
                    <TableCell>{row.issuer_name}</TableCell>
                    <TableCell>{row.pricing_date || "TBA"}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      {row.unique_deal_id}
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                        sx={{ textTransform: "none" }}
                      >
                        View Analysis
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {searchTerm
                      ? "No results found"
                      : "No unsupervised deal data available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default UnsupervisedDealSummary;
