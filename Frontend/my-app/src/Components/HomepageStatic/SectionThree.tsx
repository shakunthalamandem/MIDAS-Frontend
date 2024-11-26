import React from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";


const SectionThree = () => {
  const cards = [
    { title: "IPOs" },
    { title: "FOs" },
    { title: "Opportunity Value" },
    { title: "US & International Markets" },
  ];

  return (
    <>
    <Box sx={{ padding: 4 ,backgroundColor:'#060d78'}} >
      <Grid container spacing={3} justifyContent="center">
        {cards.map((card, index) => (
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
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  component="div"
                  align="center"
                  sx={{ fontWeight: "bold" }}
                >
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
    </>  );
};

export default SectionThree;
