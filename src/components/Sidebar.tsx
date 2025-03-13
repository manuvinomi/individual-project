import { Drawer, List, ListItem, ListItemText, Avatar, Box, Typography, Divider } from "@mui/material";

const Sidebar = () => {
  return (
    <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0, "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", padding: 2 } }}>
      {/* User Profile */}
      <Box display="flex" flexDirection="column" alignItems="center" my={2}>
        <Avatar sx={{ width: 64, height: 64 }}>V</Avatar>
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
          Vinomi Rathnayaka
        </Typography>
        <Typography variant="body2" color="textSecondary">
          10 Time Credits
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Links */}
      <List>
        {[
          { text: "Dashboard Overview", href: "/dashboard" },
          { text: "My Skills & Services", href: "/dashboard/skills" },
          { text: "My Requests", href: "/dashboard/requests" },
          { text: "Time Credit Transactions", href: "/dashboard/transactions" },
          { text: "Notifications", href: "/dashboard/notifications" },
        ].map(({ text, href }) => (
          <ListItem button component="a" href={href} key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;




