import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function NotFound() {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h3" gutterBottom>
        404 – Page Not Found
      </Typography>
      <Typography variant="body1" gutterBottom>
        The page you are looking for does not exist.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Go Home
      </Button>
    </Box>
  );
}
