import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";

const SectionThree = () => {
  const cardData = [
    { title: "IPOs", value: 8113, prefix: "" },
    { title: "FOs", value: 18624, prefix: "" },
    { title: "Opportunity Value", value: 968, suffix: "B", prefix: "$" },
    { title: "US Markets", value: 14306, prefix: "" },
    { title: "International Markets", value: 12431, prefix: "" },
  ];

  const [counts, setCounts] = useState(cardData.map(() => 0));

  useEffect(() => {
    const timers = cardData.map((card, index) => {
      const targetValue = card.value;
      let currentValue = 0;

      // Store the animation frame ID
      let animationFrameId: number;

      const increment = () => {
        if (currentValue < targetValue) {
          currentValue += Math.ceil(targetValue / 100); // Adjust speed of animation
          setCounts((prevCounts) => {
            const newCounts = [...prevCounts];
            newCounts[index] = currentValue;
            return newCounts;
          });
          animationFrameId = requestAnimationFrame(increment); // Save the ID of the requestAnimationFrame
        } else {
          setCounts((prevCounts) => {
            const newCounts = [...prevCounts];
            newCounts[index] = targetValue;
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
  }, []);

  return (
    <Box sx={{ padding: 4, backgroundColor: "#060d78", mt: 4 }}>
      <Grid container spacing={3} justifyContent="center">
        {cardData.map((card, index) => (
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
                  {card.prefix} {/* Add prefix */}
                  {card.suffix
                    ? `${counts[index]} ${card.suffix}` // Display with suffix for "Opportunity Value"
                    : counts[index]}+ {/* Display the number */}
                </Typography>
                <Typography variant="h6" component="div" align="center" sx={{ fontWeight: "bold" }}>
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SectionThree;
