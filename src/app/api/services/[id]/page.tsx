"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Rating,
  Button,
  Grid,
  TextField,
  Snackbar,
} from "@mui/material";

// Mock data (replace this with real data from MongoDB later)
const mockServices = [
  {
    id: "1",
    title: "Mental Health Counseling",
    category: "Health",
    description: "Confidential therapy sessions with licensed professionals.",
    image: "/services/mental-health.jpg",
    rating: 4.7,
    providerName: "Dr. Smith",
  },
  {
    id: "2",
    title: "Job Placement Support",
    category: "Employment",
    description: "Career coaching and job placement guidance.",
    image: "/services/job-support.jpg",
    rating: 4.8,
    providerName: "HR Ally",
  },
];

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = mockServices.find((s) => s.id === params.id);

  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserName(parsed.name);
    }
  }, []);

  const handleSendRequest = async () => {
    if (!userName || !message || !service) {
      alert("Please fill in the message");
      return;
    }

    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceTitle: service.title,
          message,
          requesterName: userName,
          providerName: service.providerName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      setOpenSnackbar(true);
      setMessage("");
    } catch (err) {
      console.error("Request error:", err);
      alert("Server error");
    }
  };

  if (!service) {
    return (
      <Typography variant="h6" textAlign="center" mt={10}>
        Service not found.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <img
            src={service.image}
            alt={service.title}
            style={{ width: "100%", borderRadius: 8 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {service.title}
          </Typography>
          <Chip label={service.category} color="info" sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary" mb={2}>
            {service.description}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Rating value={service.rating} precision={0.1} readOnly />
            <Typography variant="body2">{service.rating}</Typography>
          </Box>

          <Typography variant="subtitle2" mb={1}>
            Provider: <strong>{service.providerName}</strong>
          </Typography>

          <TextField
            label="Your Message to the Provider"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              mt: 2,
              textarea: { color: "#fff" },
              label: { color: "#ccc" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#666" },
                "&:hover fieldset": { borderColor: "#FDCB58" },
                "&.Mui-focused fieldset": { borderColor: "#FDCB58" },
              },
            }}
          />

          <Button
            variant="contained"
            sx={{ mt: 2, bgcolor: "#FDCB58", color: "#000" }}
            onClick={handleSendRequest}
          >
            Send Request
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Request sent successfully!"
      />
    </Box>
  );
}
