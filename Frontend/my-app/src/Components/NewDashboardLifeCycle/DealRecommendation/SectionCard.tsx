import React from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";


export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7ef",
        background: "#f7f9ff",
        boxShadow: "0 10px 20px rgba(32, 70, 150, 0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={1.5}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#121f44" }}
            align="center"
          >
            {title || ""}
          </Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}