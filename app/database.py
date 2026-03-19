import motor.motor_asyncio
from beanie import init_beanie
from dotenv import load_dotenv
import os

from app.models.student import Student
from app.models.daily_plan import DailyPlan
from app.models.attempt import Attempt

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")

async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    database = client["superkalam"]
    await init_beanie(database=database, document_models=[Student, Attempt, DailyPlan])
    print(f"Connected to database")