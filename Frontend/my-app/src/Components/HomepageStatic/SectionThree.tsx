import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import "./SectionThree.css";

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

const statIcons = ["🌍", "📈", "💰", "🇺🇸", "🌐"];
const iconBgs = [
  "rgba(167, 139, 250, 0.2)",
  "rgba(52, 211, 153, 0.2)",
  "rgba(251, 146, 60, 0.2)",
  "rgba(96, 165, 250, 0.2)",
  "rgba(251, 191, 36, 0.2)",
];
const valueColors = [
  "#c4b5fd",  // lavender
  "#6ee7b7",  // mint green
  "#fdba74",  // peach orange
  "#93c5fd",  // sky blue
  "#fde68a",  // warm yellow
];

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
    <Box className="section-three-wrapper">
      <Box className="stats-grid">
        {counts.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{ flex: 1, maxWidth: 210, display: 'flex' }}
          >
            <Box className="stat-card" sx={{ width: '100%' }}>
              <Box className="stat-icon" sx={{ background: iconBgs[index] }}>
                {statIcons[index]}
              </Box>
              <Typography className="stat-value" sx={{ color: `${valueColors[index]} !important` }}>
                {card.title === "Billion of Opportunity Value"
                  ? `$${card.value.toFixed(0)}B+`
                  : `${card.value.toLocaleString()}+`}
              </Typography>
              <Typography className="stat-label">
                {card.title}
              </Typography>
            </Box>
          </motion.div>
        ))}
      </Box>
      <Typography className="since-text" sx={{ textAlign: "center", mt: 6 }}>
        Since 2001
      </Typography>
    </Box>
  );
};

export default SectionThree;
