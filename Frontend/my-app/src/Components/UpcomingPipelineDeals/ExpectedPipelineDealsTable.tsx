import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import PublicIcon from "@mui/icons-material/Public";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TimelineIcon from "@mui/icons-material/Timeline";

type Category = "ipo_international" | "ipo_us" | "fo" | "ipo_europe";

type FoDeal = {
  id?: number | string;
  ticker?: string;
  country?: string;
  sectors?: string;
  consumer_retail?: string;
  key_holders?: string;
  sell_down_size_m?: number | string | null;
  shares_m?: number | string | null;
  market_cap_pct?: number | string | null;
  free_float_pct?: number | string | null;
  adtv_6m_m?: number | string | null;
  current_price_lcy?: number | string | null;
  market_cap_m?: number | string | null;
  adtv_6m_value_m?: number | string | null;
  ytd_move?: number | string | null;
  off_52w_high_pct?: number | string | null;
  last_placement_date?: string | null;
  last_placement_size_m?: number | string | null;
  shares_sold_m?: number | string | null;
  placement_price_lcy?: number | string | null;
  discount_pct?: number | string | null;
  above_below_offer_pct?: number | string | null;
  lockup_date?: string | null;
  earnings?: string | null;
  created_at?: string | null;
};

type IpoInternationalDeal = {
  id?: number | string;
  ticker?: string;
  country?: string;
  sectors?: string;
  consumer_retail?: string;
  backers?: string;
  banks?: string;
  size_m?: number | string | null;
  valuation_m?: number | string | null;
  expected_date?: string | null;
  description?: string;
  created_at?: string | null;
};

type UsIpoDeal = {
  id?: number | string;
  ticker?: string;
  company?: string;
  sector?: string;
  current_price?: number | string | null;
  implied_secondary_mkt_valuation_m?: number | string | null;
  last_round_price?: number | string | null;
  last_round_company_mark?: string | null;
  last_round_post_money_valuation_m?: number | string | null;
  discount_premium?: number | string | null;
  created_at?: string | null;
};

type EuropeDeal = {
  id?: number | string;
  ticker?: string;
  region?: string;
  sector?: string;
  sellers?: string;
  source_link?: string;
  created_at?: string | null;
};

type ApiResponse = {
  fo: FoDeal[];
  ipo_international: IpoInternationalDeal[];
  ipo_us: UsIpoDeal[];
  ipo_europe: EuropeDeal[];
};

type CategoryOption = {
  value: Category;
  label: string;
  icon: React.ElementType;
  color: string;
};

const categoryOptions: CategoryOption[] = [
  { value: "ipo_international", label: "International", icon: PublicIcon, color: "#1565C0" },
  { value: "ipo_us", label: "US IPO", icon: ApartmentIcon, color: "#002060" },
  { value: "fo", label: "US FO", icon: ShowChartIcon, color: "#5D0163" },
  { value: "ipo_europe", label: "Eur Pipeline", icon: TimelineIcon, color: "#6F1178" },
];

const searchFields: Record<Category, string[]> = {
  fo: ["ticker", "country", "sectors", "key_holders", "consumer_retail"],
  ipo_international: ["ticker", "country", "sectors", "backers", "banks", "description"],
  ipo_us: ["ticker", "company", "sector"],
  ipo_europe: ["ticker", "region", "sector", "sellers", "source_link"],
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const renderHeader = (label: string) => (
  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{label}</Typography>
);

const formatNumber = (value: number | string | null | undefined, decimals = 0) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatMillions = (value: number | string | null | undefined, decimals = 0) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}m`;
};

const formatPercent = (value: number | string | null | undefined, decimals = 1) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num.toFixed(decimals)}%`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
};

