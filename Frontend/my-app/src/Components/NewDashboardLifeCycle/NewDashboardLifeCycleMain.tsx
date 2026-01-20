import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PublicIcon from "@mui/icons-material/Public";
import LanguageIcon from "@mui/icons-material/Language";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import DealsFilters from "../Main/NewDealsLifeCycle/DealsFilters";

type DealCardMeta = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type DealCardTag = {
  label: string;
  color?: string;
  bg?: string;
};

const formatDate = (value: any): string => {
  if (!value) return "TBA";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD MMM YYYY") : String(value);
};

const formatDealSize = (value: any): string => {
  if (value == null || value === "") return "TBA";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const millions = num / 1_000_000;
  return `$${millions.toFixed(1)}M`;
};

const formatPriceValue = (row: any): string => {
  if (row?.deal_type?.toString().toUpperCase() === "FO") {
    const price = Number(row?.issue_price);
    return Number.isNaN(price) ? "TBD" : `$${price.toFixed(2)}`;
  }
  if (row?.pricing_range_min != null && row?.pricing_range_max != null) {
    const min = Number(row.pricing_range_min);
    const max = Number(row.pricing_range_max);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      return `$${min.toFixed(0)} - $${max.toFixed(0)}`;
    }
  }
  if (row?.price_range) return String(row.price_range);
  return "TBD";
};

