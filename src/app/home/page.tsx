"use client";

import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import HowItWorks from "@/components/HowItWorks";


export default function HomePage() {
  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static" sx={{ background: "#fff", color: "#000", boxShadow: "none" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo */}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>Logo</Typography>

          {/* Navigation Links */}
          <Box sx={{ display: "flex", gap: 3 }}>
            {["Home", "Browse", "Community", "Events", "Contact Us"].map((item) => (
              <Button key={item} sx={{ textTransform: "none", color: "black" }}>{item}</Button>
            ))}
          </Box>

          {/* Auth Buttons */}
          <Box>
            <Button variant="outlined" sx={{ mx: 1 }}>Sign Up</Button>
            <Button variant="contained">Login</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section with Background Image */}
      <Box
  sx={{
    height: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    backgroundImage: "url('/hero.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "2rem",
  }}
>
  {/* Black Heading */}
  <Typography variant="h3" fontWeight="bold" sx={{ color: "#000" }}>
    Learn, Share, and Grow Together!
  </Typography>

  {/* Get Started Button */}
  <Button variant="contained" sx={{ mt: 2, padding: "10px 20px" }}>
    Get Started
  </Button>
</Box>
{/* How It Works Section */}
<HowItWorks />


    </Box>
  );
}

