"use client";
import { useEffect, useState } from "react";
import { Typography, Button, Box } from "@mui/material";
import { Fade } from "react-awesome-reveal";

const TimeCredits = () => {
  const [transactions, setTransactions] = useState<{ description: string; amount: number; date?: string }[]>([]);

  useEffect(() => {
    fetch("/api/time-credits")
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch((error) => console.error("Error fetching transactions:", error));
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
        background: "linear-gradient(135deg, #0072ff, #00c6ff)",
        color: "white",
        padding: 4,
      }}
    >
      <Fade>
        <Typography variant="h2" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Time Credit Transactions
        </Typography>

        {transactions.length === 0 ? (
          <Typography variant="h5" sx={{ opacity: 0.8 }}>No transactions found.</Typography>
        ) : (
          <Box sx={{ marginTop: 3 }}>
            {transactions.map((tx, index) => (
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
                🔄 {tx.description} - <span style={{ fontSize: "1.2rem" }}> {tx.amount} hrs</span>
              </Typography>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          color="secondary"
          href="/my-skills"
          sx={{
            marginTop: 4,
            padding: "12px 24px",
            fontSize: "1.2rem",
            borderRadius: "30px",
            backgroundColor: "#0072ff",
            "&:hover": { backgroundColor: "#00a6ff" },
          }}
        >
          Earn More Credits
        </Button>
      </Fade>
    </Box>
  );
};

export default TimeCredits;

