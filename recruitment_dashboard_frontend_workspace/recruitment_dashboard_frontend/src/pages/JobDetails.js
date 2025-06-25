import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../components/AuthContext";

function JobDetails() {
  const { user, profile } = useAuth();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadJob = async () => {
      let { data: j, error } = await supabase.from('jobs').select('*').eq('id', jobId).single();
      setJob(j || null);
    };
    loadJob();

    // Check if already applied
    (async ()=>{
      if (user) {
        const { data } = await supabase
          .from("applications")
          .select("*")
          .eq("job_id", jobId)
          .eq("candidate_id", user.id);
        setApplied((data && data.length > 0));
      }
    })();
    // eslint-disable-next-line
  }, [jobId, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setErr(""); setSuccess("");
    const { error } = await supabase
      .from("applications")
      .insert([{ job_id: jobId, candidate_id: user.id }]);
    setApplying(false);
    if (error) setErr("Application failed");
    else {
      setSuccess("Applied successfully!");
      setApplied(true);
    }
  };

  if (!job) return <div>Loading...</div>;
  return (
    <div className="col-md-7 mx-auto">
      <h2 className="fw-bold mt-4">{job.title}</h2>
      <div className="mb-2 text-muted">{job.description}</div>

      {profile && profile.role === "candidate" && (
        <>
          {applied && <div className="alert alert-success">Already applied to this job.</div>}
          {!applied && (
            <form onSubmit={handleApply} className="border rounded p-3 shadow-sm mt-3 bg-white">
              {err && <div className="alert alert-danger">{err}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <button className="btn btn-success w-100" disabled={applying}>
                {applying ? "Applying…" : "Apply"}
              </button>
            </form>
          )}
        </>
      )}
      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}

export default JobDetails;