const columnSets: Record<Category, GridColDef[]> = {
  fo: [
    { field: "ticker", headerName: "XTicker", renderHeader: () => renderHeader("XTicker"), flex: 0.8, minWidth: 110 },
    { field: "country", headerName: "Country", renderHeader: () => renderHeader("Country"), flex: 0.9, minWidth: 120 },
    { field: "sectors", headerName: "Sectors", renderHeader: () => renderHeader("Sectors"), flex: 1.1, minWidth: 140 },
    { field: "consumer_retail", headerName: "Consumer & Retail", renderHeader: () => renderHeader("Consumer & Retail"), flex: 1, minWidth: 150 },
    { field: "key_holders", headerName: "Key Holders", renderHeader: () => renderHeader("Key Holders"), flex: 1, minWidth: 150 },
    {
      field: "sell_down_size_m",
      headerName: "Sell-Down Size ($m)",
      renderHeader: () => renderHeader("Sell-Down Size ($m)"),
      flex: 1,
      minWidth: 150,
      renderCell: (params) => formatMillions(params.value),
    },
    {
      field: "market_cap_pct",
      headerName: "% Market Cap",
      renderHeader: () => renderHeader("% Market Cap"),
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => formatPercent(params.value),
    },
    {
      field: "free_float_pct",
      headerName: "% Free Float",
      renderHeader: () => renderHeader("% Free Float"),
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => formatPercent(params.value),
    },
    {
      field: "adtv_6m_value_m",
      headerName: "6m ADTV ($m)",
      renderHeader: () => renderHeader("6m ADTV ($m)"),
      flex: 1,
      minWidth: 130,
      renderCell: (params) => formatMillions(params.value),
    },
    {
      field: "ytd_move",
      headerName: "YTD Move",
      renderHeader: () => renderHeader("YTD Move"),
      flex: 0.8,
      minWidth: 110,
      renderCell: (params) => formatPercent(params.value),
    },
    {
      field: "off_52w_high_pct",
      headerName: "% off 52w High",
      renderHeader: () => renderHeader("% off 52w High"),
      flex: 1,
      minWidth: 140,
      renderCell: (params) => formatPercent(params.value),
    },
    {
      field: "lockup_date",
      headerName: "Lockup Date",
      renderHeader: () => renderHeader("Lockup Date"),
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => formatDate(params.value),
    },
  ],
  ipo_international: [
    { field: "ticker", headerName: "XTicker", renderHeader: () => renderHeader("XTicker"), flex: 0.8, minWidth: 110 },
    { field: "country", headerName: "Country", renderHeader: () => renderHeader("Country"), flex: 0.9, minWidth: 120 },
    { field: "sectors", headerName: "Sectors", renderHeader: () => renderHeader("Sectors"), flex: 1.1, minWidth: 140 },
    { field: "backers", headerName: "Backers", renderHeader: () => renderHeader("Backers"), flex: 1, minWidth: 150 },
    { field: "banks", headerName: "Banks", renderHeader: () => renderHeader("Banks"), flex: 1, minWidth: 150 },
    {
      field: "size_m",
      headerName: "Size ($m)",
      renderHeader: () => renderHeader("Size ($m)"),
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => formatMillions(params.value),
    },
    {
      field: "valuation_m",
      headerName: "Valuation ($m)",
      renderHeader: () => renderHeader("Valuation ($m)"),
      flex: 1,
      minWidth: 150,
      renderCell: (params) => formatMillions(params.value),
    },
    {
      field: "expected_date",
      headerName: "Expected Date",
      renderHeader: () => renderHeader("Expected Date"),
      flex: 0.9,
      minWidth: 130,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "description",
      headerName: "Description",
      renderHeader: () => renderHeader("Description"),
      flex: 1.5,
      minWidth: 220,
    },
  ],
  ipo_us: [
    { field: "ticker", headerName: "XTicker", renderHeader: () => renderHeader("XTicker"), flex: 0.8, minWidth: 110 },
    { field: "company", headerName: "Company", renderHeader: () => renderHeader("Company"), flex: 1.2, minWidth: 150 },
    { field: "sector", headerName: "Sector", renderHeader: () => renderHeader("Sector"), flex: 1, minWidth: 130 },
    {
      field: "current_price",
      headerName: "Current Price",
      renderHeader: () => renderHeader("Current Price"),
      flex: 0.9,
      minWidth: 130,
      renderCell: (params) => `$${formatNumber(params.value, 2)}`,
    },
    {
      field: "implied_secondary_mkt_valuation_m",
      headerName: "Impl. Sec. Mkt Val ($m)",
      renderHeader: () => renderHeader("Impl. Sec. Mkt Val ($m)"),
      flex: 1.1,
      minWidth: 180,
      renderCell: (params) => formatMillions(params.value),
    },
    {
      field: "last_round_price",
      headerName: "Last Round Price",
      renderHeader: () => renderHeader("Last Round Price"),
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => `$${formatNumber(params.value, 2)}`,
    },
    {
      field: "last_round_post_money_valuation_m",
      headerName: "Last Round Post-Money ($m)",
      renderHeader: () => renderHeader("Last Round Post-Money ($m)"),
      flex: 1.1,
      minWidth: 190,
      renderCell: (params) => formatMillions(params.value),
    },
    {
      field: "discount_premium",
      headerName: "Discount / Premium",
      renderHeader: () => renderHeader("Discount / Premium"),
      flex: 1,
      minWidth: 160,
      renderCell: (params) => formatPercent(params.value),
    },
  ],
  ipo_europe: [
    { field: "ticker", headerName: "XTicker", renderHeader: () => renderHeader("XTicker"), flex: 0.8, minWidth: 110 },
    { field: "region", headerName: "Region", renderHeader: () => renderHeader("Region"), flex: 0.9, minWidth: 120 },
    { field: "sector", headerName: "Sector", renderHeader: () => renderHeader("Sector"), flex: 1, minWidth: 130 },
    { field: "sellers", headerName: "Sellers", renderHeader: () => renderHeader("Sellers"), flex: 1.2, minWidth: 160 },
    {
      field: "source_link",
      headerName: "Source",
      renderHeader: () => renderHeader("Source"),
      flex: 1,
      minWidth: 160,
      renderCell: (params) =>
        params.value ? (
          <a
            href={params.value as string}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#002060", textDecoration: "underline" }}
          >
            Link
          </a>
        ) : (
          "-"
        ),
    },
   
  ],
};

