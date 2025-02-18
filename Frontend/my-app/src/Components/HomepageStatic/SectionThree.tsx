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
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) return;

      const response = await axios.get<APIResponse>(`${apiUrl}/api/delogic_data_count/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      // Initialize counts with fetched data, applying rounding rules
      const fetchedCounts = [
        {
          title: "IPOs globally",
          value: Math.round((data.deal_type_counts.find((item) => item.deal_type === "IPO")?.count || 0) / 100) * 100,
        },
        {
          title: "Follow-Ons globally",
          value: Math.round((data.deal_type_counts.find((item) => item.deal_type === "FO")?.count || 0) / 100) * 100,
        },
        {
          title: "Billion of Opportunity Value",
          value: Math.round(data.total_opportunity_value / 1e9 / 10) * 10, // Round to the nearest 10 billion
        },
        
        {
          title: "US New Issue Deals",
          value: Math.round((data.us_international_counts.find((item) => item.us_international === "US")?.count || 0) / 100) * 100,
        },
        {
          title: "International New Issue Deals",
          value: Math.round((data.us_international_counts.find((item) => item.us_international === "International")?.count || 0) / 100) * 100,
        },
      ];

      setCounts(fetchedCounts);

      // Animation logic
      const timers = fetchedCounts.map((card, index) => {
        const targetValue = card.value;
        let currentValue = 0;

        // Store the animation frame ID
        let animationFrameId: number;

        const increment = () => {
          if (currentValue < targetValue) {
            currentValue += Math.ceil(targetValue / 100); // Adjust speed of animation
            setCounts((prevCounts) => {
              const newCounts = [...prevCounts];
              newCounts[index] = { ...newCounts[index], value: currentValue };
              return newCounts;
            });
            animationFrameId = requestAnimationFrame(increment); // Save the ID of the requestAnimationFrame
          } else {
            setCounts((prevCounts) => {
              const newCounts = [...prevCounts];
              newCounts[index] = { ...newCounts[index], value: targetValue };
              return newCounts;
            });
          }
        };

        // Start the animation
        animationFrameId = requestAnimationFrame(increment);

        // Return a cleanup function to cancel the animation when the component unmounts
        return () => cancelAnimationFrame(animationFrameId);
      });

      // Cleanup all timers
      return () => timers.forEach((clearTimer) => clearTimer());
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
                    ? `$${card.value.toFixed(0)}B   +` // Format with suffix for "Opportunity Value" rounded
                    : `${card.value}+`} {/* Add "+" for all values */}
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
