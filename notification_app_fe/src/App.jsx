import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import { Box, Container } from "@mui/material";

export default function App() {
  return (
    <>
      <CssBaseline />
      <Navbar />
      <Box component="main" sx={{ py: 4, minHeight: "80vh" }}>
        <Container maxWidth="lg">
          <AppRoutes />
        </Container>
      </Box>
      <Footer />
    </>
  );
}
