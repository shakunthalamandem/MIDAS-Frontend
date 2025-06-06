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
import { motion } from "framer-motion";
import gapimage from "../../../Assets/images/gapimgae.jpg";

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #ffe3e0, #ffcccc)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(120, 0, 0, 0.2)",
              padding: "10px",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#780000",
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              Gap Analysis Writeups
            </Typography>

            {/* Optional subtitle */}
            {/* <Typography variant="body2" sx={{ color: "#500000", marginTop: "8px" }}>
      Insightful gap analysis reports curated for key market trends.
    </Typography> */}
          </Box>
        </motion.div>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : data.length === 0 ? (
          <Typography align="center">No reports to show.</Typography>
        ) : (
          <Grid container spacing={3}>
            {data.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
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
                      borderRadius: "16px",
                      backgroundColor: "transparent",
                    }}
                  >
                    {/* Blurred & transparent background image */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${gapimage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",

                        zIndex: 0,
                      }}
                    />

                    <CardActionArea
                      onClick={() => window.open(report.gap_analysis, "_blank")}
                      sx={{ position: "relative", zIndex: 1 }}
                    >
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
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
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default GapAnalysisWriteups;
