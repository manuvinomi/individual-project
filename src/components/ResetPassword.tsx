"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Grid, Card } from "@mui/material";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <Grid container sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F8F9FA" }}>
      <Card sx={{ width: 400, borderRadius: 5, p: 4, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={600} mb={2}>Reset Your Password</Typography>
        <TextField label="New Password" type="password" fullWidth margin="dense" onChange={(e) => setNewPassword(e.target.value)} />
        <TextField label="Confirm Password" type="password" fullWidth margin="dense" onChange={(e) => setConfirmPassword(e.target.value)} />
        <Button variant="contained" sx={{ bgcolor: "#FDCB58", mt: 2, color: "#000" }}>
          Reset Password
        </Button>
        <Typography variant="body2" sx={{ mt: 2, cursor: "pointer", color: "#FDCB58" }}>
          Back to Sign-In
        </Typography>
      </Card>
    </Grid>
  );
}
