import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useRouter } from "next/navigation";

const steps = [
  {
    icon: <PersonAddIcon sx={{ fontSize: 50 }} />,
    title: "Sign Up",
    description: "Create your account and set up your profile.",
    link: "/signup",
  },
  {
    icon: <HandshakeIcon sx={{ fontSize: 50 }} />,
    title: "Offer / Request Services",
    description: "Offer your skills or request services.",
    link: "/services",
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 50 }} />,
    title: "Earn & Spend Time Credits",
    description: "Earn and spend time credits for services.",
    link: "/time-credits",
  },
];

export default function HowItWorks() {
  const router = useRouter();

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
            <Card
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Clickable Icon Button (Properly Centered) */}
                <Button
                  onClick={() => router.push(step.link)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                    "&:hover": { transform: "scale(1.1)", transition: "0.2s ease-in-out" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                    {step.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {step.title}
                  </Typography>
                </Button>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
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
