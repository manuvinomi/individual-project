"use client";
import { Fab, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const FloatingActionButton = () => {
  return (
    <Tooltip title="Add New Request">
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => alert("New request feature coming soon!")}
      >
        <AddIcon />
      </Fab>
    </Tooltip>
  );
};

export default FloatingActionButton;
