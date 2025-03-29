"use client";

import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  SelectChangeEvent,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const categories = ["Health", "Legal", "Education", "Employment", "Other"];

export default function OfferServicePage() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
  });

  const [providerName, setProviderName] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setProviderName(parsed.name);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.description || !form.image) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, providerName }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      setOpenSnackbar(true);
      setTimeout(() => router.push("/explore-services"), 1500);
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Server error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        textAlign="center"
        mb={4}
        color="#fff"
      >
        🚀 Offer a New Service
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        <TextField
          label="Service Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            input: { color: "#fff" },
            label: { color: "#ccc" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#666" },
              "&:hover fieldset": { borderColor: "#FDCB58" },
              "&.Mui-focused fieldset": { borderColor: "#FDCB58" },
            },
          }}
        />

        <FormControl fullWidth required>
          <InputLabel sx={{ color: "#ccc" }}>Category</InputLabel>
          <Select
            name="category"
            value={form.category}
            onChange={handleChange}
            label="Category"
            sx={{
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#666",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FDCB58",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FDCB58",
              },
            }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Image URL"
          name="image"
          value={form.image}
          onChange={handleChange}
          fullWidth
          sx={{
            input: { color: "#fff" },
            label: { color: "#ccc" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#666" },
              "&:hover fieldset": { borderColor: "#FDCB58" },
              "&.Mui-focused fieldset": { borderColor: "#FDCB58" },
            },
          }}
        />

        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={5}
          sx={{
            textarea: { color: "#fff" },
            label: { color: "#ccc" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#666" },
              "&:hover fieldset": { borderColor: "#FDCB58" },
              "&.Mui-focused fieldset": { borderColor: "#FDCB58" },
            },
          }}
        />

        {form.image && (
          <Box textAlign="center">
            <img
              src={form.image}
              alt="preview"
              style={{ maxHeight: 200, borderRadius: 10 }}
            />
          </Box>
        )}

        <Button
          variant="contained"
          sx={{ bgcolor: "#FDCB58", color: "#000", borderRadius: 3 }}
          onClick={handleSubmit}
        >
          Submit Service
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        message="Service submitted successfully!"
      />
    </Container>
  );
}
