import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

/**
 * Fetches all notifications from the backend.
 * Returns { data, loading, error, refetch }.
 */
export default function useNotifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/evaluation-service/notifications");
      setData(res.data);
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
