import React, { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const error = await login(email, password);
    setLoading(false);
    if (error) {
      setErr(error.message || "Login failed");
    } else {
      // User role will determine dashboard
      navigate("/");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-sm-8 col-md-6 col-lg-4">
        <h3 className="mt-5 mb-3 text-center">Login</h3>
        <form onSubmit={handleLogin} className="border rounded p-4 shadow-sm bg-white">
          {err && <div className="alert alert-danger">{err}</div>}
          <div className="mb-3">
            <label>Email</label>
            <input required type="email" className="form-control" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input required type="password" className="form-control" value={password}
              onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-success w-100" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
          <div className="mt-3 small">
            No account? <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
