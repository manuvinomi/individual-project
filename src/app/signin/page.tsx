"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, TextField, Button, Typography } from "@mui/material";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // Simulating an API response with user details
    const userData = {
      name: "John Doe",
      email: email,
      profilePic: "/user-placeholder.png", // Placeholder image for now
    };

    localStorage.setItem("user", JSON.stringify(userData));
    router.push("/dashboard"); // Redirect to dashboard after login
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", marginTop: 4 }}>
      <Typography variant="h4">Sign In</Typography>
      <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" fullWidth sx={{ marginTop: 2 }} onClick={handleLogin}>
        Login
      </Button>
    </Container>
  );
};

export default SignIn;

    