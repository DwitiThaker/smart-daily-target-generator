from datetime import date
from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId

from app.models.student import Student
from app.models.daily_plan import DailyPlan, Task
from app.schemas.plan_schema import GeneratePlanRequest, GeneratePlanResponse, PlanTask
from app.services.plan_generator_service import generate_daily_tasks

plans_router = APIRouter(tags=["Plans"])


@plans_router.post("/generate-daily-plan", response_model=GeneratePlanResponse)
async def generate_daily_plan(data: GeneratePlanRequest):
    try:
        student_object_id = PydanticObjectId(data.student_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid student_id format"
        )

    student = await Student.get(student_object_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    total_minutes, tasks = await generate_daily_tasks(student, data.study_hours_override)

    today = date.today()

    existing_plan = await DailyPlan.find_one(
        DailyPlan.student_id == student.id,
        DailyPlan.date == today
    )

    db_tasks = [
        Task(
            description=task["description"],
            subject=task["subject"],
            topic=task["topic"],
            duration_minutes=task["duration_minutes"],
            category=task["category"]
        )
        for task in tasks
    ]

    if existing_plan:
        existing_plan.tasks = db_tasks
        await existing_plan.save()
    else:
        new_plan = DailyPlan(
            student_id=student.id,
            date=today,
            tasks=db_tasks
        )
        await new_plan.insert()

    response_tasks = [
        PlanTask(
            description=task["description"],
            subject=task["subject"],
            topic=task["topic"],
            duration_minutes=task["duration_minutes"],
            category=task["category"]
        )
        for task in tasks
    ]

    return GeneratePlanResponse(
        student_id=str(student.id),
        date=today,
        total_minutes=total_minutes,
        daily_plan=response_tasks
    )