from typing import Dict
from beanie import Document
from pydantic import Field

class Student(Document):
    name: str
    study_hours_per_day: float
    subjects_progress: Dict[str, float]

    class Settings:
        name = "students"  # This is the MongoDB collection name