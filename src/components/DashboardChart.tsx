"use client";

import { Box, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define chart data
const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Completed Requests",
      data: [5, 10, 15, 7, 12, 9],
      backgroundColor: "rgba(54, 162, 235, 0.5)",
    },
  ],
};

// ✅ Define `options` before using it
const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Monthly Completed Requests" },
  },
};

const DashboardChart = () => {
  return (
    <Box sx={{ mt: 5, width: "100%", maxWidth: 800, textAlign: "center" }}>
      <Typography variant="h6" fontWeight="bold">
        Service Requests Overview
      </Typography>
      {/* ✅ Pass `options` correctly */}
      <Bar data={data} options={options} />
    </Box>
  );
};

export default DashboardChart;

