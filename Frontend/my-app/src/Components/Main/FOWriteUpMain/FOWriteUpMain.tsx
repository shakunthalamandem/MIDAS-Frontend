import React from 'react';
import { Container, Card, CardContent, Typography, Box } from '@mui/material';
import FOWriteUpDashboardMain from './FOWriteUpDashboardMain';

const FOWriteUpMain: React.FC = () => {
  return (
    <Box>
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
        Welcome to detailed Insights on Follow-On (FO) Write-Ups!
      </Typography>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            {/* Dashboard now handles fetching data */}
            <FOWriteUpDashboardMain />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default FOWriteUpMain;
