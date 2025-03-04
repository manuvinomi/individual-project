import { Box, Typography, IconButton, Stack, Link } from "@mui/material";
import { Facebook, Twitter, LinkedIn } from "@mui/icons-material";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <Box
      component={motion.footer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      sx={{
        width: "100%",
        background: "#1A1A2E",
        color: "white",
        textAlign: "center",
        py: 4,
        mt: 4,
      }}
    >
      {/* Quick Links */}
      <Stack direction="row" justifyContent="center" spacing={3} mb={2}>
        {["Home", "About", "Contact", "FAQs"].map((text) => (
          <Link
            key={text}
            href={`/${text.toLowerCase()}`}
            sx={{
              color: "#FFD700",
              textDecoration: "none",
              fontSize: "1.1rem",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {text}
          </Link>
        ))}
      </Stack>

      {/* Social Media Icons */}
      <Stack direction="row" justifyContent="center" spacing={2} mb={2}>
        {[Facebook, Twitter, LinkedIn].map((Icon, index) => (
          <IconButton
            key={index}
            component={motion.button}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            <Icon />
          </IconButton>
        ))}
      </Stack>

      {/* Copyright Text */}
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        © 2025 Skill Exchange Platform
      </Typography>
    </Box> // ✅ Closing tag for Box
  );
};

export default Footer;
