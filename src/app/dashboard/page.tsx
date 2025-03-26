"use client";
import { Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DashboardOverview from "@/components/DashboardOverview";
import DashboardWidgets from "@/components/DashboardWidgets"; // ✅ Ensures widgets are included once
import FloatingActionButton from "@/components/FloatingActionButton";


export default function DashboardPage() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, padding: 3, mt: 8 }}>
        <Navbar />
        <DashboardOverview />
        
        <DashboardWidgets />
        <FloatingActionButton />
      </Box>
    </Box>
  );
}




