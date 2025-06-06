import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CryptoReportCardVideo from "../../../Assets/videos/CryptoReportCard.mp4";
import bgimage from "../../../Assets/images/bgimage.jpg";
import gapimage from "../../../Assets/images/gapimgae.jpg"

interface GapReport {
  id: number;
  title: string;
  date: string;
  gap_analysis: string;
}

const GapAnalysisWriteups = () => {
  const [data, setData] = useState<GapReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/writeup_gap_analysis/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const responseData = await response.json();

        if (Array.isArray(responseData)) {
          setData(responseData);
        } else if (Array.isArray(responseData.data)) {
          setData(responseData.data);
        } else {
          setData([]);
          console.warn("Unexpected response data format");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  return (
    <Container>
      <Box padding={2}>
        <Typography
          variant="h6"
          mb={3}
          color="#780000"
          fontWeight="bold"
          align="center"
        >
          Gap Analysis Writeups
        </Typography>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : data.length === 0 ? (
          <Typography align="center">No reports to show.</Typography>
        ) : (
          <Grid container spacing={3}>
            {data.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card
                  sx={{
                    height: "250px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                    padding: 2,
                    marginBottom: "16px",
                    boxShadow: "0 4px 8px 0 #C6F5E4, 0 6px 20px 0 #C6F5E4",
                  }}
                >
                  <img
                    src={gapimage}
                    alt=""
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      zIndex: 0, // Ensures the image is behind the content
                    }}
                  />

                  <CardActionArea
                    onClick={() => window.open(report.gap_analysis, "_blank")}
                    sx={{ position: "relative", zIndex: 1 }}
                  >
                    <CardContent>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        {report.title}
                      </Typography>
                      <Typography variant="body2" color="#fff">
                        Year: {report.date}
                      </Typography>
                      <Typography variant="body2" mt={1} color="#fff">
                        Click to view analysis
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default GapAnalysisWriteups;
