import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const steps = [
  {
    icon: <PersonAddIcon sx={{ fontSize: 50, color: "primary.main" }} />,
    title: "Sign Up",
    description: "Create your account and set up your profile.",
  },
  {
    icon: <HandshakeIcon sx={{ fontSize: 50, color: "primary.main" }} />,
    title: "Offer / Request Services",
    description: "Offer your skills or request services.",
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 50, color: "primary.main" }} />,
    title: "Earn & Spend Time Credits",
    description: "Earn and spend time credits for services.",
  },
];

export default function HowItWorks() {
  return (
    <Box sx={{ textAlign: "center", py: 8, bgcolor: "#f9f9f9" }}>
      {/* Section Title */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        How It Works
      </Typography>

      {/* Steps Grid */}
      <Grid container spacing={4} justifyContent="center">
        {steps.map((step, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card sx={{ textAlign: "center", py: 4, px: 2, height: "100%" }}>
              <Box>{step.icon}</Box>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
