import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ParentAuthProvider } from './context/ParentAuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { StudentLayout } from './components/layout/StudentLayout';
import {
  AdminGuestRoute,
  AdminLayout,
  AdminProtectedRoute,
} from './components/admin/AdminLayout';
import {
  ParentGuestRoute,
  ParentLayout,
  ParentProtectedRoute,
} from './components/parent/ParentLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountPage } from './pages/AccountPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminStudentDetailPage } from './pages/admin/AdminStudentDetailPage';
import { AdminPostsPage } from './pages/admin/AdminPostsPage';
import { AdminPostFormPage } from './pages/admin/AdminPostFormPage';
import { AdminNewsPage } from './pages/admin/AdminNewsPage';
import { AdminWorksheetsPage } from './pages/admin/AdminWorksheetsPage';
import { AdminWorksheetFormPage } from './pages/admin/AdminWorksheetFormPage';
import { AdminContactQueriesPage } from './pages/admin/AdminContactQueriesPage';
import { WorksheetsPage } from './pages/WorksheetsPage';
import { ParentLoginPage } from './pages/parent/ParentLoginPage';
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ParentChildrenPage } from './pages/parent/ParentChildrenPage';
import { ParentChildDetailPage } from './pages/parent/ParentChildDetailPage';
import { ParentAccountPage } from './pages/parent/ParentAccountPage';

export default function App() {
  return (
    <AuthProvider>
      <ParentAuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />

                <Route
                  path="login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />

                <Route
                  path="parent/login"
                  element={
                    <ParentGuestRoute>
                      <ParentLoginPage />
                    </ParentGuestRoute>
                  }
                />
                <Route path="parent/register" element={<Navigate to="/parent/login" replace />} />

                <Route
                  path="posts/:id"
                  element={
                    <ProtectedRoute>
                      <PostDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="worksheets" element={<WorksheetsPage />} />
                <Route path="account" element={<AccountPage />} />
              </Route>

              <Route
                element={
                  <ParentProtectedRoute>
                    <ParentLayout />
                  </ParentProtectedRoute>
                }
              >
                <Route path="parent/dashboard" element={<ParentDashboardPage />} />
                <Route path="parent/children" element={<ParentChildrenPage />} />
                <Route path="parent/children/:studentId" element={<ParentChildDetailPage />} />
                <Route path="parent/link" element={<Navigate to="/parent/dashboard" replace />} />
                <Route path="parent/account" element={<ParentAccountPage />} />
              </Route>

              <Route
                path="admin/login"
                element={
                  <AdminGuestRoute>
                    <AdminLoginPage />
                  </AdminGuestRoute>
                }
              />

              <Route
                path="admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="students/:id" element={<AdminStudentDetailPage />} />
                <Route path="posts" element={<AdminPostsPage />} />
                <Route path="posts/new" element={<AdminPostFormPage />} />
                <Route path="posts/:id/edit" element={<AdminPostFormPage />} />
                <Route path="worksheets" element={<AdminWorksheetsPage />} />
                <Route path="worksheets/new" element={<AdminWorksheetFormPage />} />
                <Route path="worksheets/:id/edit" element={<AdminWorksheetFormPage />} />
                <Route path="news" element={<AdminNewsPage />} />
                <Route path="contact-queries" element={<AdminContactQueriesPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </ParentAuthProvider>
    </AuthProvider>
  );
}
