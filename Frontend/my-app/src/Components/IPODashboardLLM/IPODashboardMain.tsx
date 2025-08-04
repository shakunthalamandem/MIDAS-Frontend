import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

import IPODashboardHeader from "./IPODashboardHeader";
import IPODashboardCardRatings from "./IPODashboardCardRatings";
import FinancialForecastTable from "./IPOFinancialTableMain";
import IPODashboardMainTable from "./IPODashboardMainTable";
import { cardColors, cardSections, cardStyle } from "./UtilsIPODashboard";
import IPOAITickersMain from "./Hooks/IPOAITickersMain";

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
  const [selectedTicker, setSelectedTicker] = useState<string | null>(ticker || "");
  const [pdfLoading, setPdfLoading] = useState(false);

  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string[]>>({});
    const [showAIComparison, setShowAIComparison] = useState(false);

 

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  useEffect(() => {
    const fetchAllIpoTickers = async () => {
      try {
        const savedTicker = localStorage.getItem("selected_ticker");
        setSelectedTicker(savedTicker || "");
        const response = await fetch(`${apiUrl}/api/ipo_dashboard_tickers/`, {
          headers: getAuthHeaders(),
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
 const handleAIComparisonClick = () => {
    setShowAIComparison(true);
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ ticker: selectedTicker || "" }),
        });

        if (!response.ok) throw new Error("Failed to fetch IPO data");
        const jsonData = await response.json();

        const dateFields = ["pricing_date", "filed_date", "term_date", "trade_date"];
        const formattedData = { ...jsonData };
        dateFields.forEach((field) => {
          if (formattedData[field]) {
            formattedData[field] = formatDate(formattedData[field]);
          }
        });

        const keys = [
          "business_overview",
          "key_highlights",
          "strengths",
          "concerns",
          "principal_stockholders_preipo",
          "key_management_personnel"
        ];

        const editModes: Record<string, boolean> = {};
        const contents: Record<string, string[]> = {};
        keys.forEach((key) => {
          editModes[key] = false;
          const fieldValue = formattedData[key];
          if (typeof fieldValue === "string") {
            contents[key] = fieldValue
              .split("\n")
              .map((line: string) => line.replace(/^•\s*/, "").trim())
              .filter(Boolean);
          } else {
            contents[key] = Array.isArray(fieldValue) ? fieldValue : [];
          }
        });

        setEditMode(editModes);
        setEditedContent(contents);
        setIpoData(formattedData);
      } catch (err) {
        console.error("IPO data fetch failed", err);
        setError("Failed to fetch IPO data");
      } finally {
        setLoading(false);
      }
    };

    if (selectedTicker) fetchData();
  }, [selectedTicker]);


  const handleSaveCard = async (key: string) => {
    try {
      const cleaned = editedContent[key].filter((item) => item.trim() !== "");
      const formatted = cleaned.map((item) => `• ${item}`).join("\n");
      const payload = { ticker_name: selectedTicker, [key]: formatted };
      await axios.patch(`${apiUrl}/api/writeup_data/`, payload, { headers: getAuthHeaders() });

      setIpoData((prev: any) => ({ ...prev, [key]: cleaned }));
      setEditMode((prev) => ({ ...prev, [key]: false }));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

   const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const pageElements = [
        document.getElementById("ipo-dashboard-page1"),
        document.getElementById("ipo-dashboard-page2"),
        document.getElementById("ipo-dashboard-page3"),
      ];

      if (!pageElements.every(el => el !== null)) {
        setPdfLoading(false);
        return;
      }

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < pageElements.length; i++) {
        const element = pageElements[i];
        if (!element) continue;

        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.padding = "0";
        clone.style.margin = "0";
        clone.style.width = "100%";
        clone.style.maxWidth = "100%";
        clone.style.background = "#fff";

        const tables = clone.querySelectorAll("table");
        tables.forEach(table => {
          const tableElement = table as HTMLElement;
          tableElement.style.fontSize = "10px";
          tableElement.style.width = "100%";
          tableElement.style.tableLayout = "fixed";
          const cells = tableElement.querySelectorAll("th, td");
          cells.forEach(cell => {
            const cellElement = cell as HTMLElement;
            cellElement.style.fontSize = "8px";
            cellElement.style.padding = "2px";
            cellElement.style.wordWrap = "break-word";
            cellElement.style.overflow = "hidden";
          });
        });

        const wrapper = document.createElement("div");
        wrapper.style.position = "fixed";
        wrapper.style.top = "-10000px";
        wrapper.style.left = "0";
        wrapper.style.width = "1200px";
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: "#fff",
        });

        document.body.removeChild(wrapper);

        const imgHeight = canvas.height;
        const imgWidth = canvas.width;

        const ratio = pageWidth / imgWidth;
        const scaledHeight = imgHeight * ratio;

        let position = 0;
        let pageCount = 0;

        while (position < scaledHeight) {
          const canvasSlice = document.createElement("canvas");
          const context = canvasSlice.getContext("2d")!;
          const sliceHeight = Math.min(imgHeight - pageCount * (pageHeight / ratio), pageHeight / ratio);
          canvasSlice.width = imgWidth;
          canvasSlice.height = sliceHeight;

          context.drawImage(
            canvas,
            0,
            pageCount * (pageHeight / ratio),
            imgWidth,
            sliceHeight,
            0,
            0,
            imgWidth,
            sliceHeight
          );

          const imgData = canvasSlice.toDataURL("image/png");
          if (i > 0 || pageCount > 0) pdf.addPage();

          pdf.addImage(
            imgData,
            "PNG",
            margin,
            margin,
            pageWidth - margin * 2,
            sliceHeight * ratio - 2
          );

          position += pageHeight;
          pageCount++;
        }
      }

      pdf.save(`IPO-Dashboard-${selectedTicker}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setPdfLoading(false);
    }
  };



  const handleCancelCard = (key: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [key]: ipoData[key] || [],
    }));
    setEditMode((prev) => ({ ...prev, [key]: false }));
  };

  const handleAddItem = (key: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
  };

  const handleDeleteItem = (key: string, index: number) => {
    setEditedContent((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (key: string, index: number, value: string) => {
    const updated = [...editedContent[key]];
    updated[index] = value;
    setEditedContent((prev) => ({ ...prev, [key]: updated }));
  };

  const renderEditableCard = (section: any, index: number) => {
    const key = section.key;
    const content = ipoData[key];
    const isEditing = editMode[key];

    return (
      <Grid item xs={12} md={6} key={key}>
        <Card sx={{
          backgroundColor: cardColors[index % cardColors.length],
          borderRadius: 2,
          boxShadow: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}>
          <CardContent sx={{ overflowY: "auto", flex: 1 }}>
<Box position="relative" mb={1} display="flex" justifyContent="center" alignItems="center">
  <Typography variant="h6" sx={{ color: "#002060", fontWeight: "bold" }}>
    {section.title}
  </Typography>

  <Box position="absolute" right={0}>
    {isEditing ? (
      <>
        <IconButton color="primary" onClick={() => handleSaveCard(key)} size="small">
          <SaveIcon />
        </IconButton>
        <IconButton color="secondary" onClick={() => handleCancelCard(key)} size="small">
          <CancelIcon />
        </IconButton>
      </>
    ) : (
      <IconButton onClick={() => setEditMode((prev) => ({ ...prev, [key]: true }))} size="small">
        <EditIcon />
      </IconButton>
    )}
  </Box>
</Box>

            {isEditing ? (
              <Box>
                {editedContent[key]?.map((item, idx) => (
                  <Box key={idx} display="flex" alignItems="flex-start" mb={1}>
                    <Box sx={{ mr: 1, mt: 1 }}>
                      <FiberManualRecordIcon sx={{ fontSize: 8, color: "#002060" }} />
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      size="small"
                      value={item}
                      onChange={(e) => handleItemChange(key, idx, e.target.value)}
                      placeholder="Enter text..."
                      sx={{ mr: 1 }}
                    />
                    <IconButton color="error" onClick={() => handleDeleteItem(key, idx)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button startIcon={<AddIcon />} onClick={() => handleAddItem(key)} variant="outlined" size="small" sx={{ mt: 1 }}>
                  Add Item
                </Button>
              </Box>
            ) : (
              <List dense>
                {content?.map((item: string, idx: number) => (
                  <ListItem key={idx} sx={{ pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24, mt: "5px" }}>
                      <FiberManualRecordIcon sx={{ fontSize: 8, color: "#002060" }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "40px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to detailed Insights on IPO - {selectedTicker}
      </Typography>
      

      <Box sx={{ px: 2 }}>
        {ipoData && (
          <>
            <div id="ipo-dashboard-page1">
              <IPODashboardHeader
                ipoData={ipoData}
                allIpoTickers={allIpoTickers}
                selectedTicker={selectedTicker}
                searchText={searchText}
                setSelectedTicker={setSelectedTicker}
                setSearchText={setSearchText}
                onExportPDF={handleExportPDF}
                pdfLoading={pdfLoading}
              />
<IPODashboardCardRatings
  ipodata={ipoData}
  selectedTicker={selectedTicker || ""}
  setIpoData={setIpoData}
/>
            </div>

            <div id="ipo-dashboard-page2">
              <Container maxWidth="xl" sx={{ mb: 3 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {cardSections.slice(0, 4).map((section, index) => renderEditableCard(section, index))}
                </Grid>
              </Container>
            </div>

            <div id="ipo-dashboard-page3">
              <Container maxWidth="xl" sx={{ mb: 3 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {cardSections.slice(4, 6).map((section, index) => renderEditableCard(section, index + 4))}
                  <Grid item xs={12}>
                    <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                      <FinancialForecastTable defaultTicker={selectedTicker || ""} />
                    </Box>
                  </Grid>
                   <Grid item xs={12}>
      <Box sx={{ backgroundColor: "#f4f5f7", p: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAIComparisonClick}
          sx={{ mb: 2 }}
        >
          AI Comparison
        </Button>
        <Typography variant="body1" gutterBottom color="#02517e">
        AI Suggested Comparable Tickers
      </Typography>

        {showAIComparison && (
          <IPOAITickersMain selectedData={ipoData} />
        )}
      </Box>
    </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                      <IPODashboardMainTable ticker={selectedTicker || ""} />
                    </Box>
                    <Typography sx={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'gray' }}>
                      Source: Factset
                    </Typography>
                  </Grid>
                </Grid>
              </Container>
            </div>
          </>
        )}
      </Box>
    </>
  );
};

export default IPODashboardMain;
