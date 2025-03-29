"use client";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  Rating,
  Button,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect } from "react";
import Link from "next/link";

const filters = ["All", "Health", "Legal", "Education", "Employment"];

export default function ExploreServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data.services || []);
        setFiltered(data.services || []);
      } catch (err) {
        console.error("Error loading services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const filteredData = services.filter((s) => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === "All" || s.category === selectedFilter;
      return matchesSearch && matchesFilter;
    });

    setFiltered(filteredData);
  }, [searchQuery, selectedFilter, services]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} textAlign="center" mb={4} color="white">
        🔍 Explore Services That Empower You
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4, maxWidth: 600, mx: "auto" }}>
        <TextField
          variant="outlined"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ borderRadius: 3, bgcolor: "#FFF5CC" }}
        />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
          {filters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              clickable
              onClick={() => setSelectedFilter(filter)}
              color={selectedFilter === filter ? "warning" : "default"}
              variant={selectedFilter === filter ? "filled" : "outlined"}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress color="warning" />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filtered.map((service) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={service._id}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 4,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" },
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={service.image}
                  alt={service.title}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {service.title}
                  </Typography>
                  <Chip label={service.category} color="info" size="small" sx={{ mb: 1 }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Rating value={service.rating || 0} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {service.rating?.toFixed(1) || "0.0"}
                    </Typography>
                  </Box>
                  <Link href={`/services/${service._id}`}>
                    <Button fullWidth variant="contained" sx={{ mt: 2, borderRadius: 3, bgcolor: "#FDCB58", color: "#000" }}>
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && filtered.length === 0 && (
        <Typography textAlign="center" mt={5} color="gray">
          No services found matching your search or filter.
        </Typography>
      )}
    </Box>
  );
}
