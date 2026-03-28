import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import ManageQuizzes from "./pages/instructor/ManageQuizzes";
import StudentPerformance from "./pages/instructor/StudentPerformance";

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
        <Route
          path="/certificate/:certificateHash"
          element={<ViewCertificate />}
        />

        {/* Instructor Routes */}
        <Route path="/instructor" element={<Navigate to="/instructor/login" replace />} />
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
        <Route 
          path="/instructor/quizzes" 
          element={
            <InstructorLayout>
              <ManageQuizzes />
            </InstructorLayout>
          } 
        />
        <Route 
          path="/instructor/quizzes/:id/edit" 
          element={
            <InstructorLayout>
              <CreateQuiz />
            </InstructorLayout>
          } 
        />
        <Route 
          path="/instructor/performance" 
          element={
            <InstructorLayout>
              <StudentPerformance />
            </InstructorLayout>
          } 
        />

        {/* Temporary mapped routes to avoid blank page from sidebar links */}
        <Route 
          path="/instructor/courses" 
          element={
            <InstructorLayout>
              <InstructorDashboard />
            </InstructorLayout>
          } 
        />
        <Route 
          path="/instructor/settings" 
          element={
            <InstructorLayout>
              <InstructorDashboard />
            </InstructorLayout>
          } 
        />

        {/* Global fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
