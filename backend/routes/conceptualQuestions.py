from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.conceptualQuestionService import generate_questions, generate_more_questions
import time

router = APIRouter()
sessions = {}

class TopicRequest(BaseModel):
    topic: str

class AnswerRequest(BaseModel):
    session_id: str = None
    topic: str
    questions: list
    answers: dict

@router.post("/generate-questions")
def generate(req: TopicRequest):  # No async needed
    if not req.topic.strip():
        raise HTTPException(400, "Topic required")
    return generate_questions(req.topic)  # No await needed

@router.post("/generate-more")
def generate_more(req: TopicRequest):  # No async needed
    if not req.topic.strip():
        raise HTTPException(400, "Topic required")
    return generate_more_questions(req.topic)  # No await needed

@router.post("/save-answers")
def save(req: AnswerRequest):
    session_id = req.session_id or str(time.time())
    sessions[session_id] = {
        "topic": req.topic,
        "questions": req.questions,
        "answers": req.answers
    }
    return {"success": True, "session_id": session_id}