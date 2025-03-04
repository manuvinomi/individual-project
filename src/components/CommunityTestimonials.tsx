import { Box, Typography, Card, CardContent, Avatar, Rating } from "@mui/material";
import Slider from "react-slick"; // Carousel Effect
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Sample Testimonial Data
const testimonials = [
  {
    name: "Emily Johnson",
    image: "/users/emily.jpg",
    review: "This platform helped me connect with amazing people and exchange skills seamlessly!",
    rating: 5,
  },
  {
    name: "Michael Smith",
    image: "/users/michael.jpg",
    review: "A wonderful experience! I learned graphic design while offering my coding skills.",
    rating: 4,
  },
  {
    name: "Sophia Lee",
    image: "/users/sophia.jpg",
    review: "A great initiative! The time credit system is innovative and practical.",
    rating: 5,
  },
  {
    name: "Daniel Brown",
    image: "/users/daniel.jpg",
    review: "I was able to teach photography and earn valuable skills in return!",
    rating: 4.5,
  },
  {
    name: "Chris Adams",
    image: "/users/chris.jpg",
    review: "An excellent platform to exchange knowledge and grow together!",
    rating: 5,
  },
];

// Slick Carousel Settings
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 3, // Show 3 reviews at a time
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  centerMode: false, // Avoid unnecessary space
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2, // Show 2 slides on medium screens
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1, // Show 1 slide on mobile
      },
    },
  ],
};

export default function CommunityTestimonials() {
    return (
      <Box sx={{ textAlign: "center", py: 8, bgcolor: "#f4f6f8" }}> {/* Softer background */}
        {/* Section Title */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Community Testimonials
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Hear from people who have benefited from our platform.
        </Typography>
  
        {/* Testimonial Carousel */}
        <Box sx={{ maxWidth: "90%", mx: "auto", mt: 4 }}>
          <Slider {...sliderSettings}>
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                sx={{
                  p: 3,
                  mx: 2,
                  textAlign: "center",
                  borderRadius: 3,
                  boxShadow: 2,
                  height: "100%", // Makes sure all cards have equal height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  bgcolor: "white", // Makes background clear
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* User Profile Image */}
                  <Avatar
                    src={testimonial.image}
                    alt={testimonial.name}
                    sx={{ width: 70, height: 70, mx: "auto", mb: 2, bgcolor: "#e0e0e0" }} // Softer background
                  />
  
                  {/* Review Text */}
                  <Typography variant="body1" fontStyle="italic" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    "{testimonial.review}"
                  </Typography>
  
                  {/* Star Rating */}
                  <Rating value={testimonial.rating} precision={0.5} readOnly />
  
                  {/* User Name */}
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, color: "#333" }}>
                    {testimonial.name}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Slider>
        </Box>
      </Box>
    );
  }
  