import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import ToolDetailPage from './pages/ToolDetailPage';
import AboutPage from './pages/AboutPage';
import BeginnerGuidePage from './pages/BeginnerGuidePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import AdminUploadTools from './pages/AdminUploadTools';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToolsProvider } from './context/ToolsContext';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import TolzyProjectsPage from './pages/TolzyProjectsPage';
import UpdatesPage from './pages/UpdatesPage';
import TolzyAIChat from './components/chat/TolzyAIChat';
import TolzyLearnPage from './pages/TolzyLearnPage';
import TolzyCoursePlayerPage from './pages/TolzyCoursePlayerPage';
import TolzyLearnAdminPage from './pages/admin/TolzyLearnAdminPage';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToolsProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/tools/:id" element={<ToolDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />
                <Route path="/guide" element={<BeginnerGuidePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/projects" element={<TolzyProjectsPage />} />
                <Route path="/updates" element={<UpdatesPage />} />
                <Route path="/tolzy-learn" element={<TolzyLearnPage />} />
                <Route path="/tolzy-learn/course/:courseId" element={<TolzyCoursePlayerPage />} />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/upload-tools"
                  element={
                    <AdminRoute>
                      <AdminUploadTools />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/tolzy-learn"
                  element={
                    <AdminRoute>
                      <TolzyLearnAdminPage />
                    </AdminRoute>
                  }
                />
              </Routes>

              {/* Tolzy AI Chat - Available on all pages */}
              <TolzyAIChat />
            </Router>
          </ToolsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;