import { Suspense, lazy } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DemoPortal from "./pages/DemoPortal";
import InstructorLayout from "./components/Layout/InstructorLayout";
import InstructorLogin from "./pages/instructor/InstructorLogin";

const Home = lazy(() => import("./pages/Home"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ExploreCourses = lazy(() => import("./pages/ExploreCourses"));
const LearnPage = lazy(() => import("./pages/LearnPage"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ViewCertificate = lazy(() => import("./pages/ViewCertificate"));
const StudentInvitations = lazy(() => import("./pages/StudentInvitations"));
const InstructorDashboard = lazy(() => import("./pages/instructor/InstructorDashboard"));
const CreateQuiz = lazy(() => import("./pages/instructor/CreateQuiz"));
const ManageCourses = lazy(() => import("./pages/instructor/ManageCourses"));
const ManageQuizzes = lazy(() => import("./pages/instructor/ManageQuizzes"));
const StudentPerformance = lazy(() => import("./pages/instructor/StudentPerformance"));
const Analytics = lazy(() => import("./pages/instructor/Analytics"));
const InstructorSettings = lazy(() => import("./pages/instructor/InstructorSettings"));
const StudentManagement = lazy(() => import("./pages/instructor/StudentManagement"));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
        <p className="text-sm text-slate-300">Loading interface...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<DemoPortal />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:tab" element={<Dashboard />} />
          <Route path="/explore" element={<ExploreCourses />} />
          <Route path="/learn/:courseId" element={<LearnPage />} />
          <Route path="/learn/:courseId/:lessonId" element={<LearnPage />} />
          <Route
            path="/certificate/:certificateHash"
            element={<ViewCertificate />}
          />
          <Route path="/invitations" element={<StudentInvitations />} />

          {/* Instructor Routes */}
          <Route path="/instructor" element={<Navigate to="/instructor/login" replace />} />
          <Route path="/coordinator" element={<Navigate to="/coordinator/login" replace />} />
          <Route path="/teacher" element={<Navigate to="/teacher/login" replace />} />
          <Route path="/instructor-login" element={<Navigate to="/instructor/login" replace />} />
          <Route path="/coordinator-login" element={<Navigate to="/coordinator/login" replace />} />
          <Route path="/teacher-login" element={<Navigate to="/teacher/login" replace />} />
          <Route path="/instructor/login" element={<InstructorLogin />} />
          <Route path="/coordinator/login" element={<InstructorLogin />} />
          <Route path="/teacher/login" element={<InstructorLogin />} />
          <Route
            path="/instructor/dashboard"
            element={
              <InstructorLayout>
                <InstructorDashboard />
              </InstructorLayout>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <InstructorLayout>
                <InstructorDashboard />
              </InstructorLayout>
            }
          />
          <Route
            path="/coordinator/dashboard"
            element={
              <InstructorLayout>
                <InstructorDashboard />
              </InstructorLayout>
            }
          />
          <Route
            path="/instructor/courses"
            element={
              <InstructorLayout>
                <ManageCourses />
              </InstructorLayout>
            }
          />
          <Route
            path="/coordinator/courses"
            element={
              <InstructorLayout>
                <ManageCourses />
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
            path="/coordinator/quizzes"
            element={<Navigate to="/coordinator/dashboard" replace />}
          />
          <Route
            path="/instructor/performance"
            element={
              <InstructorLayout>
                <StudentPerformance />
              </InstructorLayout>
            }
          />
          <Route
            path="/instructor/analytics"
            element={
              <InstructorLayout>
                <Analytics />
              </InstructorLayout>
            }
          />
          <Route
            path="/coordinator/analytics"
            element={
              <InstructorLayout>
                <Analytics />
              </InstructorLayout>
            }
          />
          <Route
            path="/instructor/settings"
            element={
              <InstructorLayout>
                <InstructorSettings />
              </InstructorLayout>
            }
          />
          <Route
            path="/coordinator/settings"
            element={
              <InstructorLayout>
                <InstructorSettings />
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
            path="/coordinator/create-quiz/:lessonId?"
            element={<Navigate to="/coordinator/dashboard" replace />}
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
            path="/coordinator/quizzes/:id/edit"
            element={<Navigate to="/coordinator/dashboard" replace />}
          />
          <Route
            path="/instructor/create-course"
            element={<Navigate to="/instructor/courses" replace />}
          />
          <Route
            path="/coordinator/create-course"
            element={<Navigate to="/coordinator/courses" replace />}
          />
          <Route
            path="/instructor/students"
            element={
              <InstructorLayout>
                <StudentManagement />
              </InstructorLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