const DealCard: React.FC<{
  title: string;
  subtitle?: string;
  meta: DealCardMeta[];
  tags?: DealCardTag[];
}> = ({ title, subtitle, meta, tags }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid rgba(203,213,225,0.8)",
      background: "linear-gradient(180deg, #ffffff, #f7f9ff)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
      height: "100%",
    }}
  >
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1844" }}>
          {title}
        </Typography>
        {tags?.length ? (
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            {tags.map((tag) => (
              <Chip
                key={tag.label}
                label={tag.label}
                size="small"
                sx={{
                  bgcolor: tag.bg ?? "#eef2ff",
                  color: tag.color ?? "#1d4ed8",
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
      {subtitle ? (
        <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
          {subtitle}
        </Typography>
      ) : null}
      <Divider />
      <Grid container spacing={1.5}>
        {meta.map((item) => (
          <Grid item xs={12} sm={6} key={item.label}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "#e8edff",
                  display: "grid",
                  placeItems: "center",
                  color: "#1d4ed8",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontWeight: 600 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#0f172a" }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);

const NewDealsLifecycleCards: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOp, setSelectedOp] = useState<string>("upcoming");
  const [dealSearch, setDealSearch] = useState("");
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [selectedDealType, setSelectedDealType] = useState<"IPO" | "FO">("IPO");
  const [liveStartDate, setLiveStartDate] = useState<Dayjs | null>(() =>
    dayjs().subtract(30, "day")
  );
  const [liveEndDate, setLiveEndDate] = useState<Dayjs | null>(() => dayjs());
  const [selectedRegion, setSelectedRegion] = useState<
    "US" | "EMEA" | "APAC" | "Non-US America"
  >("US");

  const [pipelineData, setPipelineData] = useState<Record<string, any[]>>({
    fo: [],
    ipo_international: [],
    ipo_us: [],
    ipo_europe: [],
  });
  const [pipelineLoading, setPipelineLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const opMap: Record<string, string> = {
    live: "Issued September to Date",
    upcoming: "Upcoming Deals",
  };

  const tabs = [
    {
      value: "upcoming",
      label: "Upcoming Deals",
      helper: "Filed but not issued",
      icon: <EventAvailableIcon fontSize="small" sx={{ color: "inherit" }} />,
    },
    {
      value: "live",
      label: "Recently Listed Deals",
      helper: "Issued Deals",
      icon: <FlashOnIcon fontSize="small" sx={{ color: "inherit" }} />,
    },
    {
      value: "pipeline",
      label: "Future Pipeline",
      helper: "Not filed",
      icon: <RocketLaunchIcon fontSize="small" sx={{ color: "inherit" }} />,
    },
  ];

  const regionTabs = [
    { label: "US", value: "US", icon: <PublicIcon fontSize="small" /> },
    { label: "APAC", value: "APAC", icon: <LanguageIcon fontSize="small" /> },
    { label: "EMEA", value: "EMEA", icon: <TravelExploreIcon fontSize="small" /> },
    { label: "Others", value: "Non-US America", icon: <Diversity3Icon fontSize="small" /> },
  ] as const;

  const fetchData = async (operation: string, region: string, dealType: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ operation, region, deal_type: dealType }),
      });
      const result = await response.json();
      const payload = result?.data ?? result?.Data ?? [];
      const sectionKey = selectedOp === "live" ? "Live" : "Upcoming";
      const rowsSource = Array.isArray(payload)
        ? payload
        : Object.values(payload).flatMap((regionBucket: any) => {
            const section = regionBucket?.[sectionKey] ?? regionBucket;
            if (Array.isArray(section)) return section;
            if (section && typeof section === "object") return Object.values(section);
            return [];
          });
      const fieldOrder = [
        "ticker",
        "region",
        "sector",
        "issuer_name",
        "deal_size",
        "trade_date",
        "pricing_date",
        "deal_type",
        "fo_type",
        "issue_price",
        "price_range",
        "writeup_available",
        "deal_status",
        "t1d_pred",
      ];

      const formattedRows = rowsSource.flatMap((item: any, index: number) => {
        if (Array.isArray(item)) {
          const mapped: Record<string, any> = {};
          item.forEach((value, idx) => {
            const key = fieldOrder[idx];
            if (key) mapped[key] = value;
          });
          return [
            {
              id: `${mapped.ticker ?? "row"}-${index}`,
              ...mapped,
            },
          ];
        }

        if (item && typeof item === "object") {
          const numericKeys = Object.keys(item).filter((key) => /^\\d+$/.test(key));
          if (numericKeys.length > 0) {
            const numericValues = numericKeys
              .sort((a, b) => Number(a) - Number(b))
              .map((key) => (item as Record<string, any>)[key])
              .filter((value) => value !== undefined && value !== null);

            const objectValues = numericValues.filter(
              (value) => value && typeof value === "object" && !Array.isArray(value)
            );
            if (objectValues.length > 0) {
              return objectValues.map((rowItem: any, innerIndex: number) => ({
                id: `${rowItem?.ticker ?? "row"}-${index}-${innerIndex}`,
                ...rowItem,
              }));
            }

            const mapped: Record<string, any> = {};
            numericValues.forEach((value, idx) => {
              const key = fieldOrder[idx];
              if (key) mapped[key] = value;
            });
            return [
              {
                id: `${mapped.ticker ?? "row"}-${index}`,
                ...mapped,
              },
            ];
          }
        }

        return [
          {
            id: `${item?.ticker ?? "row"}-${index}`,
            ...item,
          },
        ];
      });

      setRows(formattedRows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPipeline = async () => {
    if (!apiUrl) return;
    setPipelineLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/pipeline_expected_deals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({}),
      });
      const json = await response.json();
      setPipelineData({
        fo: json?.fo ?? [],
        ipo_international: json?.ipo_international ?? [],
        ipo_us: json?.ipo_us ?? [],
        ipo_europe: json?.ipo_europe ?? [],
      });
    } catch (error) {
      console.error("Pipeline fetch failed", error);
    } finally {
      setPipelineLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOp === "pipeline") {
      fetchPipeline();
      return;
    }
    const apiOperation = opMap[selectedOp] || selectedOp;
    fetchData(apiOperation, selectedRegion, selectedDealType);
  }, [selectedOp, selectedRegion, selectedDealType]);

  useEffect(() => {
    if (selectedOp === "live") {
      setLiveStartDate(dayjs().subtract(30, "day"));
      setLiveEndDate(dayjs());
    }
  }, [selectedOp]);

  const isPipelineView = selectedOp === "pipeline";

  const headlineText = useMemo(() => {
    if (selectedOp === "live") {
      return "Track IPOs that have been issued or priced within the last 31 days, with real-time deal status and key market details.";
    }
    return "Track IPOs that have been filed but not yet issued, highlighting key issuer details, expected timelines, and deal readiness.";
  }, [selectedOp]);

  const filteredRows = useMemo(() => {
    const term = dealSearch.trim().toLowerCase();

    const nextRows = rows.filter((row) => {
      if (term && !row.ticker?.toString().toLowerCase().includes(term)) {
        return false;
      }

      if (selectedOp !== "pipeline") {
        const region = row.region != null ? String(row.region).trim().toUpperCase() : "";
        if (region) {
          if (selectedRegion === "US" && region !== "US") return false;
          if (selectedRegion === "APAC" && region !== "APAC") return false;
          if (selectedRegion === "EMEA" && region !== "EMEA") return false;
          if (selectedRegion === "Non-US America") {
            if (region !== "NON-US AMERICA" && region !== "LATAM") return false;
          }
        }
      }

      const dealType = row.deal_type?.toString().toUpperCase();
      if (dealType && dealType !== selectedDealType) {
        return false;
      }

      return true;
    });

    if (selectedOp === "live") {
      const start = liveStartDate?.startOf("day") ?? null;
      const end = liveEndDate?.endOf("day") ?? null;
      const inRange = (value: any) => {
        const parsed = dayjs(value);
        if (!parsed.isValid()) return false;
        if (start && parsed.isBefore(start)) return false;
        if (end && parsed.isAfter(end)) return false;
        return true;
      };
      return nextRows.filter((row) => inRange(row.pricing_date));
    }

    return nextRows;
  }, [
    rows,
    dealSearch,
    selectedRegion,
    selectedOp,
    selectedDealType,
    liveStartDate,
    liveEndDate,
  ]);

  const [upcomingDatedRows, upcomingTbaRows] = useMemo(() => {
    if (selectedOp !== "upcoming") return [filteredRows, []];
    const hasPricingDate = (value: any) => {
      if (!value) return false;
      const normalized = String(value).trim().toLowerCase();
      if (!normalized) return false;
      if (normalized === "tbd") return false;
      if (normalized === "to be announced") return false;
      if (normalized === "to be announce") return false;
      return true;
    };
    const withPricing = filteredRows.filter((row) => hasPricingDate(row.pricing_date));
    const tba = filteredRows.filter((row) => !hasPricingDate(row.pricing_date));
    return [withPricing, tba];
  }, [filteredRows, selectedOp]);

  const pipelineCategory = useMemo(() => {
    if (selectedRegion === "APAC" || selectedRegion === "Non-US America") {
      return "ipo_international";
    }
    if (selectedRegion === "EMEA") return "ipo_europe";
    return selectedDealType === "FO" ? "fo" : "ipo_us";
  }, [selectedRegion, selectedDealType]);

  const pipelineRows = useMemo(() => {
    const list = pipelineData[pipelineCategory] || [];
    const term = pipelineSearch.trim().toLowerCase();
    if (!term) return list;
    return list.filter((item: any) =>
      Object.values(item || {}).some((value) =>
        value?.toString().toLowerCase().includes(term)
      )
    );
  }, [pipelineData, pipelineCategory, pipelineSearch]);

  const buildCardTags = (row: any): DealCardTag[] => {
    const tags: DealCardTag[] = [];
    if (row?.deal_type) {
      tags.push({ label: String(row.deal_type).toUpperCase(), bg: "#e0f2fe", color: "#0b3d91" });
    }
    if (row?.deal_status) {
      tags.push({ label: String(row.deal_status), bg: "#ecfccb", color: "#3f6212" });
    }
    if (row?.writeup_available) {
      tags.push({
        label: row.writeup_available.toString().toLowerCase() === "yes" ? "Write-up Ready" : "No Write-up",
        bg: row.writeup_available.toString().toLowerCase() === "yes" ? "#dcfce7" : "#fee2e2",
        color: row.writeup_available.toString().toLowerCase() === "yes" ? "#166534" : "#991b1b",
      });
    }
    return tags;
  };

  const renderCards = (list: any[]) => (
    <Grid container spacing={2}>
      {list.map((row) => {
        const meta: DealCardMeta[] = [
          {
            label: "Pricing Date",
            value: formatDate(row.pricing_date),
            icon: <CalendarMonthOutlinedIcon fontSize="small" />,
          },
          {
            label: "Deal Size",
            value: formatDealSize(row.deal_size),
            icon: <PaidOutlinedIcon fontSize="small" />,
          },
          {
            label: "Price",
            value: formatPriceValue(row),
            icon: <LocalOfferOutlinedIcon fontSize="small" />,
          },
          {
            label: "Trade Date",
            value: formatDate(row.trade_date),
            icon: <EventAvailableIcon fontSize="small" />,
          },
        ];
        return (
          <Grid item xs={12} md={6} lg={4} key={row.id ?? `${row.ticker}-${row.pricing_date}`}>
            <DealCard
              title={row.ticker || "N/A"}
              subtitle={row.issuer_name || row.company_name || "Unknown issuer"}
              meta={meta}
              tags={[
                { label: row.region || "Region N/A", bg: "#f1f5f9", color: "#475569" },
                { label: row.sector || "Sector N/A", bg: "#f8fafc", color: "#334155" },
                ...buildCardTags(row),
              ]}
            />
          </Grid>
        );
      })}
    </Grid>
  );

  const renderPipelineCards = (list: any[]) => (
    <Grid container spacing={2}>
      {list.map((row: any, index: number) => {
        const title = row.ticker || row.company || "Pipeline Deal";
        const subtitle =
          row.company ||
          row.country ||
          row.region ||
          row.sectors ||
          row.sector ||
          "Pipeline Deal";
        const meta: DealCardMeta[] = [
          {
            label: "Expected Date",
            value: formatDate(row.expected_date || row.last_placement_date || row.lockup_date),
            icon: <CalendarMonthOutlinedIcon fontSize="small" />,
          },
          {
            label: "Size / Valuation",
            value: formatDealSize(
              row.size_m ||
                row.valuation_m ||
                row.sell_down_size_m ||
                row.implied_secondary_mkt_valuation_m
            ),
            icon: <PaidOutlinedIcon fontSize="small" />,
          },
          {
            label: "Sector",
            value: row.sectors || row.sector || "TBA",
            icon: <CategoryOutlinedIcon fontSize="small" />,
          },
          {
            label: "Region",
            value: row.country || row.region || selectedRegion,
            icon: <BusinessOutlinedIcon fontSize="small" />,
          },
        ];
        return (
          <Grid item xs={12} md={6} lg={4} key={row.id ?? `${title}-${index}`}>
            <DealCard
              title={title}
              subtitle={subtitle}
              meta={meta}
              tags={[
                { label: pipelineCategory.replace("_", " ").toUpperCase(), bg: "#eef2ff", color: "#1d4ed8" },
              ]}
            />
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 0, mb: 2, px: { xs: 1.5, md: 2 } }}>
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
            px: 1,
            gap: 1.25,
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            {regionTabs.map((item) => {
              const isSelected = selectedRegion === item.value;
              return (
                <Paper
                  key={item.value}
                  onClick={() => setSelectedRegion(item.value as any)}
                  sx={{
                    px: 2,
                    py: 0.6,
                    borderRadius: 999,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    border: isSelected ? "1px solid #2b146f" : "1px solid #d7ddea",
                    backgroundColor: isSelected ? "#2b146f" : "#ffffff",
                    color: isSelected ? "#ffffff" : "#1f2a44",
                    boxShadow: isSelected ? "0 8px 18px rgba(43,20,111,0.18)" : "none",
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    "&:hover": {
                      backgroundColor: isSelected ? "#24105f" : "#f6f8fc",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    {item.icon}
                    <Typography fontWeight={600} color="inherit">
                      {item.label}
                    </Typography>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Container>
      </Container>

      <Container
        maxWidth="xl"
        sx={{
          mb: 4,
          position: "relative",
          pb: 4,
          pt: 2,
          px: { xs: 1.5, md: 2 },
          backgroundColor: "rgba(21,101,192,0.05)",
          borderRadius: 3,
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 1, px: 0 }}>
          <Container
            maxWidth="xl"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
              px: 1,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Container maxWidth="xl" sx={{ flexGrow: 1, minWidth: { xs: "100%", md: "auto" } }}>
              <DealsFilters selectedOp={selectedOp} onChange={setSelectedOp} options={tabs} />
            </Container>
          </Container>

          <Container
            maxWidth="xl"
            sx={{
              mb: 1.5,
              px: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
              justifyContent: "space-between",
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            {!isPipelineView && (
              <ToggleButtonGroup
                value={selectedDealType}
                exclusive
                onChange={(_e, value) => value && setSelectedDealType(value)}
                sx={{
                  backgroundColor: "#f2f4f8",
                  p: 0.4,
                  borderRadius: 9999,
                  border: "1px solid #d7ddea",
                  display: "inline-flex",
                  gap: 0.5,
                  flexShrink: 0,
                  ml: "auto",
                  "& .MuiToggleButtonGroup-grouped": {
                    border: 0,
                  },
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    borderRadius: 9999,
                    border: 0,
                    px: 2,
                    py: 0.5,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "#6a7286",
                    backgroundColor: "transparent",
                    transition: "all 0.2s ease",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#2b146f",
                    color: "#ffffff",
                    boxShadow: "0 6px 14px rgba(43,20,111,0.2)",
                  },
                }}
              >
                <ToggleButton value="IPO">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography fontWeight={700} color="inherit">
                      IPO
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="FO">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography fontWeight={700} color="inherit">
                      FO
                    </Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {!isPipelineView && (
              <Typography
                sx={{
                  fontWeight: 400,
                  color: "#1f2a44",
                  lineHeight: 1.4,
                  textAlign: "left",
                  fontSize: { xs: "0.82rem", md: "0.88rem" },
                  whiteSpace: { xs: "normal", md: "nowrap" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flexGrow: 1,
                  mx: { xs: 0, md: 2 },
                }}
              >
                {headlineText}
              </Typography>
            )}

            {selectedOp === "live" && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <DatePicker
                    label="Start date"
                    value={liveStartDate}
                    format="DD-MM-YYYY"
                    onChange={(value) => {
                      setLiveStartDate(value);
                      if (value && liveEndDate && value.isAfter(liveEndDate)) {
                        setLiveEndDate(value);
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        placeholder: "dd-mm-yyyy",
                        sx: {
                          minWidth: 160,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 999,
                            height: 36,
                            backgroundColor: "#ffffff",
                          },
                        },
                      },
                    }}
                  />
                  <DatePicker
                    label="End date"
                    value={liveEndDate}
                    format="DD-MM-YYYY"
                    onChange={(value) => {
                      setLiveEndDate(value);
                      if (value && liveStartDate && value.isBefore(liveStartDate)) {
                        setLiveStartDate(value);
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        placeholder: "dd-mm-yyyy",
                        sx: {
                          minWidth: 160,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 999,
                            height: 36,
                            backgroundColor: "#ffffff",
                          },
                        },
                      },
                    }}
                  />
                </Stack>
              </LocalizationProvider>
            )}

            {!isPipelineView && (
              <TextField
                size="small"
                placeholder="Search"
                value={dealSearch}
                onChange={(e) => setDealSearch(e.target.value)}
                sx={{
                  minWidth: 220,
                  flexShrink: 0,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    height: 36,
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: "#cfd6e4",
                    },
                    "&:hover fieldset": {
                      borderColor: "#bfc7da",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#b0b9cf",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#8a94a8",
                    opacity: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#8a94a8" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: false }}
              />
            )}

            {isPipelineView && (
              <TextField
                size="small"
                placeholder="Search"
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
                sx={{
                  minWidth: 220,
                  flexShrink: 0,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    height: 36,
                    backgroundColor: "#ffffff",
                    "& fieldset": {
                      borderColor: "#cfd6e4",
                    },
                    "&:hover fieldset": {
                      borderColor: "#bfc7da",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#b0b9cf",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#8a94a8",
                    opacity: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#8a94a8" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: false }}
              />
            )}
          </Container>

          {isPipelineView ? (
            pipelineLoading ? (
              <CircularProgress sx={{ display: "block", mx: "auto" }} />
            ) : pipelineRows.length === 0 ? (
              <Container
                sx={{
                  px: 2,
                  py: 4,
                  borderRadius: 2,
                  border: "1px dashed #cbd5e1",
                  backgroundColor: "#ffffff",
                  textAlign: "center",
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#002060" }}>
                  No pipeline deals available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are no pipeline deals for this filter selection.
                </Typography>
              </Container>
            ) : (
              renderPipelineCards(pipelineRows)
            )
          ) : loading ? (
            <CircularProgress sx={{ display: "block", mx: "auto" }} />
          ) : selectedOp === "upcoming" ? (
            <Grid container spacing={2} sx={{ px: 1 }}>
              <Grid item xs={12}>
                <Container sx={{ px: 0, mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1f2a44" }} align="center">
                    Upcoming Deals (Pricing Range Available) - {selectedDealType}
                  </Typography>
                </Container>
                {upcomingDatedRows.length > 0 ? (
                  renderCards(upcomingDatedRows)
                ) : (
                  <Container
                    sx={{
                      px: 2,
                      py: 3,
                      borderRadius: 2,
                      border: "1px dashed #cbd5e1",
                      backgroundColor: "#ffffff",
                      textAlign: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: "#002060" }}>
                      No deals available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no upcoming deals with pricing dates for this filter.
                    </Typography>
                  </Container>
                )}
              </Grid>
              <Grid item xs={12}>
                <Container sx={{ px: 0, mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1f2a44" }} align="center">
                    Upcoming Deals (To Be Announced) - {selectedDealType}
                  </Typography>
                </Container>
                {upcomingTbaRows.length > 0 ? (
                  renderCards(upcomingTbaRows)
                ) : (
                  <Container
                    sx={{
                      px: 2,
                      py: 3,
                      borderRadius: 2,
                      border: "1px dashed #cbd5e1",
                      backgroundColor: "#ffffff",
                      textAlign: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: "#002060" }}>
                      No deals available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no to-be-announced deals for this filter.
                    </Typography>
                  </Container>
                )}
              </Grid>
            </Grid>
          ) : filteredRows.length === 0 ? (
            <Container
              sx={{
                px: 2,
                py: 4,
                borderRadius: 2,
                border: "1px dashed #cbd5e1",
                backgroundColor: "#ffffff",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontWeight: 600, color: "#002060" }}>
                No deals available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no deals for this filter selection.
              </Typography>
            </Container>
          ) : (
            renderCards(filteredRows)
          )}
        </Container>
      </Container>
    </>
  );
};

const NewDashboardLifeCycleMain: React.FC = () => {
  return (
    <>
      <Box
        sx={{
          backgroundColor: "#0b2a6b",
          color: "#fff",
          py: 1.2,
          textAlign: "center",
          mb: 3,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: 0.2 }}>
          Welcome to New Dashboard Life Cycle!
        </Typography>
      </Box>
      <NewDealsLifecycleCards />
    </>
  );
};

export default NewDashboardLifeCycleMain;
