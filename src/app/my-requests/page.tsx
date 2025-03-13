"use client";
import { useEffect, useState } from "react";
import { Typography, Button, Box, Chip } from "@mui/material";
import { Fade } from "react-awesome-reveal";

const MyRequests = () => {
  const [requests, setRequests] = useState<{ service: string; status: string; date?: string }[]>([]);

  useEffect(() => {
    fetch("/api/my-requests")
      .then((res) => res.json())
      .then((data) => setRequests(data.requests || []))
      .catch((error) => console.error("Error fetching requests:", error));
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
        background: "linear-gradient(135deg, #ff4081, #ff79a1)",
        color: "white",
        padding: 4,
      }}
    >
      <Fade>
        <Typography variant="h2" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          My Service Requests
        </Typography>

        {requests.length === 0 ? (
          <Typography variant="h5" sx={{ opacity: 0.8 }}>No requests found.</Typography>
        ) : (
          <Box sx={{ marginTop: 3 }}>
            {requests.map((request, index) => (
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
                🛠 {request.service} - 
                <Chip label={request.status} sx={{ marginLeft: 1, fontSize: "1rem" }} />
              </Typography>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          color="secondary"
          href="/services"
          sx={{
            marginTop: 4,
            padding: "12px 24px",
            fontSize: "1.2rem",
            borderRadius: "30px",
            backgroundColor: "#ff4081",
            "&:hover": { backgroundColor: "#ff79a1" },
          }}
        >
          Browse Services
        </Button>
      </Fade>
    </Box>
  );
};

export default MyRequests;

