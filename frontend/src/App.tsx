// frontend/src/App.tsx
// Main application with React Router and role-based routing

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';

// Associate pages
import { AssociateDashboard } from './pages/associate/AssociateDashboard';
import { AvailabilityPage } from './pages/associate/AvailabilityPage';

// Manager pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { TeamManagementPage } from './pages/manager/TeamManagementPage';
import { UnassignedPoolPage } from './pages/manager/UnassignedPoolPage';
import { RosterBuilderPage } from './pages/manager/RosterBuilderPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { TeamGovernancePage } from './pages/admin/TeamGovernancePage';

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case 'SUPERADMIN':
      return <Navigate to="/admin" replace />;
    case 'MANAGER':
      return <Navigate to="/manager" replace />;
    case 'ASSOCIATE':
    default:
      return <Navigate to="/associate" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Associate routes */}
        <Route
          path="/associate"
          element={
            <ProtectedRoute allowedRoles={['ASSOCIATE', 'MANAGER', 'SUPERADMIN']}>
              <Layout>
                <AssociateDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/associate/shifts"
          element={
            <ProtectedRoute allowedRoles={['ASSOCIATE', 'MANAGER', 'SUPERADMIN']}>
              <Layout>
                <AssociateDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/associate/availability"
          element={
            <ProtectedRoute allowedRoles={['ASSOCIATE', 'MANAGER', 'SUPERADMIN']}>
              <Layout>
                <AvailabilityPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Manager routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'SUPERADMIN']}>
              <Layout>
                <ManagerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/roster"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'SUPERADMIN']}>
              <Layout>
                <RosterBuilderPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/team"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'SUPERADMIN']}>
              <Layout>
                <TeamManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/pool"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'SUPERADMIN']}>
              <Layout>
                <UnassignedPoolPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <Layout>
                <UserManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <Layout>
                <TeamGovernancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <Layout>
                <UserManagementPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
