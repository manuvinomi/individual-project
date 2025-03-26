"use client";

import { Box, Button, TextField, Typography, Grid, Card, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";


const handleSubmit = async (form: { name: string; email: string; password: string; confirmPassword: string; role: string }, router: ReturnType<typeof useRouter>) => {
  if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.role) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    
    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("User registered successfully!");
router.push("/signin"); // Redirect to sign-in page

  } catch (error) {
    console.error("Signup Error:", error);
    alert("Something went wrong!");
  }
};


export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "" });

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    setForm({ ...form, [e.target.name as string]: e.target.value });
  };

  return (
    <Grid container sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F8F9FA" }}>
      <Card sx={{ width: 900, borderRadius: 5, display: "flex", overflow: "hidden" }}>
        {/* Left Section - Form */}
        <Box sx={{ width: "50%", p: 4, bgcolor: "linear-gradient(to bottom, #F8F9FA, #FFF5CC)", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
          <Typography variant="h5" fontWeight={600} mb={1}>Create an account</Typography>
          <Typography variant="body2" color="gray" mb={3}>Sign up and get 30 day free trial</Typography>
          <TextField 
            label="Full name" 
            name="name" 
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
          <TextField 
            label="Confirm Password" 
            name="confirmPassword" 
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
          <FormControl fullWidth margin="dense" sx={{ borderRadius: 25, mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              sx={{ borderRadius: 25, borderColor: "#FDCB58" }}
            >
              <MenuItem value="service_provider">Service Provider</MenuItem>
              <MenuItem value="seeker">Seeker</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" sx={{ bgcolor: "#FDCB58", mt: 2, color: "#000", borderRadius: 25, height: 45 }} onClick={() => handleSubmit(form, router)}>
            Submit
          </Button>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
            <Button variant="outlined" sx={{ borderColor: "#FDCB58", borderWidth: 2, borderRadius: 25, width: "45%", height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <img src="/apple.svg" alt="Apple" style={{ width: 20, height: 20 }} /> Apple
            </Button>
            <Button variant="outlined" sx={{ borderColor: "#FDCB58", borderWidth: 2, borderRadius: 25, width: "45%", height: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <img src="/google.svg" alt="Google" style={{ width: 20, height: 20 }} /> Google
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Have any account? <a href="#" style={{ textDecoration: "none", fontWeight: 600, color: "#FDCB58" }}>Sign in</a>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <a href="#" style={{ textDecoration: "none", fontWeight: 600 }}>Terms & Conditions</a>
          </Typography>
        </Box>
        
        {/* Right Section - Just an Image */}
        <Box sx={{ width: "50%" }}>
          <img src="/main.jpeg" alt="Skill share" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Box>
      </Card>
    </Grid>
  );
}
