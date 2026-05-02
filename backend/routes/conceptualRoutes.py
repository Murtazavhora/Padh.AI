from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from services.conceptualService import (
    generate_questions,
    evaluate_answer,
    rewrite_answer,
    generate_questions_from_pdf,
    generate_more_questions
)

router = APIRouter()

class Req(BaseModel):
    topic: str = ""
    question: str = ""
    answer: str = ""
    current_questions: list = []

# -----------------Topic-based question generation------------------
@router.post("/generate")
def gen(req: Req):
    return generate_questions(req.topic)

# -----------------Recent-Document-based question generation------------------
@router.post("/generate-from-content")
def generate_from_content(req: Req):
    return generate_questions(req.content)
    
# ----------------PDF-based question generation----------------
@router.post("/generate-pdf")
async def gen_pdf(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return generate_questions_from_pdf(file_path)

# ----------------Generate More Questions----------------
@router.post("/generate-more")
def gen_more(req: Req):
    return generate_more_questions(req.topic, req.current_questions)

# ----------------Evaluation---------------
@router.post("/evaluate")
def eval(req: Req):
    return evaluate_answer(req.question, req.answer)

# ----------------Rewrite answer---------------
@router.post("/rewrite")
def rewrite(req: Req):
    return rewrite_answer(req.answer)