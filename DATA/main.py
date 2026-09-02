import os
import uuid
from fastapi import FastAPI, Request, HTTPException, Depends , Body
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, engine, Base
from models import users , company , employment , join_requests , goals , decisions , tasks , logs , integrations
from auth import create_token, hash_password, verify_password
from deps import get_current_user

load_dotenv()

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key="kyron-secret")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"}
)




# 🔥 GOOGLE LOGIN
@app.get("/login/google")
async def login_google(request: Request):
    return await oauth.google.authorize_redirect(
        request,
        "http://localhost:8000/auth/callback",
        prompt="consent"   # 🔥 ADD THIS
    )




# 🔥 GOOGLE CALLBACK
@app.get("/auth/callback")
async def auth_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    db = SessionLocal()

    user = db.query(users).filter(users.email == user_info["email"]).first()

    if not user:
        user = users(
            id=str(uuid.uuid4()),
            email=user_info["email"],
            name=user_info.get("name", ""),
            pfp=user_info.get("picture", ""),
            password=None
        )
        db.add(user)
    else:
        # 🔥 ALWAYS UPDATE PFP
        user.pfp = user_info.get("picture", user.pfp)

    db.commit()

    jwt_token = create_token(user)
    db.close()

    return RedirectResponse(
        url=f"http://localhost:5173/dashboard?token={jwt_token}"
    )




# 🔥 REGISTER
@app.post("/register")
async def register(data: dict):
    db = SessionLocal()

    if db.query(users).filter(users.email == data["email"]).first():
        raise HTTPException(400, "User with same email already exists")

    user = users(
        id=str(uuid.uuid4()),
        email=data["email"],
        name=data["name"],
        password=hash_password(data["password"])
    )

    db.add(user)
    db.commit()
    db.close()

    return {"msg": "registered"}




# 🔥 LOGIN EMAIL
@app.post("/login")
async def login(data: dict):
    db = SessionLocal()

    user = db.query(users).filter(users.email == data["email"]).first()

    if not user:
        raise HTTPException(400, "User not found")

    if user.password is None:
        raise HTTPException(400, "Use Google login")

    if not verify_password(data["password"], user.password):
        raise HTTPException(400, "Wrong password")

    db.close()

    return {"token": create_token(user)}




# 🔥 PROTECTED ROUTE
@app.get("/me")
def get_me(user=Depends(get_current_user)):
    return user




@app.post("/company/create")
def create_company(data: dict = Body(...), user=Depends(get_current_user)):
    db = SessionLocal()

    existing = db.query(company).filter(
        company.owner_id == user["u_id"]
    ).first()

    if existing:
        raise HTTPException(400, "Company already exists")

    # create company
    new_company = company(
        id=str(uuid.uuid4()),
        owner_id=user["u_id"],
        c_name=data.get("companyName"),
        c_bucket=data.get("bucket"),
        c_size=data.get("teamSize"),
        c_code=str(uuid.uuid4())[:6]
    )

    db.add(new_company)

    # link user
    emp = employment(
        id=str(uuid.uuid4()),
        user_id=user["u_id"],
        c_id=new_company.id,
        role="OWNER",
        status="ACTIVE"
    )

    db.add(emp)

    # mark onboarded
    user_db = db.query(users).filter(users.id == user["u_id"]).first()
    user_db.onboarded = True

    db.commit()
    code = new_company.c_code   # ✅ store before closing
    db.close()
    return {"msg": "company created", "code": code}



@app.post("/company/join")
def join_company(data: dict = Body(...), user=Depends(get_current_user)):
    db = SessionLocal()

    comp = db.query(company).filter(
        company.c_code == data.get("code").lower().replace("-","")
    ).first()

    if not comp:
        raise HTTPException(404, "Invalid company code")
    
    existing = db.query(join_requests).filter(
        join_requests.user_id == user["u_id"],
        join_requests.c_id == comp.id,
        join_requests.status == "PENDING"
    ).first()

    if existing:
        raise HTTPException(400, "Request already pending")

    # create join request
    req = join_requests(
        id=str(uuid.uuid4()),
        user_id=user["u_id"],
        c_id=comp.id,
        code=data.get("code"),
        status="PENDING"
    )

    db.add(req)
    db.commit()
    db.close()

    return {"msg": "request sent"}




