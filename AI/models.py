from sqlalchemy import Column, String , ForeignKey , Boolean , Integer , Enum , DateTime , CheckConstraint
from datetime import datetime
from database import Base

class users(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)  # uuid
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=True)   # NULL for Google users
    pfp = Column(String, nullable=True)
    onboarded = Column(Boolean , default=False)
    integrations = Column(String)
    workspace = Column(String)
    fcm_token = Column(String)
    ai_model = Column(String, default="default")
    created_at = Column(DateTime, default=datetime.utcnow)

class company(Base):
    __tablename__ = "company"

    id = Column(String, primary_key=True)
    owner_id = Column(String, ForeignKey("users.id"))
    c_name = Column(String)
    c_bucket = Column(String)
    c_size = Column(String)
    c_code = Column (String)
    created_at = Column(DateTime, default=datetime.utcnow)

class employment(Base):
    __tablename__ = "employment"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    c_id = Column(String, ForeignKey("company.id"))
    role = Column(Enum('OWNER','ADMIN','MANAGER','EMPLOYEE', name="employmee_role"))
    dept = Column(String)
    designation = Column(String)
    manager = Column(String, ForeignKey("users.id"), nullable=True)
    rating = Column(Integer)
    status = Column(Enum('INACTIVE','ACTIVE','REJECTED', name="employment_status"))

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 100', name='employee_rating'),
    )

class join_requests(Base):
    __tablename__ = "join_requests"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    c_id = Column(String, ForeignKey("company.id"))
    code = Column(String)
    status = Column(Enum('PENDING','REVOKED','ACCEPTED','REJECTED', name="join_request_status"))
    created_at = Column(DateTime, default=datetime.utcnow)

class goals(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True)
    c_id = Column(String, ForeignKey("company.id"))
    title = Column(String)
    desc = Column(String)
    percentage = Column(Integer)
    status = Column(String)
    created_by = Column(String,ForeignKey("users.id"))
    managed_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('percentage >= 1 AND percentage <= 100', name='goal_percent'),
    )

class decisions(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True)
    c_id = Column(String, ForeignKey("company.id"))
    title = Column(String)
    desc = Column(String)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_by_type = Column(Enum('USER','AI', name="decided_by_type"))  # 'USER' or 'AI'
    goal_id = Column(String,ForeignKey("goals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class tasks(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True)
    c_id = Column(String, ForeignKey("company.id"))
    title = Column(String)
    desc = Column(String)
    percentage = Column(Integer)
    goal_id = Column(String,ForeignKey("goals.id"))
    status = Column(String)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_by_type = Column(Enum('USER','AI', name="task_by_type"))  # 'USER' or 'AI'
    managed_by = Column(String)
    assigned_to = Column(String)
    assigned_by = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_by_type = Column(Enum('USER','AI', name="task_assigned_by_type"))  # 'USER' or 'AI'
    created_at = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime)

    __table_args__ = (
        CheckConstraint('percentage >= 1 AND percentage <= 100', name='task_percent'),
    )   

class logs(Base):
    __tablename__ = "logs"

    id = Column(String, primary_key=True)
    c_id = Column(String, ForeignKey("company.id"))
    title = Column(String)
    desc = Column(String)
    reason = Column(String)
    impact = Column(String)
    rating = Column(Integer)
    rating_desc = Column(String)
    rating_by = Column(String,ForeignKey("users.id"))
    rating_at_time = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    model = Column(String)
    goal_id = Column(String, ForeignKey("goals.id"), nullable=True)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=True)

class integrations(Base):
    __tablename__ = "integrations"

    id = Column(String, primary_key=True)
    u_id = Column(String, ForeignKey("users.id"))
    tool = Column(Enum('WHATSAPP','EMAIL','TEAMS','WORKSPACE', name='integration_type'))
    config = Column(String)
    status = Column(Enum('ACTIVE','INACTIVE','ERROR', name="integration_status"))

class notifications(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True)
    u_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    desc = Column(String)
    action = Column(String)
    status = Column(Enum('ACTIVE','INACTIVE','ERROR', name="integration_status"))