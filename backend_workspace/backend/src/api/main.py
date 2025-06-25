import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, constr, Field
from dotenv import load_dotenv
import httpx

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
SUPABASE_AUTH_ENDPOINT = f"{SUPABASE_URL}/auth/v1"
SUPABASE_REST_ENDPOINT = f"{SUPABASE_URL}/rest/v1"
SUPABASE_ANON_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

app = FastAPI(
    title="HireIQ Lite Backend API",
    description=(
        "Backend API for HireIQ Lite recruitment dashboard utilizing Supabase "
        "for authentication, role management, job postings, and job "
        "applications."
    ),
    version="1.0.0",
    openapi_tags=[
        {"name": "Auth", "description": "User authentication endpoints"},
        {"name": "Roles", "description": "Role-based access control"},
        {
            "name": "Jobs",
            "description": "Job CRUD operations for recruiters & candidates"
        },
        {
            "name": "Applications",
            "description": "Job application submission and retrieval"
        },
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# SUPABASE HELPERS


async def supabase_signup(email: str, password: str):
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{SUPABASE_AUTH_ENDPOINT}/signup",
            json={"email": email, "password": password},
            headers=SUPABASE_ANON_HEADERS,
            timeout=20,
        )
        return r


async def supabase_signin(email: str, password: str):
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{SUPABASE_AUTH_ENDPOINT}/token?grant_type=password",
            data={"email": email, "password": password},
            headers=SUPABASE_ANON_HEADERS,
            timeout=20,
        )
        return r


async def supabase_insert(table: str, data: dict, jwt_token: str = None):
    headers = SUPABASE_ANON_HEADERS.copy()
    if jwt_token:
        headers["Authorization"] = f"Bearer {jwt_token}"
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{SUPABASE_REST_ENDPOINT}/{table}",
            json=data,
            headers=headers,
            timeout=20,
        )
        return r


async def supabase_select(
    table: str, filters: str = None, jwt_token: str = None
):
    headers = SUPABASE_ANON_HEADERS.copy()
    if jwt_token:
        headers["Authorization"] = f"Bearer {jwt_token}"
    url = f"{SUPABASE_REST_ENDPOINT}/{table}"
    if filters:
        url += f"?{filters}"
    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers=headers, timeout=20)
        return r


async def supabase_delete(
    table: str, filters: str, jwt_token: str = None
):
    headers = SUPABASE_ANON_HEADERS.copy()
    if jwt_token:
        headers["Authorization"] = f"Bearer {jwt_token}"
    url = f"{SUPABASE_REST_ENDPOINT}/{table}?{filters}"
    async with httpx.AsyncClient() as client:
        r = await client.delete(url, headers=headers, timeout=20)
        return r


async def supabase_update(
    table: str, filters: str, payload: dict, jwt_token: str = None
):
    headers = SUPABASE_ANON_HEADERS.copy()
    if jwt_token:
        headers["Authorization"] = f"Bearer {jwt_token}"
    url = f"{SUPABASE_REST_ENDPOINT}/{table}?{filters}"
    async with httpx.AsyncClient() as client:
        r = await client.patch(url, json=payload, headers=headers, timeout=20)
        return r


async def get_user_role(user_id: str, jwt_token: str = None):
    """Get user role from Supabase roles table (assumes mapping in 'user_roles')."""
    r = await supabase_select(
        "user_roles", f"user_id=eq.{user_id}", jwt_token=jwt_token
    )
    if r.status_code == 200 and r.json():
        return r.json()[0].get("role")
    return None


# Pydantic Models


class SignupReq(BaseModel):
    email: EmailStr
    password: constr(min_length=6) = Field(
        ..., description="User password, minimum 6 characters"
    )


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class RoleReq(BaseModel):
    user_id: str = Field(..., description="Supabase Auth UUID")
    role: str = Field(
        ...,
        description="User role: recruiter or candidate",
        pattern="^(recruiter|candidate)$"
    )


class JobPostCreate(BaseModel):
    title: str
    description: str
    company: str
    location: str
    posted_by: str  # recruiter user_id


