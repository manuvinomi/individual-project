"use client";
import { useState } from "react";
import { Typography, TextField, Button, Box, Input } from "@mui/material";

const AddSkill = () => {
  const [skill, setSkill] = useState({ name: "", description: "", image: "" });

  const handleChange = (e: any) => {
    setSkill({ ...skill, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSkill({ ...skill, image: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = () => {
    fetch("/api/add-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skill),
    })
      .then((res) => res.json())
      .then(() => alert("Skill added successfully!"));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e, #16213e)", // Dark Blue Background
        color: "white",
        padding: 4,
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: "bold", marginBottom: 3 }}>
        Add New Skill
      </Typography>

      <Box sx={{ width: "50%", textAlign: "center" }}>
        <TextField
          variant="standard"
          name="name"
          placeholder="Skill Name"
          value={skill.name}
          onChange={handleChange}
          fullWidth
          sx={{
            "& input": {
              color: "white",
              borderBottom: "2px solid #e94560", // Red Highlight
            },
          }}
        />

        <TextField
          variant="standard"
          name="description"
          placeholder="Skill Description"
          value={skill.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
          sx={{
            marginTop: "20px",
            "& textarea": {
              color: "white",
              borderBottom: "2px solid #e94560",
            },
          }}
        />

        <Button
          variant="contained"
          component="label"
          sx={{
            marginTop: 3,
            backgroundColor: "#e94560",
            color: "white",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#ff6b81" }, // Light red hover effect
          }}
        >
          Upload Image
          <input type="file" hidden onChange={handleImageUpload} />
        </Button>

        {skill.image && (
          <Box sx={{ marginTop: 2 }}>
            <img
              src={skill.image}
              alt="Skill Preview"
              width="120px"
              style={{
                borderRadius: "15px",
                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
              }}
            />
          </Box>
        )}

        <Button
          variant="outlined"
          sx={{
            marginTop: 3,
            borderRadius: "30px",
            padding: "12px 24px",
            borderColor: "#e94560",
            color: "#e94560",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#e94560",
              color: "white",
            },
          }}
          onClick={handleSubmit}
        >
          Add Skill
        </Button>
      </Box>
    </Box>
  );
};

export default AddSkill;





