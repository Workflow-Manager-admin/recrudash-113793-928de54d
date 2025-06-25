import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './components/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import JobDetails from './pages/JobDetails';
import MyApplications from './pages/MyApplications';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// PUBLIC_INTERFACE
function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  // If allowedRoles is set, check current role
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container" style={{ paddingTop: 80 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Recruiter dashboard */}
            <Route path="/recruiter" element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            {/* Candidate dashboard */}
            <Route path="/candidate" element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/jobs/:jobId" element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            } />
            <Route path="/my-applications" element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <MyApplications />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
