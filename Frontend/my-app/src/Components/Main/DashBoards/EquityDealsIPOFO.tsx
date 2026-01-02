import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import FoPredictionCards from "./Equity/FoPredictionCards";
import MddIpoOpportunityChart from "./Equity/MddIpoOpportunityChart";
import MddFoDealsOpportunityChart from "./Equity/MddFoDealsOpportunityChart";
import {
  Box,
  Paper,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

// Motion Wrapper
const MotionPaper = motion(Paper);

// Years for selection
const EquityDealsIPOFO: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"IPO" | "FO">("IPO");
  const [selectedIpoYears, setSelectedIpoYears] = useState<number[]>([
    2024, 2025,
  ]);
  const [selectedFoYears, setSelectedFoYears] = useState<number[]>([
    2024, 2025,
  ]);
  const [navValue, setNavValue] = useState<number>(6);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<{ ticker_symbol: string; issuer_name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleYearToggle = (year: number, isIPO: boolean) => {
    const setSelectedYears = isIPO ? setSelectedIpoYears : setSelectedFoYears;

    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.length === 1
          ? prev
          : prev.filter((y) => y !== year)
        : [...prev, year]
    );
  };

  const handleExportPDF = async (
    sectionId: string,
    years: number[],
    filePrefix: string
  ) => {
    const input = document.getElementById(sectionId);
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1122, 793],
    });

    const margin = 40;
    const availableWidth = 1122 - margin * 2;
    const availableHeight = 793 - margin * 2;
    const aspectRatio = canvas.width / canvas.height;

    let imgWidth = availableWidth;
    let imgHeight = imgWidth / aspectRatio;
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * aspectRatio;
    }

    const x = margin + (availableWidth - imgWidth) / 2;
    const y = margin + (availableHeight - imgHeight) / 2;

    pdf.addImage(canvas, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(`${filePrefix}_Region_Wise_${years.join("_")}.pdf`);
  };

  useEffect(() => {
    setNavValue(6); // ensure Past IPOs & FOs stays highlighted
  }, []);

  const handleNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setNavValue(newValue);
    const tabPaths = [
      "", // search stays here
      "/opportunity/equity/deal-stats",
      "/opportunity/equity/skew-table",
      "/opportunity/equity/mdd_deal_stats",
      "/opportunity/equity/gap-analysis",
      "/opportunity/equity/weekly-tracking",
      "/opportunity/pastdeals",
    ];
    if (newValue === 0) return;
    navigate(tabPaths[newValue]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderHeader = (years: number[], isIPO: boolean) => (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Year(s):
      </Typography>
      {[2024, 2025].map((year) => (
        <FormControlLabel
          key={year}
          control={
            <Checkbox
              checked={years.includes(year)}
              onChange={() => handleYearToggle(year, isIPO)}
            />
          }
          label={year.toString()}
        />
      ))}
      <Button
        variant="contained"
        onClick={() =>
          handleExportPDF(
            isIPO ? "ipo-table-section" : "fo-table-section",
            years,
            isIPO ? "IPO_Table" : "FO_Table"
          )
        }
        sx={{
          backgroundColor: "#002060",
          color: "#fff",
          textTransform: "none",
          px: 2.5,
          py: 1,
        }}
      >
        Export to PDF
      </Button>
    </Box>
  );

  return (
    <Box maxWidth="1800px" mx="auto" px={2} py={3}>
      <Tabs
        value={navValue}
        onChange={handleNavChange}
        centered
        TabIndicatorProps={{
          style: { display: "none" },
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          margin: "10px 0",
          "& .MuiTab-root": {
            backgroundColor: "#E3E6F0",
            color: "#002060",
            borderRadius: "12px",
            padding: "10px 20px",
            fontSize: "0.9rem",
            maxHeight: "50px",
            fontWeight: "600",
            margin: "0 5px",
            textTransform: "none",
            transition:
              "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#DCE6F0",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            },
          },
          "& .Mui-selected": {
            backgroundColor: "#FF8C00",
            color: "#ffffff !important",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <Tab
          sx={{
            backgroundColor: navValue === 0 ? "#dce6f0" : "#f5f5f5",
            color: navValue === 0 ? "#fff" : "#777",
            "&.Mui-selected": { backgroundColor: "#dce6f0", color: "#fff" },
          }}
          label={
            <TextField
              label=""
              variant="outlined"
              value={searchTerm}
              autoComplete="off"
              onChange={handleSearchChange}
              placeholder="Enter ticker..."
              sx={{
                marginBottom: "1px",
                width: "200px",
                height: "40px",
                borderRadius: "32px",
                backgroundColor: "#f4f6f9",
              }}
              InputProps={{
                sx: {
                  borderRadius: "42px",
                  width: "200px",
                  height: "40px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#002060",
                  },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#656565" }} />
                  </InputAdornment>
                ),
              }}
            />
          }
        />
        <Tab label="Deal Stats From Dealogic" />
        <Tab label="Skew Table" />
        <Tab label="Monashee Transactions" />
        <Tab label="GAP Analysis" />
        <Tab label="Weekly Tracking" />
        <Tab label="Past IPOs & FOs" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        searchTerm.length > 0 && (
          <Box sx={{ marginBottom: "20px", display: "flex", marginLeft: "240px" }}>
            <Paper
              elevation={6}
              style={{
                padding: "10px",
                maxWidth: "280px",
                maxHeight: "300px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
              }}
            >
              {results.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center">
                  No results found.
                </Typography>
              ) : (
                <List>
                  {results.map((item, index) => (
                    <ListItem
                      key={index}
                      style={{
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                    >
                      <ListItemText
                        primary={<strong>{item.ticker_symbol}</strong>}
                        secondary={item.issuer_name}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        )
      )}

      {/* Toggle Tabs */}
      <Box display="flex" justifyContent="center" mb={3}>
        <Stack direction="row" spacing={2}>
          {["IPO", "FO"].map((label) => (
            <Paper
              key={label}
              elevation={selectedTab === label ? 4 : 1}
              onClick={() => setSelectedTab(label as "IPO" | "FO")}
              sx={{
                px: 3,
                py: 1,
                cursor: "pointer",
                backgroundColor: selectedTab === label ? "#1565c0" : "#e3f2fd",
                color: selectedTab === label ? "#fff" : "#000",
              }}
            >
              {label}
            </Paper>
          ))}
        </Stack>
      </Box>

      {selectedTab === "IPO" && (
        <>


          <MotionPaper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            {renderHeader(selectedIpoYears, true)}
            <MddIpoOpportunityChart
              selectedYears={selectedIpoYears}
              selectedTab="IPO"
            />
          </MotionPaper>
        </>
      )}

      {selectedTab === "FO" && (
        <>
          <MotionPaper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#002060", fontWeight: 400, mb: 2 }}
              textAlign="center"
            >
              Stay informed with data-driven FO deal insights and predictions.
            </Typography>
            <FoPredictionCards />
          </MotionPaper>

          <MotionPaper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            {renderHeader(selectedFoYears, false)}
            <MddFoDealsOpportunityChart
              selectedYears={selectedFoYears}
              selectedTab="FO"
            />
          </MotionPaper>
        </>
      )}
    </Box>
  );
};

export default EquityDealsIPOFO;
