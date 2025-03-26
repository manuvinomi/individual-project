"use client";
import { useEffect, useState } from "react";
import { Typography, TextField, Button, Avatar, Box, Container } from "@mui/material";

const Profile = () => {
  const [user, setUser] = useState<{ name: string; email: string; profilePic: string; bio: string } | null>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  const handleUpdate = () => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      alert("Profile updated successfully!");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ff758c, #ff7eb3)",
        color: "white",
        padding: 4,
      }}
    >
      {user ? (
        <>
          {/* Profile Picture */}
          <Avatar
            src={user.profilePic || "/user-placeholder.png"}
            sx={{
              width: 130,
              height: 130,
              marginBottom: 2,
              border: "3px solid white",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            }}
          />

          {/* Profile Fields Directly on Background */}
          <Typography variant="h3" sx={{ fontWeight: "bold", marginBottom: 3 }}>
            {user.name}
          </Typography>

          <TextField
            variant="standard"
            placeholder="Full Name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            InputProps={{
              disableUnderline: false,
              sx: {
                fontSize: "1.5rem",
                color: "white",
                width: "50%",
                textAlign: "center",
                "& input": {
                  textAlign: "center",
                  color: "white",
                  borderBottom: "2px solid white",
                  transition: "0.3s",
                },
                "& input:focus": {
                  borderBottom: "2px solid #fff",
                  boxShadow: "0 2px 10px rgba(255,255,255,0.5)",
                },
              },
            }}
          />

          <TextField
            variant="standard"
            placeholder="Email"
            value={user.email}
            disabled
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: "1.2rem",
                color: "white",
                width: "50%",
                textAlign: "center",
                opacity: 0.7,
              },
            }}
          />

          <TextField
            variant="standard"
            placeholder="Bio (Write about yourself...)"
            value={user.bio}
            onChange={(e) => setUser({ ...user, bio: e.target.value })}
            multiline
            rows={2}
            InputProps={{
              disableUnderline: false,
              sx: {
                fontSize: "1.2rem",
                color: "white",
                width: "50%",
                textAlign: "center",
                "& textarea": {
                  textAlign: "center",
                  color: "white",
                  borderBottom: "2px solid white",
                  transition: "0.3s",
                },
                "& textarea:focus": {
                  borderBottom: "2px solid #fff",
                  boxShadow: "0 2px 10px rgba(255,255,255,0.5)",
                },
              },
            }}
          />

          <Button
            variant="outlined"
            sx={{
              marginTop: 3,
              borderRadius: "30px",
              padding: "12px 24px",
              borderColor: "white",
              color: "white",
              "&:hover": {
                backgroundColor: "white",
                color: "#ff758c",
              },
            }}
            onClick={handleUpdate}
          >
            Save Changes
          </Button>
        </>
      ) : (
        <Typography variant="h5">Loading profile...</Typography>
      )}
    </Box>
  );
};

export default Profile;