class JobPost(BaseModel):
    id: int
    title: str
    description: str
    company: str
    location: str
    posted_by: str


class ApplicationCreate(BaseModel):
    user_id: str
    job_id: int


class Application(BaseModel):
    id: int
    user_id: str
    job_id: int


# ---------- Auth Endpoints ----------


# PUBLIC_INTERFACE
@app.post(
    "/auth/signup",
    tags=["Auth"],
    summary="Sign up",
    description="User sign-up to Supabase via email/password",
)
async def signup(data: SignupReq):
    """Sign up a new user with Supabase authentication."""
    resp = await supabase_signup(data.email, data.password)
    if resp.status_code == 200:
        return {"message": "User created, check your email for confirmation."}
    return {"error": resp.json()}, resp.status_code


# PUBLIC_INTERFACE
@app.post(
    "/auth/login",
    tags=["Auth"],
    summary="Login",
    description="User login via Supabase email/password",
)
async def login(data: LoginReq):
    """Authenticate user and retrieve Supabase access tokens."""
    resp = await supabase_signin(data.email, data.password)
    if resp.status_code == 200:
        return resp.json()
    else:
        raise HTTPException(
            status_code=401,
            detail=resp.json().get("error", "Invalid credentials."),
        )


# PUBLIC_INTERFACE
@app.post(
    "/auth/logout",
    tags=["Auth"],
    summary="Logout",
    description="User logout (token invalidation simulated client-side).",
)
async def logout():
    """
    Simulates logout by client discarding bearer token.
    (Actual logout is client-side)
    """
    return {
        "message": "Logout successful. Please discard your token on the client."
    }


# ---------- Role Management ----------


# PUBLIC_INTERFACE
@app.post(
    "/roles/assign",
    tags=["Roles"],
    summary="Assign Role",
    description="Assign a recruiter or candidate role to a user.",
)
async def assign_role(
    data: RoleReq, token: str = Depends(oauth2_scheme)
):
    """Assign a role to a user in Supabase roles table"""
    # Only an authenticated user can assign roles.
    # Allow self assignment for simplicity.
    payload = {"user_id": data.user_id, "role": data.role}
    insert_resp = await supabase_insert("user_roles", payload, jwt_token=token)
    if insert_resp.status_code in [201, 200]:
        return {"message": "Role assigned."}
    return {"error": insert_resp.text}, insert_resp.status_code


# PUBLIC_INTERFACE
@app.get(
    "/roles/me",
    tags=["Roles"],
    summary="Get my role",
    description="Get the role of the current logged-in user.",
)
async def get_my_role(token: str = Depends(oauth2_scheme)):
    # Parse user id from jwt (Supabase JWT), or require frontend to send
    # user_id as param. For demo, expect frontend to send 'user_id' as q param.
    # In real usage, parse the JWT or look up user by email
    return {
        "message": "Send user_id in query param to /roles/get?user_id=(your id)"
    }


# PUBLIC_INTERFACE
@app.get(
    "/roles/get",
    tags=["Roles"],
    summary="Get user role",
    description="Get the role of a specific user by ID.",
)
async def get_role(user_id: str, token: str = Depends(oauth2_scheme)):
    role = await get_user_role(user_id, jwt_token=token)
    if role:
        return {"user_id": user_id, "role": role}
    else:
        raise HTTPException(status_code=404, detail="Role not found")


# ---------- Job CRUD ----------


# PUBLIC_INTERFACE
@app.post(
    "/jobs",
    tags=["Jobs"],
    summary="Create job",
    description="Recruiter creates a job posting.",
)
async def create_job(
    job: JobPostCreate, token: str = Depends(oauth2_scheme)
):
    """Recruiter creates a job posting."""
    # Assume only recruiters can post jobs.
    role = await get_user_role(job.posted_by, jwt_token=token)
    if role != "recruiter":
        raise HTTPException(
            status_code=403, detail="Not authorized to create jobs"
        )
    payload = job.dict()
    resp = await supabase_insert("jobs", payload, jwt_token=token)
    if resp.status_code in [201, 200]:
        return {"message": "Job created"}
    return {"error": resp.text}, resp.status_code


