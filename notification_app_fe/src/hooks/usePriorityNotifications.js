import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

/**
 * Fetches priority notifications (top‑10) from the backend.
 * Returns { data, loading, error, refetch }.
 */
export default function usePriorityNotifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/priority-notifications");
      setData(res.data.notifications ?? []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
