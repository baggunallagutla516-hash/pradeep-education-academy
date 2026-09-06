import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ParentAuthProvider } from './context/ParentAuthContext';
import { EducatorAuthProvider } from './context/EducatorAuthContext';
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
import {
  EducatorGuestRoute,
  EducatorLayout,
  EducatorProtectedRoute,
} from './components/educator/EducatorLayout';
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
import { AdminStudentEditPage } from './pages/admin/AdminStudentEditPage';
import { AdminNewsPage } from './pages/admin/AdminNewsPage';
import { AdminWorksheetsPage } from './pages/admin/AdminWorksheetsPage';
import { AdminWorksheetFormPage } from './pages/admin/AdminWorksheetFormPage';
import { AdminContactQueriesPage } from './pages/admin/AdminContactQueriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { WorksheetsPage } from './pages/WorksheetsPage';
import { ParentLoginPage } from './pages/parent/ParentLoginPage';
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ParentChildrenPage } from './pages/parent/ParentChildrenPage';
import { ParentChildDetailPage } from './pages/parent/ParentChildDetailPage';
import { ParentAccountPage } from './pages/parent/ParentAccountPage';
import { EducatorLoginPage } from './pages/educator/EducatorLoginPage';
import { EducatorRegisterPage } from './pages/educator/EducatorRegisterPage';
import { EducatorDashboardPage } from './pages/educator/EducatorDashboardPage';
import { EducatorWorksheetsPage } from './pages/educator/EducatorWorksheetsPage';
import { EducatorAccountPage } from './pages/educator/EducatorAccountPage';

export default function App() {
  return (
    <AuthProvider>
      <ParentAuthProvider>
        <EducatorAuthProvider>
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
                    path="educator/login"
                    element={
                      <EducatorGuestRoute>
                        <EducatorLoginPage />
                      </EducatorGuestRoute>
                    }
                  />
                  <Route
                    path="educator/register"
                    element={
                      <EducatorGuestRoute>
                        <EducatorRegisterPage />
                      </EducatorGuestRoute>
                    }
                  />

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
                  element={
                    <EducatorProtectedRoute>
                      <EducatorLayout />
                    </EducatorProtectedRoute>
                  }
                >
                  <Route path="educator/dashboard" element={<EducatorDashboardPage />} />
                  <Route path="educator/worksheets" element={<EducatorWorksheetsPage />} />
                  <Route path="educator/account" element={<EducatorAccountPage />} />
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
                  <Route path="students/:id/edit" element={<AdminStudentEditPage />} />
                  <Route path="worksheets" element={<AdminWorksheetsPage />} />
                  <Route path="worksheets/new" element={<AdminWorksheetFormPage />} />
                  <Route path="worksheets/:id/edit" element={<AdminWorksheetFormPage />} />
                  <Route path="news" element={<AdminNewsPage />} />
                  <Route path="contact-queries" element={<AdminContactQueriesPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AdminAuthProvider>
        </EducatorAuthProvider>
      </ParentAuthProvider>
    </AuthProvider>
  );
}
