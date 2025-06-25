import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { supabase } from "../supabaseClient";

function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    let query = supabase.from('jobs').select('*').eq('recruiter_id', user.id).order('created_at', {ascending: false});
    if (filter) query = query.ilike('title', `%${filter}%`);
    const { data, error } = await query;
    if (!error) setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line
  }, [filter]);

  const handleAddJob = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase
      .from('jobs')
      .insert([{ recruiter_id: user.id, title, description: desc }]);
    setLoading(false);
    if (error) setErr("Could not create job");
    else {
      setSuccess("Job posted!");
      setTitle(""); setDesc("");
      loadJobs();
    }
  };

  const handleDelete = async (jobId) => {
    await supabase.from("jobs").delete().eq("id", jobId).eq("recruiter_id", user.id);
    loadJobs();
  };

  return (
    <div className="row">
      <div className="col-md-5">
        <h3 className="mt-3">Post a New Job</h3>
        <form onSubmit={handleAddJob} className="border rounded p-3 bg-white shadow-sm">
          {err && <div className="alert alert-danger">{err}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="mb-2">
            <label>Title</label>
            <input required type="text" className="form-control"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="mb-2">
            <label>Description</label>
            <textarea required className="form-control" rows={3}
              value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <button className="btn btn-success w-100" disabled={loading}>Add Job</button>
        </form>
      </div>
      <div className="col-md-7">
        <div className="d-flex align-items-center mt-3 mb-2">
          <h3 className="mb-0">Your Job Listings</h3>
          <input
            className="form-control ms-auto"
            placeholder="Filter by title"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ maxWidth: 180, marginLeft: "auto" }}
          />
        </div>
        {loading && <div>Loading...</div>}
        <ul className="list-group shadow-sm">
          {jobs.map(job => (
            <li className="list-group-item d-flex justify-content-between" key={job.id}>
              <div>
                <div className="fw-bold">{job.title}</div>
                <div style={{ fontSize: "0.97em", color: "#555" }}>{job.description}</div>
              </div>
              <div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>Delete</button>
              </div>
            </li>
          ))}
          {jobs.length === 0 && !loading && <li className="list-group-item text-muted">No jobs found</li>}
        </ul>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
