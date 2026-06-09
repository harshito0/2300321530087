import { Card, CardContent, Typography, Chip, Stack } from "@mui/material";

export default function NotificationCard({ notification }) {
  const { type, message, timestamp, read, calculatedPriorityScore, rank } =
    notification;

  // Format timestamp without date-fns to avoid extra dependency
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleString()
    : "";

  const colorMap = {
    Placement: "primary",
    Result: "secondary",
    Event: "default",
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            label={type}
            color={colorMap[type] ?? "default"}
            size="small"
          />
          {read !== undefined && (
            <Chip
              label={read ? "Read" : "Unread"}
              size="small"
              color={read ? "default" : "success"}
            />
          )}
          {rank && <Chip label={`#${rank}`} size="small" color="info" />}
        </Stack>

        <Typography variant="body1" sx={{ mb: 1 }}>
          {message}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {timeStr}
        </Typography>

        {calculatedPriorityScore !== undefined && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            | Score: {calculatedPriorityScore}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
