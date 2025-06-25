import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../components/AuthContext";
import { Link } from "react-router-dom";

function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      // Query for user's applications and join job info
      const { data, error } = await supabase
        .from("applications")
        .select("id, job_id, jobs(title, description)")
        .eq("candidate_id", user.id);
      setApplications(data || []);
      setLoading(false);
    };
    if (user) loadApps();
    // eslint-disable-next-line
  }, [user]);

  return (
    <div>
      <h3 className="mt-3">My Applications</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="list-group shadow-sm">
          {applications.length === 0 && <li className="list-group-item text-muted">No applications found.</li>}
          {applications.map(a => (
            <li className="list-group-item d-flex justify-content-between" key={a.id}>
              <div>
                <div className="fw-bold">{a.jobs.title}</div>
                <div className="text-muted" style={{ fontSize: ".98em" }}>{a.jobs.description}</div>
              </div>
              <div>
                <Link className="btn btn-outline-primary btn-sm" to={`/jobs/${a.job_id}`}>View Job</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyApplications;
