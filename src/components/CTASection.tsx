"use client";

import { Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      sx={{
        width: "100%",
        height: "300px",
        background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        color: "white",
        px: 2,
      }}
    >
      <Typography
        variant="h3"
        component={motion.h3}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8 }}
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        Ready to share your skills?
      </Typography>

      <Button
        component={motion.button}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        variant="contained"
        sx={{
          backgroundColor: "#FFD700",
          color: "#000",
          fontSize: "1.2rem",
          fontWeight: "bold",
          px: 4,
          py: 1.5,
          borderRadius: "30px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
          "&:hover": {
            backgroundColor: "#FFC107",
          },
        }}
      >
        Join Now
      </Button>
    </Box>
  );
};

export default CTASection;
