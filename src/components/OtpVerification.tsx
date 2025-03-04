"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Grid, Card } from "@mui/material";

export default function OtpVerification() { // ✅ Rename the function to "Page"
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleOtpChange = (index: number, value: string) => { // Add types
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
    }
  };

  return (
    <Grid container sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F8F9FA" }}>
      <Card sx={{ width: 400, borderRadius: 5, p: 4, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={600} mb={2}>Verify Your Email</Typography>
        <Typography variant="body2" mb={2}>Enter the 6-digit code sent to your email.</Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {otp.map((val, index) => (
            <TextField
              key={index}
              variant="outlined"
              inputProps={{ maxLength: 1 }}
              sx={{ width: 40 }}
              value={val}
              onChange={(e) => handleOtpChange(index, e.target.value)}
            />
          ))}
        </Box>
        <Button variant="contained" sx={{ bgcolor: "#FDCB58", mt: 2, color: "#000" }}>
          Verify
        </Button>
        <Typography variant="body2" sx={{ mt: 2, cursor: "pointer", color: "#FDCB58" }}>
          Didn't receive a code? Resend
        </Typography>
      </Card>
    </Grid>
  );
}
