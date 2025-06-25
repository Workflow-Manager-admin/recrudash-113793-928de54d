import React, { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("candidate");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const error = await signUp(email, password, role);
    setLoading(false);
    if (error) setErr(error.message || "Sign up failed");
    else navigate("/");
  };

  return (
    <div className="row justify-content-center">
      <div className="col-sm-8 col-md-6 col-lg-4">
        <h3 className="mt-5 mb-3 text-center">Sign Up</h3>
        <form onSubmit={handleSignUp} className="border rounded p-4 shadow-sm bg-white">
          {err && <div className="alert alert-danger">{err}</div>}
          <div className="mb-3">
            <label>Email</label>
            <input required type="email" className="form-control" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input required type="password" className="form-control" minLength={6}
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="mb-3">
            <label>Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
          <button className="btn btn-warning w-100" disabled={loading}>
            {loading ? "Signing up…" : "Sign Up"}
          </button>
          <div className="mt-3 small">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
