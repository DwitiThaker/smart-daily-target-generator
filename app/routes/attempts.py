from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId
from datetime import datetime

from app.models.attempt import Attempt
from app.models.student import Student
from app.schemas.attempt_schema import AttemptCreate, AttemptResponse

attempt_router = APIRouter(prefix="/attempts", tags=["Attempt"])

@attempt_router.post("",status_code=status.HTTP_201_CREATED)
async def create_attempt(data: AttemptCreate):
    student = await Student.get(PydanticObjectId(data.student_id))
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )        
    attempt = Attempt(
        student_id=student.id,
        subject = data.subject,
        topic=data.topic,
        is_correct=data.is_correct,
        timestamp=datetime.utcnow()
    )
    await attempt.insert()
    return AttemptResponse(
        id=str(attempt.id),
        student_id=str(student.id),
        subject = attempt.subject,
        topic=attempt.topic,
        is_correct=attempt.is_correct,
        timestamp=attempt.timestamp
    )