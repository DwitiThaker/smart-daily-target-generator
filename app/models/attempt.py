from beanie import Document, PydanticObjectId
from datetime import datetime


class Attempt(Document):
    student_id: PydanticObjectId
    subject: str
    topic: str
    is_correct: bool = False
    timestamp: datetime

    class Settings:
        name = "attempts"