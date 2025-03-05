"use client";

import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";

const Navbar = () => {
  return (
    <AppBar
      position="fixed" // Change to fixed so it remains visible on scroll
      sx={{
        backgroundColor: "white",
        boxShadow: "none",
        borderBottom: "1px solid #ddd",
        px: 3,
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000, // Ensures it stays on top of other content
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography variant="h6" sx={{ color: "black", fontWeight: "bold" }}>
          Skill Exchange
        </Typography>

        {/* Navigation Links */}
        <Stack direction="row" spacing={3}>
          {["Home", "Browse", "Community", "Events", "Contact Us"].map((text) => (
            <Link key={text} href={`/${text.toLowerCase().replace(" ", "-")}`} passHref>
              <Typography
                sx={{
                  color: "black",
                  textDecoration: "none",
                  fontSize: "1rem",
                  cursor: "pointer",
                  "&:hover": { color: "#007bff" },
                }}
              >
                {text}
              </Typography>
            </Link>
          ))}
        </Stack>

        {/* Buttons */}
        <Stack direction="row" spacing={1}>
          <Link href="/signup" passHref>
            <Button variant="contained" sx={{ backgroundColor: "#007bff", color: "white" }}>
              SIGN UP
            </Button>
          </Link>
          <Link href="/signin" passHref>
            <Button variant="outlined" sx={{ borderColor: "#007bff", color: "#007bff" }}>
              LOGIN
            </Button>
          </Link>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

