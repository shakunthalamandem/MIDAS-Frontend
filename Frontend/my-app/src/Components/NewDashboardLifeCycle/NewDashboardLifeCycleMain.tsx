import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PublicIcon from "@mui/icons-material/Public";
import LanguageIcon from "@mui/icons-material/Language";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import dayjs, { Dayjs } from "dayjs";
import DealCard, { DealCardMeta } from "./NewDashboardLifeCycleCard";
import RegionTabs from "./NewDashboardLifeCycleRegionTabs";
import FiltersBar from "./NewDashboardLifeCycleFiltersBar";
import NewDashboardLifeCycleTableView from "./NewDashboardLifeCycleTableView";
import DealsTable from "../Main/NewDealsLifeCycle/DealsTable";
import {
  buildCardTags,
  formatDate,
  formatDealSize,
  formatPriceValue,
} from "./NewDashboardLifeCycleUtils";

const NewDealsLifecycleCards: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOp, setSelectedOp] = useState<string>("upcoming");
  const [dealSearch, setDealSearch] = useState("");
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [selectedDealType, setSelectedDealType] = useState<"IPO" | "FO">("IPO");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
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
    live: "Issued",
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

  const handleRowNavigate = (row: any, extraState?: Record<string, any>) => {
    navigate("/deals/new_dashboard/details", {
      state: { payload: row, ...(extraState || {}) },
    });
  };

  const renderDealsList = (list: any[]) =>
    viewMode === "table" ? (
      <DealsTable
        rows={list}
        loading={loading}
        onRowSelect={(row) => handleRowNavigate(row)}
        selectedOp={selectedOp}
        showAllColumns
        hideFoTypeColumn={selectedDealType === "IPO"}
      />
    ) : (
      renderCards(list)
    );

  const renderPipelineList = (list: any[]) =>
    viewMode === "table" ? (
      <NewDashboardLifeCycleTableView
        rows={list}
        mode="pipeline"
        selectedRegion={selectedRegion}
        onRowClick={(row) => handleRowNavigate(row, { pipelineCategory })}
      />
    ) : (
      renderPipelineCards(list)
    );

  const renderCards = (list: any[]) => (
    <Box
      sx={{
        maxHeight: list.length > 9 ? 500 : "none",
        overflowY: list.length > 9 ? "auto" : "visible",
        pr: list.length > 9 ? 0.5 : 0,
      }}
    >
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
              label: "Price Range",
              value: formatPriceValue(row),
              icon: <LocalOfferOutlinedIcon fontSize="small" />,
            },
            {
              label: "First Trade Date",
              value: formatDate(row.trade_date),
              icon: <EventAvailableIcon fontSize="small" />,
            },
          ];
          const allTags = buildCardTags(row);
          const writeupTag = allTags.find((tag) =>
            tag.label.toLowerCase().includes("write-up")
          );
          const displayTags = allTags.filter((tag) => {
            const label = tag.label.toLowerCase();
            return !label.includes("write-up") && !label.includes("price range");
          });
          return (
            <Grid
              item
              xs={12}
              md={4}
              lg={3}
              key={row.id ?? `${row.ticker}-${row.pricing_date}`}
            >
            <DealCard
              title={row.ticker || "N/A"}
              subtitle={row.issuer_name || row.company_name || "Unknown issuer"}
              secondaryTag={writeupTag}
              meta={meta}
              tags={[
                { label: row.region || "Region N/A", bg: "#e6efff", color: "#1e3a8a" },
                { label: row.sector || "Sector N/A", bg: "#e6efff", color: "#1e3a8a" },
                ...displayTags,
              ]}
              onViewDetails={() =>
                navigate("/deals/new_dashboard/details", {
                  state: { payload: row },
                })
              }
            />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderPipelineCards = (list: any[]) => (
    <Box
      sx={{
        maxHeight: list.length > 9 ? 500 : "none",
        overflowY: list.length > 9 ? "auto" : "visible",
        pr: list.length > 9 ? 0.5 : 0,
      }}
    >
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
            <Grid item xs={12} md={4} lg={3} key={row.id ?? `${title}-${index}`}>
              <DealCard
                title={title}
                subtitle={subtitle}
                meta={meta}
                tags={[
                  {
                    label: pipelineCategory.replace("_", " ").toUpperCase(),
                    bg: "#eef2ff",
                    color: "#1d4ed8",
                  },
                ]}
                onViewDetails={() =>
                  navigate("/deals/new_dashboard/details", {
                    state: { payload: row, pipelineCategory },
                  })
                }
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 0, mb: 2, px: { xs: 1.5, md: 2 } }}>
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            mb: 1.5,
            px: 1,
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />
          <RegionTabs
            tabs={regionTabs}
            selectedRegion={selectedRegion}
            onSelect={(value) => setSelectedRegion(value as any)}
          />
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ ml: "auto", width: { xs: "100%", md: "auto" }, flex: 1, justifyContent: "flex-end" }}
          >
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_e, value) => value && setViewMode(value)}
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 999,
                border: "1px solid #d7ddea",
                ml: { md: "auto" },
                "& .MuiToggleButton-root": {
                  border: 0,
                  px: 1,
                  py: 0.4,
                  minWidth: 72,
                  color: "#6a7286",
                  textTransform: "none",
                  fontWeight: 600,
                },
                "& .Mui-selected": {
                  color: "#f5f5f5ff",
                  backgroundColor: "#002060",
                },
              }}
            >
              <ToggleButton value="card" aria-label="Card view">
                Card View
              </ToggleButton>
              <ToggleButton value="table" aria-label="Table view">
                Table View
              </ToggleButton>
            </ToggleButtonGroup>
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
          backgroundColor: "transparent",
          borderRadius: 0,
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 1, px: 0 }}>
          <FiltersBar
            tabs={tabs}
            selectedOp={selectedOp}
            onSelectOp={setSelectedOp}
            selectedDealType={selectedDealType}
            onSelectDealType={setSelectedDealType}
            isPipelineView={isPipelineView}
            liveStartDate={liveStartDate}
            liveEndDate={liveEndDate}
            setLiveStartDate={setLiveStartDate}
            setLiveEndDate={setLiveEndDate}
            dealSearch={dealSearch}
            setDealSearch={setDealSearch}
            pipelineSearch={pipelineSearch}
            setPipelineSearch={setPipelineSearch}
          />

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
              renderPipelineList(pipelineRows)
            )
          ) : loading ? (
            <CircularProgress sx={{ display: "block", mx: "auto" }} />
          ) : selectedOp === "upcoming" ? (
            <Grid container spacing={2} sx={{ px: 1 }}>
              <Grid item xs={12}>
                <Container sx={{ px: 0, mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#002060" }} align="center">
                    Upcoming {selectedRegion} {selectedDealType}  Deals Pricing Date Available (Not Yet Listed)
                  </Typography>
                </Container>
                {upcomingDatedRows.length > 0 ? (
                  renderDealsList(upcomingDatedRows)
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
                  <Typography sx={{ fontWeight: 600, color: "#002060" }} align="center">
                    Upcoming {selectedRegion} {selectedDealType} Deals Pricing Date Not Available (Not Yet Listed)
                  </Typography>
                </Container>
                {upcomingTbaRows.length > 0 ? (
                  renderDealsList(upcomingTbaRows)
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
            renderDealsList(filteredRows)
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
