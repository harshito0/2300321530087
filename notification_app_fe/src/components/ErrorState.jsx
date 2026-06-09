import { Alert, Button, Box } from "@mui/material";

export default function ErrorState({ message, onRetry }) {
  return (
    <Box sx={{ py: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {message || "Something went wrong."}
      </Alert>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  );
}
