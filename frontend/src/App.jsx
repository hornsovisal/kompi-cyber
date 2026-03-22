import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LearnPage from "./pages/LearnPage";
import LecturerLogin from "./pages/lecturer/LecturerLogin";
import LecturerForgetPassword from "./pages/lecturer/LecturerForgetPassword";
import LecturerVerifyEmail from "./pages/lecturer/LecturerVerifyEmail";
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:tab" element={<Dashboard />} />
        <Route path="/learn/:courseId" element={<LearnPage />} />
        <Route path="/learn/:courseId/:lessonId" element={<LearnPage />} />
        <Route path="/lecturer/login" element={<LecturerLogin />} />
        <Route path="/lecturer/forgot-password" element={<LecturerForgetPassword />} />
        <Route path="/lecturer/verify-email" element={<LecturerVerifyEmail />} />
        <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
      </Routes>
    </Router>
  );
}