# PUBLIC_INTERFACE
@app.get(
    "/jobs",
    tags=["Jobs"],
    summary="List jobs",
    description="List all jobs (for candidate/recruiter).",
)
async def list_jobs(token: str = Depends(oauth2_scheme)):
    """List all jobs."""
    resp = await supabase_select("jobs", jwt_token=token)
    if resp.status_code == 200:
        return resp.json()
    return {"error": resp.text}, resp.status_code


# PUBLIC_INTERFACE
@app.delete(
    "/jobs/{job_id}",
    tags=["Jobs"],
    summary="Delete job",
    description="Recruiter deletes their own job posting.",
)
async def delete_job(
    job_id: int, user_id: str, token: str = Depends(oauth2_scheme)
):
    """Recruiter deletes their job."""
    role = await get_user_role(user_id, jwt_token=token)
    if role != "recruiter":
        raise HTTPException(
            status_code=403, detail="Not authorized to delete jobs"
        )
    # Only delete if this user is the owner
    filters = f"id=eq.{job_id}&posted_by=eq.{user_id}"
    resp = await supabase_delete("jobs", filters, jwt_token=token)
    if resp.status_code in [204, 200]:
        return {"message": "Job deleted"}
    raise HTTPException(status_code=resp.status_code, detail=resp.text)


# PUBLIC_INTERFACE
@app.patch(
    "/jobs/{job_id}",
    tags=["Jobs"],
    summary="Update job",
    description="Recruiter updates their job posting (editable fields only).",
)
async def update_job(
    job_id: int,
    user_id: str,
    job: JobPostCreate,
    token: str = Depends(oauth2_scheme),
):
    """Recruiter updates their job posting."""
    role = await get_user_role(user_id, jwt_token=token)
    if role != "recruiter":
        raise HTTPException(
            status_code=403, detail="Not authorized to update jobs"
        )
    filters = f"id=eq.{job_id}&posted_by=eq.{user_id}"
    resp = await supabase_update(
        "jobs", filters, job.dict(), jwt_token=token
    )
    if resp.status_code in [204, 200]:
        return {"message": "Job updated"}
    raise HTTPException(status_code=resp.status_code, detail=resp.text)


# ---------- Applications ----------


# PUBLIC_INTERFACE
@app.post(
    "/applications",
    tags=["Applications"],
    summary="Submit application",
    description="Candidate applies to a job posting.",
)
async def submit_application(
    apply: ApplicationCreate, token: str = Depends(oauth2_scheme)
):
    """Candidate applies to a job."""
    role = await get_user_role(apply.user_id, jwt_token=token)
    if role != "candidate":
        raise HTTPException(
            status_code=403, detail="Only candidates may apply for jobs."
        )
    payload = apply.dict()
    resp = await supabase_insert("applications", payload, jwt_token=token)
    if resp.status_code in [201, 200]:
        return {"message": "Application submitted"}
    raise HTTPException(status_code=resp.status_code, detail=resp.text)


# PUBLIC_INTERFACE
@app.get(
    "/applications",
    tags=["Applications"],
    summary="My applications",
    description="Candidate or recruiter views applications (filtered by user or job).",
)
async def list_applications(
    user_id: str = None,
    job_id: int = None,
    token: str = Depends(oauth2_scheme),
):
    filters = []
    if user_id:
        filters.append(f"user_id=eq.{user_id}")
    if job_id:
        filters.append(f"job_id=eq.{job_id}")
    filter_query = "&".join(filters) if filters else None
    resp = await supabase_select(
        "applications", filter_query, jwt_token=token
    )
    if resp.status_code == 200:
        return resp.json()
    return {"error": resp.text}, resp.status_code


# PUBLIC_INTERFACE
@app.get(
    "/",
    summary="Health check",
    tags=["Auth"]
)
def health_check():
    """
    PUBLIC_INTERFACE
    Health check endpoint for the backend service.

    Returns:
        dict: A simple healthy status message and the Supabase URL (for debugging).
    """
    return {
        "message": "Healthy",
        "supabase_url": SUPABASE_URL,
    }
