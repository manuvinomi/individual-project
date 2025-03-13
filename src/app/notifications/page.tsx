"use client";
import { useEffect, useState } from "react";
import { Typography, Button, Box } from "@mui/material";
import { Fade } from "react-awesome-reveal";

const Notifications = () => {
  const [notifications, setNotifications] = useState<{ title: string; message: string; date?: string }[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch((error) => console.error("Error fetching notifications:", error));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        background: "linear-gradient(135deg, #8E2DE2, #4A00E0)",
        color: "white",
        padding: 4,
      }}
    >
      <Fade>
        <Typography variant="h2" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Notifications
        </Typography>

        {notifications.length === 0 ? (
          <Typography variant="h5" sx={{ opacity: 0.8 }}>No notifications available.</Typography>
        ) : (
          <Box sx={{ marginTop: 3 }}>
            {notifications.map((notification, index) => (
              <Typography
                key={index}
                variant="h4"
                sx={{
                  marginBottom: 1,
                  fontWeight: "500",
                  opacity: 0.9,
                  transition: "0.3s",
                  "&:hover": { opacity: 1, transform: "scale(1.05)" },
                }}
              >
                🔔 {notification.title} - <span style={{ fontSize: "1rem", opacity: 0.7 }}>{notification.message}</span>
              </Typography>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          color="secondary"
          href="/dashboard"
          sx={{
            marginTop: 4,
            padding: "12px 24px",
            fontSize: "1.2rem",
            borderRadius: "30px",
            backgroundColor: "#8E2DE2",
            "&:hover": { backgroundColor: "#6528d7" },
          }}
        >
          Back to Dashboard
        </Button>
      </Fade>
    </Box>
  );
};

export default Notifications;

