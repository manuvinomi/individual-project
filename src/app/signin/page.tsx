"use client";

import { Box, Button, TextField, Typography, Grid, Card } from "@mui/material";
import { useState } from "react";

export default function SigninPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Grid container sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F8F9FA" }}>
      <Card sx={{ width: 600, borderRadius: 5, display: "flex", flexDirection: "column", p: 4, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={600} mb={1}>Sign In</Typography>
        <Typography variant="body2" color="gray" mb={3}>Welcome back! Please enter your details.</Typography>
        <TextField 
          label="Email" 
          name="email" 
          variant="outlined" 
          fullWidth 
          margin="dense" 
          onChange={handleChange} 
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 25,
              borderColor: "#FDCB58",
              '&:hover': {
                borderColor: "#FDCB58"
              },
              '&.Mui-focused': {
                borderColor: "#FDCB58",
                borderWidth: 2
              }
            }
          }} 
        />
        <TextField 
          label="Password" 
          name="password" 
          type="password" 
          variant="outlined" 
          fullWidth 
          margin="dense" 
          onChange={handleChange} 
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 25,
              borderColor: "#FDCB58",
              '&:hover': {
                borderColor: "#FDCB58"
              },
              '&.Mui-focused': {
                borderColor: "#FDCB58",
                borderWidth: 2
              }
            }
          }} 
        />
        <Typography variant="body2" sx={{ textAlign: "right", mt: 1, cursor: "pointer", color: "#FDCB58" }}>Forgot Password?</Typography>
        <Button variant="contained" sx={{ bgcolor: "#FDCB58", mt: 2, color: "#000", borderRadius: 25, height: 45 }}>Sign In</Button>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          <Button variant="outlined" sx={{ borderColor: "#FDCB58", borderWidth: 2, borderRadius: 25, width: "45%", height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <img src="/apple.svg" alt="Apple" style={{ width: 20, height: 20 }} /> Apple
          </Button>
          <Button variant="outlined" sx={{ borderColor: "#FDCB58", borderWidth: 2, borderRadius: 25, width: "45%", height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <img src="/google.svg" alt="Google" style={{ width: 20, height: 20 }} /> Google
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account? <a href="#" style={{ textDecoration: "none", fontWeight: 600, color: "#FDCB58" }}>Sign up</a>
        </Typography>
      </Card>
    </Grid>
  );
}
    