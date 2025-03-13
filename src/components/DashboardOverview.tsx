"use client";

import { Box, Typography, Paper, Container } from "@mui/material";
import DashboardChart from "@/components/DashboardChart";




const DashboardOverview = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Centered Title */}
      <Typography variant="h5" fontWeight="bold" sx={{ textAlign: "center", mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Keep All Cards in One Row & Centered */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center", // Ensures cards are centered in a row
          alignItems: "center",
          gap: 4,
          width: "100%", // Prevents stretching
          maxWidth: "900px", // Controls width so it doesn’t go too wide
        }}
      >
        <Paper sx={{ padding: 3, width: "280px", textAlign: "center", flexShrink: 0 }}>
          <Typography variant="h6">Skills Offered</Typography>
          <Typography variant="body1">5 Active Skills</Typography>
        </Paper>
        <Paper sx={{ padding: 3, width: "280px", textAlign: "center", flexShrink: 0 }}>
          <Typography variant="h6">Pending Requests</Typography>
          <Typography variant="body1">2 Requests</Typography>
        </Paper>
        <Paper sx={{ padding: 3, width: "280px", textAlign: "center", flexShrink: 0 }}>
          <Typography variant="h6">Time Credits</Typography>
          <Typography variant="body1">10 Earned Credits</Typography>
        </Paper>
      </Box>
      <DashboardChart />
    </Container>
  );
};

export default DashboardOverview;


