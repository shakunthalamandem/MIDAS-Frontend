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
  TextField,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import IPODashboardHeader from "./IPODashboardHeader";
import IPODashboardCardRatings from "./IPODashboardCardRatings";
import FinancialForecastTable from "./IPOFinancialTableMain";
import IPODashboardMainTable from "./IPODashboardMainTable";
import { cardColors, cardSections, cardStyle } from "./UtilsIPODashboard";


const getOrdinalSuffix = (n: number): string => {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
};

const IPODashboardMain: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const [ipoData, setIpoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [allIpoTickers, setAllIpoTickers] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(
    ticker || "CRWV"
  );
  const [comparativeNotes, setComparativeNotes] = useState<string>("");
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllIpoTickers = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const savedTicker = localStorage.getItem("selected_ticker");
        setSelectedTicker(savedTicker || "CRWV");
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

        const dateFields = ["pricing_date", "filed_date", "term_date", "trade_date"];
        const formattedData = { ...jsonData };
        dateFields.forEach(field => {
          if (formattedData[field]) {
            formattedData[field] = formatDate(formattedData[field]);
          }
        });

        setIpoData(formattedData);
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

  const handleSaveNotes = () => {
    // Save to localStorage (replace with API call if needed)
    localStorage.setItem(`comparativeNotes_${selectedTicker}`, comparativeNotes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 1500);
  };

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
                  <FinancialForecastTable
                    defaultTicker={selectedTicker || "CRWV"}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                  <IPODashboardMainTable ticker={selectedTicker || "CRWV"}/>
                </Box>
              </Grid>
<Grid item xs={12}>
  <Box
    sx={{
      p: 3,
      backgroundColor: "#e3f0ff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 2,
      boxShadow: 3,
    }}
  >


   <TextField
  multiline
  minRows={6}
  maxRows={12}
  value={comparativeNotes}
  onChange={(e) => setComparativeNotes(e.target.value)}
  placeholder="Add your points here.."
  variant="outlined"
  sx={{ mt: 2, width: "80%" }} // Adjust width here, e.g., 80% or 500px
/>

    <Box
      sx={{
        mt: "auto",
        display: "flex",
        justifyContent: "center",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        pt: 2,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveNotes}
        sx={{ minWidth: 100 }}
      >
        Save
      </Button>
      {notesSaved && (
        <Typography color="success.main" sx={{ textAlign: "center" }}>
          Saved!
        </Typography>
      )}
    </Box>
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
