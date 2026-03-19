from fastapi import status, HTTPException, APIRouter
from beanie import PydanticObjectId
from typing import List

from app.services.weak_topic_service import compute_weak_topics_for_student
from app.models.student import Student
from app.schemas.weak_topic_schema import WeakTopicResponse

weak_topic_router = APIRouter(prefix="/students", tags=["Weak Topics"])

@weak_topic_router.get("/{student_id}/weak-topics", response_model=List[WeakTopicResponse])
async def get_weak_topics(student_id: PydanticObjectId):
    student = await Student.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    results = await compute_weak_topics_for_student(student_id)
    return results

