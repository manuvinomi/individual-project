"use client";
import { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { Fade } from "react-awesome-reveal";

const AddSkill = () => {
  const [skill, setSkill] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!skill.name.trim()) {
      alert("Skill name cannot be empty!");
      return;
    }
    
    setLoading(true);
    await fetch("/api/add-skill", {
      method: "POST",
      body: JSON.stringify(skill),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);
    setSkill({ name: "", description: "" });
    alert("Skill added successfully!");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        background: "linear-gradient(135deg, #1D976C, #93F9B9)",
        color: "white",
        padding: 4,
      }}
    >
      <Fade>
        <Typography variant="h2" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Add a New Skill
        </Typography>

        <Container maxWidth="sm">
          <TextField
            label="Skill Name"
            fullWidth
            value={skill.name}
            onChange={(e) => setSkill({ ...skill, name: e.target.value })}
            margin="normal"
            sx={{
              backgroundColor: "white",
              borderRadius: "10px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1D976C" },
                "&:hover fieldset": { borderColor: "#0B875B" },
                "&.Mui-focused fieldset": { borderColor: "#0B875B" },
              },
            }}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={skill.description}
            onChange={(e) => setSkill({ ...skill, description: e.target.value })}
            margin="normal"
            sx={{
              backgroundColor: "white",
              borderRadius: "10px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1D976C" },
                "&:hover fieldset": { borderColor: "#0B875B" },
                "&.Mui-focused fieldset": { borderColor: "#0B875B" },
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              marginTop: 3,
              padding: "12px 24px",
              fontSize: "1.2rem",
              borderRadius: "30px",
              backgroundColor: "#0B875B",
              "&:hover": { backgroundColor: "#087A4F" },
            }}
          >
            {loading ? "Saving..." : "Save Skill"}
          </Button>

          <Button
            href="/my-skills"
            sx={{
              marginTop: 2,
              display: "block",
              color: "white",
              textDecoration: "underline",
              "&:hover": { color: "#C8FFD4" },
            }}
          >
            ← Back to My Skills
          </Button>
        </Container>
      </Fade>
    </Box>
  );
};

export default AddSkill;

