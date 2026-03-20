/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LocationPermission from "./pages/LocationPermission";
import Login from "./pages/Login";
import Chatbot from "./pages/Chatbot";
import TrackComplaint from "./pages/TrackComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import Feedback from "./pages/Feedback";
import ComplaintHistory from "./pages/ComplaintHistory";
import NotificationManager from "./components/NotificationManager";

export default function App() {
  return (
    <Router>
      <NotificationManager />
      <Routes>
        <Route path="/" element={<LocationPermission />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/history" element={<ComplaintHistory />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
