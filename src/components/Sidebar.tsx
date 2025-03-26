"use client";

import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname(); // Get current route

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
          background: "#f8f9fa",
          position: "fixed",
          height: "100vh",
        },
      }}
    >
      <List>
        {[
          { text: "Dashboard Overview", href: "/dashboard" },
          { text: "My Skills & Services", href: "/dashboard/skills" },
          { text: "My Requests", href: "/dashboard/requests" },
          { text: "Time Credit Transactions", href: "/dashboard/transactions" },
          { text: "Notifications", href: "/dashboard/notifications" },
        ].map(({ text, href }) => (
          <ListItem
            key={text}
            component={Link}
            href={href}
            sx={{
              textDecoration: "none",
              color: pathname === href ? "#007bff" : "inherit", // Highlight active page
              fontWeight: pathname === href ? "bold" : "normal",
              backgroundColor: pathname === href ? "rgba(0,123,255,0.1)" : "transparent",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;