@app.post("/company/approve")
def approve_request(data: dict = Body(...), user=Depends(get_current_user)):
    db = SessionLocal()

    req = db.query(join_requests).filter(
        join_requests.id == data.get("request_id")
    ).first()

    if not req:
        raise HTTPException(404, "Request not found")

    emp = db.query(employment).filter(
        employment.user_id == user["u_id"],
        employment.c_id == req.c_id,
        employment.status == "ACTIVE"
    ).first()

    if not emp or emp.role not in ["OWNER", "ADMIN"]:
        raise HTTPException(403, "Not authorized")

    # approve
    req.status = "ACCEPTED"

    emp = employment(
        id=str(uuid.uuid4()),
        user_id=req.user_id,
        c_id=req.c_id,
        role=data.get("role", "EMPLOYEE"),
        status="ACTIVE"
    )

    db.add(emp)

    user_db = db.query(users).filter(users.id == req.user_id).first()
    user_db.onboarded = True

    db.commit()
    db.close()

    return {"msg": "approved"}



@app.post("/company/reject")
def reject_request(data: dict = Body(...), user=Depends(get_current_user)):
    db = SessionLocal()

    emp = db.query(employment).filter(
        employment.user_id == user["u_id"],
        employment.c_id == req.c_id,
        employment.status == "ACTIVE"
    ).first()

    if not emp or emp.role not in ["OWNER", "ADMIN"]:
        raise HTTPException(403, "Not authorized")

    req = db.query(join_requests).filter(
        join_requests.id == data.get("request_id")
    ).first()

    if not req:
        raise HTTPException(404, "Request not found")

    # reject request
    req.status = "REJECTED"
    db.commit()
    db.close()
    return {"msg": "rejected"}



@app.get("/onboarded")
def check_onboarding(user=Depends(get_current_user)):
    db = SessionLocal()
    u = db.query(users).filter(users.id == user["u_id"]).first()
    db.close()
    return {"onboarded": u.onboarded}



@app.post("/company/join/revoke")
def revoke_request(data: dict = Body(...), user=Depends(get_current_user)):
    db = SessionLocal()

    req = db.query(join_requests).filter(
        join_requests.user_id == user["u_id"],
        join_requests.code == data.get("code"),
        join_requests.status == "PENDING"
    ).first()

    if not req:
        raise HTTPException(404, "No active request")

    db.delete(req)
    db.commit()
    db.close()

    return {"msg": "revoked"}



@app.post("/company/preview")
def preview_company(data: dict = Body(...)):
    db = SessionLocal()

    code = data.get("code").lower().replace("-", "")

    comp = db.query(company).filter(company.c_code == code).first()

    if not comp:
        raise HTTPException(404, "Invalid code")

    # count employees
    count = db.query(employment).filter(
        employment.c_id == comp.id,
        employment.status == "ACTIVE"
    ).count()

    db.close()

    return {
        "companyName": comp.c_name,
        "employees": count
    }




@app.get("/company/request/status")
def request_status(user=Depends(get_current_user)):
    db = SessionLocal()

    req = db.query(join_requests).filter(
        join_requests.user_id == user["u_id"]
    ).order_by(join_requests.created_at.desc()).first()

    if not req:
        db.close()
        return {"status": None}

    comp = db.query(company).filter(company.id == req.c_id).first()

    count = db.query(employment).filter(
        employment.c_id == comp.id,
        employment.status == "ACTIVE"
    ).count()

    db.close()

    return {
        "status": req.status,   # 🔥 now returns PENDING / ACCEPTED / REJECTED
        "companyName": comp.c_name,
        "employees": count,
        "code": req.code
    }