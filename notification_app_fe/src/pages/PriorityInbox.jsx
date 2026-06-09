import { useState, useMemo, useContext } from "react";
import { Box, Grid, Typography } from "@mui/material";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import NotificationCard from "../components/NotificationCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import { NotificationContext } from "../context/NotificationContext";

export default function PriorityInbox() {
  const { priorityInbox, loadingPriority, errorPriority, refreshAll } =
    useContext(NotificationContext);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (!priorityInbox) return [];
    return priorityInbox.filter((n) => {
      if (filter !== "All" && n.type !== filter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
      );
    });
  }, [priorityInbox, search, filter]);

  if (loadingPriority) return <LoadingState />;
  if (errorPriority)
    return (
      <ErrorState
        message={errorPriority.message || "Failed to load priority inbox"}
        onRetry={refreshAll}
      />
    );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Priority Inbox (Top 10)
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <SearchBar query={search} setQuery={setSearch} />
        </Box>
        <FilterPanel filter={filter} setFilter={setFilter} />
      </Box>

      {filtered.length === 0 ? (
        <Typography>No priority notifications found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((n, idx) => (
            <Grid item xs={12} sm={6} md={4} key={n.id}>
              <NotificationCard notification={{ ...n, rank: idx + 1 }} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
