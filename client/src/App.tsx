import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { Footer } from './components/layout/Footer';
import { Dashboard } from './components/Dashboard';
import { ActivityForm } from './components/ActivityForm';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { Challenges } from './pages/Challenges';
import { Insights } from './pages/Insights';
import { Analytics } from './pages/Analytics';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Support } from './pages/Support';
import { Documentation } from './pages/Documentation';


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
      </Layout>
    </Router>
  );
}

export default App;
