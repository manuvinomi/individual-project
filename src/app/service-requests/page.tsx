"use client";

import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";

type ServiceRequest = {
  _id: string;
  serviceTitle: string;
  message: string;
  requesterName: string;
  providerName: string;
  status: "Pending" | "Accepted" | "Declined";
  createdAt: string;
};

export default function ServiceRequestsPage() {
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [userName, setUserName] = useState("");

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserName(parsed.name);
    }
  }, []);

  useEffect(() => {
    if (!userName) return;

    const role = tab === 0 ? "provider" : "requester";
    fetch(`/api/service-requests?${role}=${encodeURIComponent(userName)}`)
      .then((res) => res.json())
      .then((data) => setRequests(data.requests || []))
      .catch((err) => console.error("Error loading requests", err));
  }, [tab, userName]);

  const handleStatusUpdate = async (id: string, newStatus: "Accepted" | "Declined") => {
    try {
        await fetch(`/api/service-requests/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Accepted" }), // or "Declined"
          });
          

      // Refresh list
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: newStatus } : req
        )
      );
    } catch (error) {
      console.error("Failed to update request status", error);
    }
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={700} textAlign="center" mb={3} color="white">
        📨 Service Requests
      </Typography>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        centered
        textColor="inherit"
        TabIndicatorProps={{ sx: { bgcolor: "#FDCB58" } }}
      >
        <Tab label="Incoming" sx={{ color: "white" }} />
        <Tab label="Outgoing" sx={{ color: "white" }} />
      </Tabs>

      <Grid container spacing={3} mt={2}>
        {requests.map((req) => (
          <Grid item xs={12} md={6} key={req._id}>
            <Card
              sx={{
                bgcolor: "#1e1e1e",
                borderRadius: 3,
                border: "1px solid #333",
                boxShadow: 4,
              }}
            >
              <CardContent>
                <Typography variant="h6" color="#FDCB58" gutterBottom>
                  {req.serviceTitle}
                </Typography>

                {tab === 0 ? (
                  <Typography variant="body2" color="white" gutterBottom>
                    <strong>From:</strong> {req.requesterName}
                  </Typography>
                ) : (
                  <>
                    <Typography variant="body2" color="white">
                      <strong>To:</strong> {req.providerName}
                    </Typography>
                    <Typography variant="body2" color="#bbb">
                      <strong>Status:</strong> {req.status}
                    </Typography>
                  </>
                )}

                <Typography variant="body2" color="#bbb" mt={1}>
                  <strong>Message:</strong> {req.message}
                </Typography>

                <Typography variant="caption" display="block" color="#777" mt={1}>
                  Sent on: {new Date(req.createdAt).toLocaleDateString()}
                </Typography>

                {tab === 0 && req.status === "Pending" && (
                  <Box mt={2} display="flex" gap={2}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleStatusUpdate(req._id, "Accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleStatusUpdate(req._id, "Declined")}
                    >
                      Decline
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {requests.length === 0 && (
        <Typography textAlign="center" mt={5} color="gray">
          No {tab === 0 ? "incoming" : "outgoing"} requests found.
        </Typography>
      )}
    </Container>
  );
}

