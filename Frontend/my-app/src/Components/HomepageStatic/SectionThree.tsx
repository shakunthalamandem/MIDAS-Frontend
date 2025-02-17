import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import axios from "axios";

// Define types for the API response
interface USInternationalCount {
  us_international: string;
  count: number;
}

interface DealTypeCount {
  deal_type: string;
  count: number;
}

interface APIResponse {
  us_international_counts: USInternationalCount[];
  deal_type_counts: DealTypeCount[];
  total_opportunity_value: number;
}

const SectionThree = () => {
  const [counts, setCounts] = useState([
    { title: "IPOs globally", value: 0 },
    { title: "Follow-Ons globally", value: 0 },
    { title: "Billion of Opportunity Value", value: 0 },
    { title: "US New Issue Deals", value: 0 },
    { title: "International New Issue Deals", value: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl) throw new Error("API URL is not defined in environment variables");

        const response = await axios.get<APIResponse>(`${apiUrl}/api/delogic_data_count/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = response.data;

        // Map the values from the API response to the correct cards
        setCounts([
          { title: "IPOs globally", value: data.deal_type_counts.find((item) => item.deal_type === "IPO")?.count || 0 },
          { title: "Follow-Ons globally", value: data.deal_type_counts.find((item) => item.deal_type === "FO")?.count || 0 },
          { title: "Billion of Opportunity Value", value: data.total_opportunity_value / 1e9 }, // Convert to billions
          { title: "US New Issue Deals", value: data.us_international_counts.find((item) => item.us_international === "US")?.count || 0 },
          { title: "International New Issue Deals", value: data.us_international_counts.find((item) => item.us_international === "International")?.count || 0 },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ padding: 4, backgroundColor: "#060d78", mt: 4 }}>
      <Grid container spacing={3} justifyContent="center">
        {counts.map((card, index) => (
          <Grid item key={index}>
            <Card
              sx={{
                width: 240,
                height: 190,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: 3,
                borderRadius: 2,
                color: "#002060",
              }}
            >
              <CardContent>
              <Typography variant="h4" component="div" align="center" sx={{ fontWeight: "bold" }}>
                {card.title === "Billion of Opportunity Value"
                  ? `$${card.value.toFixed(1)}+` // Format with suffix for "Opportunity Value"
                  : `${card.value}+`}  {/* Add "+" for all values */}
              </Typography>
                <Typography variant="h6" component="div" align="center" sx={{ fontWeight: "bold" }}>
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography mt={4} sx={{ textAlign: "center", color: "#FFFFFF", fontWeight: "bold", fontSize: "30px" }}>
        SINCE 2001
      </Typography>
    </Box>
  );
};

export default SectionThree;
