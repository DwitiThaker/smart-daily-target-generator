from pydantic import BaseModel,Field
from datetime import datetime

class AttemptCreate(BaseModel):
    student_id: str
    subject: str = Field(..., min_length=1)
    topic: str = Field(..., min_length=1)
    is_correct: bool

class AttemptResponse(BaseModel):
    id: str
    student_id: str
    subject: str
    topic: str
    is_correct: bool
    timestamp: datetime