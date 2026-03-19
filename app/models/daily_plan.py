from beanie import Document, PydanticObjectId
from datetime import date
from pydantic import BaseModel
from typing import List, Literal

class Task(BaseModel):
    description: str
    subject: str
    topic: str
    duration_minutes: int
    category: Literal["weak_topic", "new_topic", "revision"]

class DailyPlan(Document):
    student_id: PydanticObjectId
    date: date
    tasks: List[Task]

    class Settings:
        name = "daily_plans"