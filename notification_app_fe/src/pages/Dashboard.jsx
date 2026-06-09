import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { useContext, useMemo } from "react";
import { NotificationContext } from "../context/NotificationContext";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Dashboard() {
  const {
    allNotifications,
    loadingAll,
    errorAll,
    priorityInbox,
    loadingPriority,
    errorPriority,
  } = useContext(NotificationContext);

  const stats = useMemo(() => {
    if (!allNotifications?.length) return null;
    const unread = allNotifications.filter((n) => !n.read);
    const placement = allNotifications.filter((n) => n.type === "Placement");
    const result = allNotifications.filter((n) => n.type === "Result");
    const event = allNotifications.filter((n) => n.type === "Event");
    const latest = allNotifications.reduce(
      (prev, cur) =>
        new Date(cur.timestamp) > new Date(prev.timestamp) ? cur : prev,
      allNotifications[0]
    );
    return {
      total: allNotifications.length,
      unread: unread.length,
      placement: placement.length,
      result: result.length,
      event: event.length,
      latest,
    };
  }, [allNotifications]);

  if (loadingAll || loadingPriority) return <LoadingState />;
  if (errorAll)
    return <ErrorState message={errorAll.message || "Failed to load notifications"} />;
  if (!stats)
    return (
      <Typography sx={{ textAlign: "center", py: 4 }}>
        No notifications yet. Start the backend and refresh.
      </Typography>
    );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Unread</Typography>
              <Typography variant="h4">{stats.unread}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Placement</Typography>
              <Typography variant="h4">{stats.placement}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Result</Typography>
              <Typography variant="h4">{stats.result}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Event</Typography>
              <Typography variant="h4">{stats.event}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Latest Notification</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1">
                  {stats.latest?.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(stats.latest?.timestamp).toLocaleString()} –{" "}
                  {stats.latest?.type}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
