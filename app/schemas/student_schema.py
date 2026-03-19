from typing import Dict, Optional
from pydantic import BaseModel, Field

class StudentCreate(BaseModel):
    name: str = Field(..., min_length=1)
    study_hours_per_day: float = Field(..., gt=0, le=16)
    subjects_progress: Dict[str, float]

class StudentUpdate(BaseModel):
    study_hours_per_day: Optional[float] = Field(None, gt=0, le=16)
    subjects_progress: Optional[Dict[str, float]] = None

class StudentResponse(BaseModel):
    id: str
    name: str
    study_hours_per_day: float
    subjects_progress: Dict[str, float]