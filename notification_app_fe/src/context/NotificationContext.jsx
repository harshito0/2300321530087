import React, { createContext, useCallback } from "react";
import useNotifications from "../hooks/useNotifications";
import usePriorityNotifications from "../hooks/usePriorityNotifications";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const {
    data: allNotifications,
    loading: loadingAll,
    error: errorAll,
    refetch: refetchAll
  } = useNotifications();

  const {
    data: priorityInbox,
    loading: loadingPriority,
    error: errorPriority,
    refetch: refetchPriority
  } = usePriorityNotifications();

  const refreshAll = useCallback(() => {
    refetchAll();
    refetchPriority();
  }, [refetchAll, refetchPriority]);

  return (
    <NotificationContext.Provider
      value={{
        allNotifications,
        loadingAll,
        errorAll,
        priorityInbox,
        loadingPriority,
        errorPriority,
        refreshAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => React.useContext(NotificationContext);
