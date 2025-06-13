import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Container,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import IPODashboardHeader from "./IPODashboardHeader";
import IPODashboardCardRatings from "./IPODashboardCardRatings";
import FinancialForecastTable from "./IPOFinancialTableMain";
import IPODashboardMainTable from "./IPODashboardMainTable";
import { cardColors, cardSections, cardStyle } from "./UtilsIPODashboard";

const IPODashboardMain: React.FC = () => {
  const [ipoData, setIpoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [allIpoTickers, setAllIpoTickers] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>("CRWV");

  useEffect(() => {
    const fetchAllIpoTickers = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl) throw new Error("API URL not defined");

        const response = await fetch(`${apiUrl}/api/ipo_dashboard_tickers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch IPO tickers");
        const data = await response.json();
        setAllIpoTickers(data.distinct_tickers || []);
      } catch (err) {
        console.error("Ticker fetch failed", err);
      }
    };

    fetchAllIpoTickers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl) throw new Error("API URL not defined");

        const response = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: selectedTicker || "CRWV" }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP error!`);
        }

        const jsonData = await response.json();
        setIpoData(jsonData);
      } catch (err: any) {
        console.error("IPO data fetch failed", err);
        setError("Failed to fetch IPO data");
      } finally {
        setLoading(false);
      }
    };

    if (selectedTicker) fetchData();
  }, [selectedTicker]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ px: 2 }}>
      {ipoData && (
        <>
          <IPODashboardHeader
            ipoData={ipoData}
            allIpoTickers={allIpoTickers}
            selectedTicker={selectedTicker}
            searchText={searchText}
            setSelectedTicker={setSelectedTicker}
            setSearchText={setSearchText}
          />

          <IPODashboardCardRatings ipodata={ipoData} />

          <Container maxWidth="xl" sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {cardSections.map((section, index) => {
                const content = ipoData[section.key];

                if (section.key === "concerns") {
                  return (
                    <React.Fragment key={section.key}>
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            backgroundColor:
                              cardColors[index % cardColors.length],
                            borderRadius: 2,
                            boxShadow: 3,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <CardContent sx={{ overflowY: "auto", flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#002060",
                                mb: 1,
                                fontWeight: "bold",
                              }}
                              align="center"
                            >
                              {section.title}
                            </Typography>
                            <List dense>
                              {content?.map((item: string, idx: number) => (
                                <ListItem key={idx} sx={{ pl: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 24, mt: "5px" }}>
                                    <FiberManualRecordIcon
                                      sx={{ fontSize: 8, color: "#002060" }}
                                    />
                                  </ListItemIcon>
                                  <ListItemText primary={item} />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                          <FinancialForecastTable
                            defaultTicker={selectedTicker || "CRWV"}
                          />
                        </Box>
                      </Grid>
                    </React.Fragment>
                  );
                }

                return (
                  <Grid item xs={12} md={6} key={section.key}>
                    <Card
                      sx={{
                        backgroundColor: cardColors[index % cardColors.length],
                        borderRadius: 2,
                        boxShadow: 3,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardContent sx={{ overflowY: "auto", flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ color: "#002060", mb: 1, fontWeight: "bold" }}
                          align="center"
                        >
                          {section.title}
                        </Typography>
                        <List dense>
                          {content?.map((item: string, idx: number) => (
                            <ListItem key={idx} sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 24, mt: "5px" }}>
                                <FiberManualRecordIcon
                                  sx={{ fontSize: 8, color: "#002060" }}
                                />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}

              <Grid item xs={12}>
                <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                  <IPODashboardMainTable />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </>
      )}
    </Box>
  );
};

export default IPODashboardMain;
