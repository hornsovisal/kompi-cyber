import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LearnPage from "./pages/LearnPage";
import ForgetPassword from "./pages/ForgetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import ViewCertificate from "./pages/ViewCertificate";
import InstructorLayout from "./components/Layout/InstructorLayout";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorLogin from "./pages/instructor/InstructorLogin";
import CreateQuiz from "./pages/instructor/CreateQuiz";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:tab" element={<Dashboard />} />
        <Route path="/learn/:courseId" element={<LearnPage />} />
        <Route path="/learn/:courseId/:lessonId" element={<LearnPage />} />
        <Route path="/certificate/:courseId" element={<ViewCertificate />} />

        {/* Instructor Routes */}
        <Route path="/instructor/login" element={<InstructorLogin />} />
        <Route
          path="/instructor/dashboard"
          element={
            <InstructorLayout>
              <InstructorDashboard />
            </InstructorLayout>
          }
        />
        <Route
          path="/instructor/create-quiz/:lessonId?"
          element={
            <InstructorLayout>
              <CreateQuiz />
            </InstructorLayout>
          }
        />
      </Routes>
    </Router>
  );
}
