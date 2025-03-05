"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

const Hero = () => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "80vh",
        backgroundImage: "url('/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Overlay to Improve Text Readability */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
        }}
      ></Box>

      {/* Hero Content */}
      <Box
        sx={{
          position: "relative",
          textAlign: "center",
          color: "white",
          zIndex: 2,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
          Learn, Share, and Grow Together!
        </Typography>
        <Link href="/signup">
          <Button variant="contained" sx={{ backgroundColor: "#FFD700", color: "black", fontSize: "1.2rem", fontWeight: "bold" }}>
            Get Started
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default Hero;
