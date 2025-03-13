"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { Fade } from "react-awesome-reveal";

const MySkills = () => {
    const [skills, setSkills] = useState<Array<{ name: string; description?: string }>>([]);



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
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        background: "linear-gradient(135deg, #0072ff, #00c6ff)", // Beautiful Gradient
        color: "white",
        padding: 4,
      }}
    >
      <Fade>
        <Typography variant="h2" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          My Skills & Services
        </Typography>

        {skills.length === 0 ? (
          <Typography variant="h5" sx={{ opacity: 0.8 }}>No skills added yet.</Typography>
        ) : (
          <Box sx={{ marginTop: 3 }}>
            {skills.map((skill, index) => (
              <Typography
                key={index}
                variant="h4"
                sx={{
                  marginBottom: 1,
                  fontWeight: "500",
                  opacity: 0.9,
                  transition: "0.3s",
                  "&:hover": { opacity: 1, transform: "scale(1.05)" },
                }}
              >
                🚀 {skill.name} - <span style={{ fontSize: "1rem", opacity: 0.7 }}>{skill.description || "No description"}</span>
              </Typography>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          color="secondary"
          href="/add-skill"
          sx={{
            marginTop: 4,
            padding: "12px 24px",
            fontSize: "1.2rem",
            borderRadius: "30px",
            backgroundColor: "#ff4081",
            "&:hover": { backgroundColor: "#ff79a1" },
          }}
        >
          ➕ Add New Skill
        </Button>
      </Fade>
    </Box>
  );
};

export default MySkills;


