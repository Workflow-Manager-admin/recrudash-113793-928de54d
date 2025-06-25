import React from "react";
import { useAuth } from "../components/AuthContext";
import { Link } from "react-router-dom";

function Home() {
  const { user, profile } = useAuth();
  return (
    <div className="text-center">
      <h1 className="mt-4 mb-3">Welcome to HireIQ Lite</h1>
      <p className="lead">
        A simple, lightweight recruitment platform <br />
        for recruiters and job candidates.
      </p>
      <div className="my-5">
        {!user && (
          <>
            <Link to="/login" className="btn btn-success btn-lg mx-2">Login</Link>
            <Link to="/signup" className="btn btn-warning btn-lg mx-2">Sign up</Link>
          </>
        )}
        {user && profile && (
          <>
            {profile.role === "recruiter" ? (
              <Link to="/recruiter" className="btn btn-success btn-lg mx-2">Go to Recruiter Dashboard</Link>
            ) : (
              <Link to="/candidate" className="btn btn-primary btn-lg mx-2">View Jobs</Link>
            )}
          </>
        )}
      </div>
      <div className="mt-4" style={{ color: "#777" }}>
        Powered by React &amp; Supabase
      </div>
    </div>
  );
}

export default Home;
