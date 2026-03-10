import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RequireRole } from '../components/auth/RequireRole';
import { FullPageLoader } from '../components/ui/Loader';

const AppLayout = lazy(() => import('../layout/AppLayout'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const CompanyPage = lazy(() => import('../pages/CompanyPage'));
const UsersPage = lazy(() => import('../pages/UsersPage'));
const FinancePage = lazy(() => import('../pages/FinancePage'));
const CustomersPage = lazy(() => import('../pages/CustomersPage'));
const InventoryPage = lazy(() => import('../pages/InventoryPage'));
const AppointmentsPage = lazy(() => import('../pages/AppointmentsPage'));
const ActivityPage = lazy(() => import('../pages/ActivityPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const BackupPage = lazy(() => import('../pages/BackupPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

export const AppRouter = () => {
  return (
    <Suspense fallback={<FullPageLoader label="Loading page..." />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <RequireRole allowedRoles={['admin', 'staff']}>
                <DashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="company"
            element={
              <RequireRole allowedRoles={['admin']}>
                <CompanyPage />
              </RequireRole>
            }
          />
          <Route
            path="users"
            element={
              <RequireRole allowedRoles={['admin']}>
                <UsersPage />
              </RequireRole>
            }
          />
          <Route
            path="money"
            element={
              <RequireRole allowedRoles={['admin']}>
                <FinancePage />
              </RequireRole>
            }
          />
          <Route
            path="customers"
            element={
              <RequireRole allowedRoles={['admin']}>
                <CustomersPage />
              </RequireRole>
            }
          />
          <Route
            path="products"
            element={
              <RequireRole allowedRoles={['admin']}>
                <InventoryPage />
              </RequireRole>
            }
          />
          <Route
            path="orders"
            element={
              <RequireRole allowedRoles={['admin', 'staff']}>
                <AppointmentsPage />
              </RequireRole>
            }
          />
          <Route path="finance" element={<Navigate to="/money" replace />} />
          <Route path="inventory" element={<Navigate to="/products" replace />} />
          <Route path="appointments" element={<Navigate to="/orders" replace />} />
          <Route
            path="activity"
            element={
              <RequireRole allowedRoles={['admin']}>
                <ActivityPage />
              </RequireRole>
            }
          />
          <Route
            path="reports"
            element={
              <RequireRole allowedRoles={['admin']}>
                <ReportsPage />
              </RequireRole>
            }
          />
          <Route
            path="backup"
            element={
              <RequireRole allowedRoles={['admin']}>
                <BackupPage />
              </RequireRole>
            }
          />
          <Route
            path="settings"
            element={
              <RequireRole allowedRoles={['admin']}>
                <SettingsPage />
              </RequireRole>
            }
          />
        </Route>

        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
