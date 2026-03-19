from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import init_db
from app.routes.students import student_router
from app.routes.attempts import attempt_router
from app.routes.weak_topics import weak_topic_router
from app.routes.plans import plans_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan, title="Smart Daily Target Generator", version="1.0")

@app.get("/")
async def home():
    return "done"

app.include_router(student_router)
app.include_router(attempt_router)
app.include_router(weak_topic_router)
app.include_router(plans_router)


from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)