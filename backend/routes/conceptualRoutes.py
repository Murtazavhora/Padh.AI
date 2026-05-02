from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services.conceptualService import (
    generate_questions,
    evaluate_answer,
    rewrite_answer,
    generate_questions_from_pdf,
    generate_more_questions
)

from services.supabaseClient import supabase_admin
from utils.auth import get_current_user


router = APIRouter()


# ---------------------- REQUEST MODEL ----------------------
class Req(BaseModel):
    topic: Optional[str] = ""
    question: Optional[str] = ""
    answer: Optional[str] = ""
    current_questions: List[str] = []
    document_id: Optional[str] = None
    difficulty_level: Optional[int] = 1


# ---------------------- HELPER: GET DOCUMENT CONTENT ----------------------
def get_document_content(document_id, user_id):
    try:
        res = supabase_admin.table("documents") \
            .select("content") \
            .eq("id", document_id) \
            .eq("user_id", user_id) \
            .single() \
            .execute()

        if not res.data:
            return None

        return res.data.get("content", "")

    except Exception as e:
        print("[DOC FETCH ERROR]", e)
        return None


# ---------------------- GENERATE QUESTIONS ----------------------
@router.post("/generate")
async def gen(req: Req, user=Depends(get_current_user)):
    try:
        input_text = req.topic

        # 🔥 If document selected → override topic
        if req.document_id:
            doc_content = get_document_content(req.document_id, user.id)

            if not doc_content:
                raise HTTPException(status_code=400, detail="Document not found")

            input_text = doc_content

        if not input_text or not input_text.strip():
            raise HTTPException(status_code=400, detail="No input provided")

        return await generate_questions(input_text, req.difficulty_level)

    except HTTPException:
        raise
    except Exception as e:
        print("[GENERATE ERROR]", e)
        raise HTTPException(status_code=500, detail="Failed to generate questions")


# ---------------------- GENERATE MORE ----------------------
@router.post("/generate-more")
async def gen_more(req: Req, user=Depends(get_current_user)):
    try:
        input_text = req.topic

        if req.document_id:
            doc_content = get_document_content(req.document_id, user.id)

            if not doc_content:
                raise HTTPException(status_code=400, detail="Document not found")

            input_text = doc_content

        return await generate_more_questions(
            input_text,
            req.current_questions,
            req.difficulty_level
        )

    except HTTPException:
        raise
    except Exception as e:
        print("[GENERATE MORE ERROR]", e)
        raise HTTPException(status_code=500, detail="Failed to generate more questions")


# ---------------------- EVALUATE ----------------------
@router.post("/evaluate")
async def eval(req: Req):
    try:
        if not req.question or not req.answer:
            raise HTTPException(status_code=400, detail="Question and answer required")

        return await evaluate_answer(req.question, req.answer)

    except HTTPException:
        raise
    except Exception as e:
        print("[EVALUATE ERROR]", e)
        raise HTTPException(status_code=500, detail="Evaluation failed")


# ---------------------- REWRITE ----------------------
@router.post("/rewrite")
async def rewrite(req: Req):
    try:
        if not req.answer:
            raise HTTPException(status_code=400, detail="Answer required")

        return await rewrite_answer(req.answer)

    except HTTPException:
        raise
    except Exception as e:
        print("[REWRITE ERROR]", e)
        raise HTTPException(status_code=500, detail="Rewrite failed")


# ---------------------- PDF ----------------------
@router.post("/generate-pdf")
async def gen_pdf(file: UploadFile = File(...)):
    try:
        file_path = f"temp_{file.filename}"

        with open(file_path, "wb") as f:
            f.write(await file.read())

        return await generate_questions_from_pdf(file_path)

    except Exception as e:
        print("[PDF ROUTE ERROR]", e)
        raise HTTPException(status_code=500, detail="PDF processing failed")