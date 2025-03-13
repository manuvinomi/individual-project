"use client";
import { Box, Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

const DashboardWidgets = () => {
  return (
    <Box sx={{ display: "flex", gap: 3, mt: 4 }}>
      {/* Notifications Panel */}
      <Paper sx={{ flex: 1, padding: 3 }}>
        <Typography variant="h6" fontWeight="bold">Recent Notifications</Typography>
        <List>
          <ListItem>
            <ListItemText primary="New request received from John Doe" secondary="2 hours ago" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Time credits updated" secondary="Yesterday" />
          </ListItem>
        </List>
      </Paper>

      {/* Recent Transactions */}
      <Paper sx={{ flex: 1, padding: 3 }}>
        <Typography variant="h6" fontWeight="bold">Recent Transactions</Typography>
        <List>
          <ListItem>
            <ListItemText primary="Earned 5 credits from Graphic Design service" secondary="3 days ago" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Spent 2 credits on Web Development" secondary="1 week ago" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default DashboardWidgets;
