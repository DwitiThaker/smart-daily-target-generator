from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId

from app.models.student import Student
from app.schemas.student_schema import StudentCreate, StudentResponse, StudentUpdate

student_router = APIRouter(prefix="/students", tags=["Students"])

@student_router.get("/{student_id}")
async def get_students(student_id: PydanticObjectId):
    student = await Student.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return StudentResponse(
        id=str(student.id),
        name=student.name,
        study_hours_per_day=student.study_hours_per_day,
        subjects_progress=student.subjects_progress
    )


@student_router.post("", status_code=status.HTTP_201_CREATED)
async def create_student(data: StudentCreate):
    student = Student(
        name=data.name,
        study_hours_per_day=data.study_hours_per_day,
        subjects_progress=data.subjects_progress
    )
    await student.insert()
    return StudentResponse(
        id=str(student.id),
        name=student.name,
        study_hours_per_day=student.study_hours_per_day,
        subjects_progress=student.subjects_progress
    )


@student_router.patch("/{student_id}")
async def update_student(student_id: PydanticObjectId, data: StudentUpdate):
    student = await Student.get(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    if data.study_hours_per_day is not None:
        student.study_hours_per_day = data.study_hours_per_day
    
    if data.subjects_progress is not None:
        student.subjects_progress.update(data.subjects_progress)

    await student.save()
    return StudentResponse(
        id=str(student.id),
        name=student.name,
        study_hours_per_day=student.study_hours_per_day,
        subjects_progress=student.subjects_progress
    )

