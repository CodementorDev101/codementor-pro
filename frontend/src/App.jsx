// ✅ UPDATED: Added ForgotPassword and ResetPassword routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ExerciseDetail from './pages/ExerciseDetail';
import CreateExercise from './pages/CreateExercise';
import EditExercise from './pages/EditExercise';
import Submissions from './pages/SubmissionHistory';
import SubmissionDetail from './pages/SubmissionDetail';
import Profile from './pages/Profile';
import AdminUserManagement from './pages/AdminUserManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorClasses from './pages/InstructorClasses';
import StudentClasses from './pages/StudentClasses';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}>
        <p style={{ color: '#ffffff' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Instructor/Admin Only Route
const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}>
        <p style={{ color: '#ffffff' }}>Loading...</p>
      </div>
    );
  }

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Student Only Route
const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}>
        <p style={{ color: '#ffffff' }}>Loading...</p>
      </div>
    );
  }

  if (user?.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin Only Route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}>
        <p style={{ color: '#ffffff' }}>Loading...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast Notification Component */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(30, 41, 59, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(34, 197, 94, 0.3)',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
            },
            loading: {
              iconTheme: {
                primary: '#fbbf24',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(251, 191, 36, 0.3)',
              },
            },
          }}
        />

        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile route - accessible to all authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exercise/:id"
            element={
              <ProtectedRoute>
                <ExerciseDetail />
              </ProtectedRoute>
            }
          />

          {/* Student Only Routes */}
          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <StudentRoute>
                  <Submissions />
                </StudentRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/submission/:id"
            element={
              <ProtectedRoute>
                <StudentRoute>
                  <SubmissionDetail />
                </StudentRoute>
              </ProtectedRoute>
            }
          />

          {/* Instructor/Admin Only Routes */}
          <Route
            path="/create-exercise"
            element={
              <ProtectedRoute>
                <InstructorRoute>
                  <CreateExercise />
                </InstructorRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-exercise/:id"
            element={
              <ProtectedRoute>
                <InstructorRoute>
                  <EditExercise />
                </InstructorRoute>
              </ProtectedRoute>
            }
          />

          {/* Instructor Dashboard Route */}
          <Route
            path="/instructor-dashboard"
            element={
              <ProtectedRoute>
                <InstructorRoute>
                  <InstructorDashboard />
                </InstructorRoute>
              </ProtectedRoute>
            }
          />

          {/* Instructor Classes Route */}
          <Route
            path="/instructor-classes"
            element={
              <ProtectedRoute>
                <InstructorRoute>
                  <InstructorClasses />
                </InstructorRoute>
              </ProtectedRoute>
            }
          />

          {/* Student Classes Route */}
          <Route
            path="/my-classes"
            element={
              <ProtectedRoute>
                <StudentRoute>
                  <StudentClasses />
                </StudentRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminUserManagement />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Analytics Dashboard Route */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AnalyticsDashboard />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;