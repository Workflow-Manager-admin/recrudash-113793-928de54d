import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

function CandidateDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [descSearch, setDescSearch] = useState("");

  useEffect(() => {
    let query = supabase.from("jobs").select("*,recruiter_id");
    if (filter) {
      query = query.ilike('title', `%${filter}%`);
    }
    if (descSearch) {
      query = query.ilike('description', `%${descSearch}%`);
    }
    query = query.order('created_at', {ascending: false});
    query.then(({ data, error }) => {
      if (!error) setJobs(data || []);
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [filter, descSearch]);

  return (
    <div>
      <h2 className="mt-3 mb-4">Open Positions</h2>
      <div className="row mb-3">
        <div className="col-md-6">
          <input className="form-control mb-2" placeholder="Filter by title" value={filter}
            onChange={e => setFilter(e.target.value)} />
        </div>
        <div className="col-md-6">
          <input className="form-control mb-2" placeholder="Filter by description" value={descSearch}
            onChange={e => setDescSearch(e.target.value)} />
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="list-group shadow-sm">
          {jobs.map(job => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={job.id}>
              <div>
                <span className="fw-bold fs-5">{job.title}</span>
                <div className="text-muted" style={{fontSize: ".98em"}}>{job.description}</div>
              </div>
              <div>
                <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm">View & Apply</Link>
              </div>
            </li>
          ))}
          {jobs.length === 0 && <li className="list-group-item text-muted">No jobs found</li>}
        </ul>
      )}
    </div>
  );
}

export default CandidateDashboard;
