// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Notifications from "../pages/Notifications";
import PriorityInbox from "../pages/PriorityInbox";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/priority" element={<PriorityInbox />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
