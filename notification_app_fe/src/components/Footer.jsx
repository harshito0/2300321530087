import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 2, bgcolor: "background.paper", mt: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Campus Notifications Dashboard
        </Typography>
      </Container>
    </Box>
  );
}
