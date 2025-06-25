import React from "react";
import { useAuth } from "./AuthContext";
import { Link, useNavigate } from "react-router-dom";
import './Navbar.css';

function Navbar() {
  const { user, profile, logout, loading, setProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Allow the user to switch roles for demo purpose (in real-world, roles should be immutable or admin-changeable)
  const switchRole = async () => {
    const newRole = profile.role === "recruiter" ? "candidate" : "recruiter";
    // Update in supabase
    await window.supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);
    setProfile({ ...profile, role: newRole });
    if (newRole === "recruiter") navigate("/recruiter");
    else navigate("/candidate");
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-light fixed-top border-bottom shadow-sm" style={{ minHeight: 60, background: "#fff" }}>
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <span style={{ fontWeight: 700, color: "#198754" }}>HireIQ</span>
          <span style={{ color: "#ee8844", fontWeight: 700, marginLeft: 6 }}>Lite</span>
        </Link>
        {!loading && (
          <ul className="navbar-nav ms-auto align-items-center">
            {(user && profile) && (
              <>
                {profile.role === "recruiter" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/recruiter">Recruiter Dashboard</Link>
                  </li>
                )}
                {profile.role === "candidate" && (
                  <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/candidate">Jobs</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/my-applications">My Applications</Link>
                  </li>
                  </>
                )}
                <li className="nav-item">
                  <span className="nav-link" style={{ fontWeight: 600 }}>{user.email} ({profile.role})</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-secondary mx-2" onClick={switchRole}>Switch Role</button>
                </li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-danger" onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
            {(!user || !profile) && (
              <>
                <li className="nav-item">
                  <Link className="btn btn-sm btn-success" to="/login">Login</Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-sm btn-warning" to="/signup">Sign up</Link>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
