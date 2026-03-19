from pydantic import BaseModel  

class WeakTopicResponse(BaseModel):
  subject: str
  topic: str
  incorrect_count:int
  total_attempts: int
  weak: bool
