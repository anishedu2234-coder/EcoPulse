import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { Footer } from './components/layout/Footer';

// Lazy loaded page components for bundle size optimization
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const ActivityForm = React.lazy(() => import('./components/ActivityForm').then(m => ({ default: m.ActivityForm })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Onboarding = React.lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Challenges = React.lazy(() => import('./pages/Challenges').then(m => ({ default: m.Challenges })));
const Insights = React.lazy(() => import('./pages/Insights').then(m => ({ default: m.Insights })));
const Analytics = React.lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Privacy = React.lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = React.lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Support = React.lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));
const Documentation = React.lazy(() => import('./pages/Documentation').then(m => ({ default: m.Documentation })));

// Loading spinner fallback that matches the premium aesthetic
const LoadingFallback = () => (
  <div className="flex-grow flex flex-col justify-center items-center py-20 text-[#1a1a1a]">
    <span className="material-symbols-outlined text-4xl animate-spin text-[#2d3b28] mb-4">auto_stories</span>
    <p className="font-sans font-medium text-sm uppercase tracking-wider text-[#a3a3a3]">Drawing next chapter...</p>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/onboarding'].includes(location.pathname);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-lg antialiased relative overflow-hidden">
      {/* Ambient background decoration blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-[#C8DAD8]/40 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] aspect-square rounded-full bg-[#004030]/8 blur-[140px] pointer-events-none z-0"></div>
      
      {!isAuthPage && <TopNav />}
      
      {/* Main Content Area */}
      <div className="flex-grow w-full max-w-grid_max_width mx-auto flex flex-col relative z-10">
        {children}
      </div>
      
      {!isAuthPage && <Footer />}
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/log" element={<ProtectedRoute><ActivityForm /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
