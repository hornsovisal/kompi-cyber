import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LearnPage from "./pages/LearnPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learn/:courseId" element={<LearnPage />} />
        <Route path="/learn/:courseId/:lessonId" element={<LearnPage />} />
      </Routes>
    </Router>
  );
}
