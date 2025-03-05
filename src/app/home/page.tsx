"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/HowItWorks";
import TrendingSkills from "@/components/TrendingSkills";
import CommunityTestimonials from "@/components/CommunityTestimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <Box>
      {/* Reusable Navbar Component */}
      <Navbar />

      {/* Reusable Hero Section */}
      <Hero />

      {/* Other Sections */}
      <HowItWorks />
      <TrendingSkills />
      <CommunityTestimonials />
      <CTASection />
      <Footer />
    </Box>
  );
}

