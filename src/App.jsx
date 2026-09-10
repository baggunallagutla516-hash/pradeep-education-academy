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
import { AdminEducatorsPage } from './pages/admin/AdminEducatorsPage';
import { AdminEducatorDetailPage } from './pages/admin/AdminEducatorDetailPage';
import { AdminEducatorEditPage } from './pages/admin/AdminEducatorEditPage';
import { AdminNewsPage } from './pages/admin/AdminNewsPage';
import { AdminWorksheetsPage } from './pages/admin/AdminWorksheetsPage';
import { AdminWorksheetFormPage } from './pages/admin/AdminWorksheetFormPage';
import { AdminUnitTestsPage } from './pages/admin/AdminUnitTestsPage';
import { AdminUnitTestFormPage } from './pages/admin/AdminUnitTestFormPage';
import { AdminCetsPage } from './pages/admin/AdminCetsPage';
import { AdminCetFormPage } from './pages/admin/AdminCetFormPage';
import { AdminAssessmentsPage } from './pages/admin/AdminAssessmentsPage';
import { AdminAssessmentFormPage } from './pages/admin/AdminAssessmentFormPage';
import { AdminAssessmentResultsPage } from './pages/admin/AdminAssessmentResultsPage';
import { AdminDppsPage } from './pages/admin/AdminDppsPage';
import { AdminDppFormPage } from './pages/admin/AdminDppFormPage';
import { AdminDppResultsPage } from './pages/admin/AdminDppResultsPage';
import { AdminSlipTestsPage } from './pages/admin/AdminSlipTestsPage';
import { AdminSlipTestFormPage } from './pages/admin/AdminSlipTestFormPage';
import { AdminSlipTestResultsPage } from './pages/admin/AdminSlipTestResultsPage';
import { AdminContactQueriesPage } from './pages/admin/AdminContactQueriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { WorksheetsPage } from './pages/WorksheetsPage';
import { UnitTestsPage } from './pages/UnitTestsPage';
import { CetsPage } from './pages/CetsPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AssessmentAttemptPage } from './pages/AssessmentAttemptPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { DppsPage } from './pages/DppsPage';
import { DppAttemptPage } from './pages/DppAttemptPage';
import { DppResultPage } from './pages/DppResultPage';
import { SlipTestsPage } from './pages/SlipTestsPage';
import { SlipTestAttemptPage } from './pages/SlipTestAttemptPage';
import { SlipTestResultPage } from './pages/SlipTestResultPage';
import { ParentLoginPage } from './pages/parent/ParentLoginPage';
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ParentChildrenPage } from './pages/parent/ParentChildrenPage';
import { ParentChildDetailPage } from './pages/parent/ParentChildDetailPage';
import { ParentAccountPage } from './pages/parent/ParentAccountPage';
import { EducatorLoginPage } from './pages/educator/EducatorLoginPage';
import { EducatorRegisterPage } from './pages/educator/EducatorRegisterPage';
import { EducatorDashboardPage } from './pages/educator/EducatorDashboardPage';
import { EducatorWorksheetsPage } from './pages/educator/EducatorWorksheetsPage';
import { EducatorUnitTestsPage } from './pages/educator/EducatorUnitTestsPage';
import { EducatorCetsPage } from './pages/educator/EducatorCetsPage';
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
                  <Route path="unit-tests" element={<UnitTestsPage />} />
                  <Route path="cets" element={<CetsPage />} />
                  <Route path="assessments" element={<AssessmentsPage />} />
                  <Route path="assessments/:id/attempt" element={<AssessmentAttemptPage />} />
                  <Route path="assessments/:id/result" element={<AssessmentResultPage />} />
                  <Route path="dpps" element={<DppsPage />} />
                  <Route path="dpps/:id/attempt" element={<DppAttemptPage />} />
                  <Route path="dpps/:id/result" element={<DppResultPage />} />
                  <Route path="slip-tests" element={<SlipTestsPage />} />
                  <Route path="slip-tests/:id/attempt" element={<SlipTestAttemptPage />} />
                  <Route path="slip-tests/:id/result" element={<SlipTestResultPage />} />
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
                  <Route path="educator/unit-tests" element={<EducatorUnitTestsPage />} />
                  <Route path="educator/cets" element={<EducatorCetsPage />} />
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
                  <Route path="educators" element={<AdminEducatorsPage />} />
                  <Route path="educators/:id" element={<AdminEducatorDetailPage />} />
                  <Route path="educators/:id/edit" element={<AdminEducatorEditPage />} />
                  <Route path="worksheets" element={<AdminWorksheetsPage />} />
                  <Route path="worksheets/new" element={<AdminWorksheetFormPage />} />
                  <Route path="worksheets/:id/edit" element={<AdminWorksheetFormPage />} />
                  <Route path="unit-tests" element={<AdminUnitTestsPage />} />
                  <Route path="unit-tests/new" element={<AdminUnitTestFormPage />} />
                  <Route path="unit-tests/:id/edit" element={<AdminUnitTestFormPage />} />
                  <Route path="cets" element={<AdminCetsPage />} />
                  <Route path="cets/new" element={<AdminCetFormPage />} />
                  <Route path="cets/:id/edit" element={<AdminCetFormPage />} />
                  <Route path="assessments" element={<AdminAssessmentsPage />} />
                  <Route path="assessments/new" element={<AdminAssessmentFormPage />} />
                  <Route path="assessments/:id/edit" element={<AdminAssessmentFormPage />} />
                  <Route path="assessments/:id/results" element={<AdminAssessmentResultsPage />} />
                  <Route path="dpps" element={<AdminDppsPage />} />
                  <Route path="dpps/new" element={<AdminDppFormPage />} />
                  <Route path="dpps/:id/edit" element={<AdminDppFormPage />} />
                  <Route path="dpps/:id/results" element={<AdminDppResultsPage />} />
                  <Route path="slip-tests" element={<AdminSlipTestsPage />} />
                  <Route path="slip-tests/new" element={<AdminSlipTestFormPage />} />
                  <Route path="slip-tests/:id/edit" element={<AdminSlipTestFormPage />} />
                  <Route path="slip-tests/:id/results" element={<AdminSlipTestResultsPage />} />
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
