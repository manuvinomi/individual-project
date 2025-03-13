"use client";

import { AppBar, Toolbar, Typography, Button, Stack, Badge, IconButton, Popover, List, ListItem, ListItemText } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Dummy notifications
  const notifications = [
    { id: 1, message: "New service request received", time: "2h ago" },
    { id: 2, message: "Your time credit updated", time: "1d ago" },
  ];

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "white", boxShadow: "none", borderBottom: "1px solid #ddd", px: 3 }}>
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
                sx={{ color: "black", textDecoration: "none", fontSize: "1rem", cursor: "pointer", "&:hover": { color: "#007bff" } }}
              >
                {text}
              </Typography>
            </Link>
          ))}
        </Stack>

        {/* Notifications & Buttons */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Notification Bell */}
          <IconButton onClick={handleClick} color="inherit">
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon sx={{ color: "black" }} />
            </Badge>
          </IconButton>

          {/* Notification Dropdown */}
          <Popover open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
            <List sx={{ width: "250px" }}>
              {notifications.map((notif) => (
                <ListItem key={notif.id} divider>
                  <ListItemText primary={notif.message} secondary={notif.time} />
                </ListItem>
              ))}
            </List>
          </Popover>

          {/* Auth Buttons */}
          <Link href="/signup" passHref>
            <Button variant="contained" sx={{ backgroundColor: "#007bff", color: "white" }}>SIGN UP</Button>
          </Link>
          <Link href="/signin" passHref>
            <Button variant="outlined" sx={{ borderColor: "#007bff", color: "#007bff" }}>LOGIN</Button>
          </Link>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;


