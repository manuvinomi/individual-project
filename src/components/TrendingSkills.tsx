import { Box, Typography, Grid, Card, CardContent, Button, Avatar } from "@mui/material";
import StarIcon from "@mui/icons-material/Star"; // Time Credit Icon
import { useRouter } from "next/navigation";
import Image from "next/image";

const trendingSkills = [
  { name: "Web Development", image: "/skills/webdev.jpg", credits: 5 },
  { name: "Graphic Design", image: "/skills/design.png", credits: 3 },
  { name: "Photography", image: "/skills/photo.png", credits: 4 },
  { name: "Cooking", image: "/skills/cooking.png", credits: 2 },
  { name: "Digital Marketing", image: "/skills/marketing.png", credits: 6 },
  { name: "Music Lessons", image: "/skills/music.png", credits: 4 },
];

export default function TrendingSkills() {
  const router = useRouter();

  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      {/* Section Title */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Trending Skills
      </Typography>

      {/* Skills Grid */}
      <Grid container spacing={4} justifyContent="center">
        {trendingSkills.map((skill, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                textAlign: "center",
                py: 3,
                px: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Skill Image Using Next.js Image Component */}
              <Box sx={{ width: 100, height: 100, position: "relative", mb: 2 }}>
                <Image
                  src={skill.image}
                  alt={skill.name}
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </Box>

              {/* Skill Name */}
              <Typography variant="h6" fontWeight="bold">
                {skill.name}
              </Typography>

              {/* Time Credit Icon & Value */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <StarIcon sx={{ color: "gold" }} />
                <Typography variant="body1" fontWeight="bold">
                  {skill.credits} Credits
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Browse All Skills Button */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/skills")}
        >
          Browse All Skills
        </Button>
      </Box>
    </Box>
  );
}

