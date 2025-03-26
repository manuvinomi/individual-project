"use client";
import { useEffect, useState } from "react";
import { Typography, Button, Box, Grid, Card, CardContent, Avatar } from "@mui/material";
import { useRouter } from "next/navigation";

const MySkills = () => {
  const [skills, setSkills] = useState<{ name: string; description: string; image: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/my-skills")
      .then((res) => res.json())
      .then((data) => setSkills(data.skills || []))
      .catch((error) => console.error("Error fetching skills:", error));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a1a2e, #16213e)", // Dark Mode
        color: "white",
        padding: 4,
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: "bold", marginBottom: 3 }}>
        My Skills & Services
      </Typography>

      {skills.length === 0 ? (
        <Typography variant="h5" sx={{ opacity: 0.7 }}>No skills added yet.</Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {skills.map((skill, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  backgroundColor: "rgba(15, 52, 96, 0.3)", // Dark translucent
                  color: "white",
                  padding: 2,
                  textAlign: "center",
                  borderRadius: "15px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": { 
                    transform: "scale(1.05)", 
                    boxShadow: "0px 8px 20px rgba(255,255,255,0.2)" 
                  },
                }}
              >
                <CardContent>
                  <Avatar
                    src={skill.image || "/default-skill.png"}
                    sx={{ width: 80, height: 80, margin: "auto", marginBottom: 2 }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#e94560" }}>
                    {skill.name}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {skill.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Button
        variant="contained"
        sx={{
          marginTop: 4,
          backgroundColor: "#e94560", // Deep Red CTA
          color: "white",
          borderRadius: "30px",
          padding: "12px 24px",
          fontWeight: "bold",
          "&:hover": { backgroundColor: "#ff6b81" }, // Lighter hover effect
        }}
        onClick={() => router.push("/add-skill")}
      >
        Add New Skill
      </Button>
    </Box>
  );
};

export default MySkills;