const ExpectedPipelineDealsTable: React.FC = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [data, setData] = useState<ApiResponse>({
    fo: [],
    ipo_international: [],
    ipo_us: [],
    ipo_europe: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<Category>("ipo_international");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const loadData = async () => {
    setStatus("loading");
    setError(null);

    try {
      if (!API_URL) {
        throw new Error("REACT_APP_API_URL is not set.");
      }

      const res = await fetch(`${API_URL}/api/pipeline_expected_deals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({}),
      });

      const text = await res.text();
      const json = text ? (JSON.parse(text) as Partial<ApiResponse>) : {};

      if (!res.ok) {
        throw new Error((json as any)?.error || (json as any)?.detail || "Failed to load pipeline data.");
      }

      setData({
        fo: json.fo ?? [],
        ipo_international: json.ipo_international ?? [],
        ipo_us: json.ipo_us ?? [],
        ipo_europe: json.ipo_europe ?? [],
      });
      setStatus("success");
    } catch (err: any) {
      console.error("Error fetching pipeline data:", err);
      setError(err?.message || "Could not load pipeline data. Please retry.");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!API_URL) {
      setError("REACT_APP_API_URL is not set.");
      setStatus("error");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const rows = useMemo(() => {
    const list = (data[selectedCategory] as any[]) || [];
    const normalized = list.map((item, idx) => ({
      id: item.id ?? `${selectedCategory}-${idx}`,
      ...item,
    }));

    const term = searchTerm.trim().toLowerCase();
    if (!term) return normalized;

    const keys = searchFields[selectedCategory] || [];
    return normalized.filter((item) =>
      keys.some((key) => {
        const val = item[key];
        return val?.toString().toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, selectedCategory]);

  const columns = useMemo(() => columnSets[selectedCategory], [selectedCategory]);

  const isLoading = status === "loading";

  return (
    <Container maxWidth="xl" sx={{ mb: 4, mt: 2 }}>
      <Typography variant="h5" gutterBottom color="#002060" align="center" fontWeight={600}>
        Future Pipeline Deals
      </Typography>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(130,143,255,0.35)",
          boxShadow: "0 18px 45px rgba(43,71,255,0.12)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,248,255,0.96))",
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2, flexWrap: "wrap", gap: 2 }}
          >
            <ToggleButtonGroup
              value={selectedCategory}
              exclusive
              onChange={(_e, val) => val && setSelectedCategory(val as Category)}
              sx={{
                flexWrap: "wrap",
                "& .MuiToggleButton-root": {
                  border: "1px solid rgba(0,32,96,0.16)",
                  borderRadius: 20,
                  textTransform: "none",
                  px: 2,
                  py: 1.1,
                  mr: 1,
                  mb: 1,
                  backgroundColor: "#fff",
                  color: "#002060",
                  gap: 0.75,
                  fontWeight: 700,
                },
                "& .Mui-selected": {
                  backgroundColor: "#6F1178",
                  color: "#ffffff",
                  borderColor: "#6F1178",
                  boxShadow: "0 8px 18px rgba(0,32,96,0.18)",
                },
                "& .MuiToggleButton-root:hover": {
                  backgroundColor: "rgba(21,101,192,0.08)",
                },
              }}
            >
              {categoryOptions.map((option) => {
                const Icon = option.icon;
                const isActive = selectedCategory === option.value;
                return (
                  <ToggleButton key={option.value} value={option.value}>
                    <Icon
                      fontSize="small"
                      sx={{ color: isActive ? "#ffffff" : option.color, transition: "color 0.2s ease" }}
                    />
                    {option.label}
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>

            <TextField
              label="Search"
              placeholder="Search ticker, sector, seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                minWidth: { xs: "100%", md: 320 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  height: 38,
                },
              }}
            />
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ height: 480, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={isLoading}
              disableRowSelectionOnClick
              onRowClick={(params) => setSelectedId(params.id)}
              getRowClassName={(params) => (selectedId === params.id ? "Mui-selected" : "")}
              rowHeight={36}
              sx={{
                "& .MuiDataGrid-container--top [role='row']": {
                  backgroundColor: "#002060",
                  color: "#FFFFFF",
                },
                "& .Mui-selected": {
                  backgroundColor: "#cad0f1ff !important",
                },
                "& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon": {
                  color: "#FFFFFF",
                },
                border: "1px solid #ccccccff",
              }}
              // slots={{
              //   loadingOverlay: CircularProgress,
              // }}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ExpectedPipelineDealsTable;
