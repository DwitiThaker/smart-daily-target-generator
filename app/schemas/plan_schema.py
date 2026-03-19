from datetime import date
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class PlanTask(BaseModel):
    description: str
    subject: str
    topic: str
    duration_minutes: int
    category: Literal["weak_topic", "new_topic", "revision"]


class GeneratePlanRequest(BaseModel):
    student_id: str
    study_hours_override: Optional[float] = Field(default=None, gt=0, le=16)


class GeneratePlanResponse(BaseModel):
    student_id: str
    date: date
    total_minutes: int
    daily_plan: List[PlanTask]