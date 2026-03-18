import io
import os
import json
import random
import re
from typing import List, Optional

import httpx
import pytesseract
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

load_dotenv()

# Optional: set Tesseract path (e.g. on Windows: C:\\Program Files\\Tesseract-OCR\\tesseract.exe)
_tesseract_cmd = os.getenv("TESSERACT_CMD")
if _tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = _tesseract_cmd

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "llama-3.3-70b-versatile"

app = FastAPI(title="Padh.AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


async def groq_chat(messages: List[dict], temperature: float = 0.5, max_tokens: int = 2048) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    async with httpx.AsyncClient(timeout=60.0, verify=False) as client:
        r = await client.post(
            GROQ_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}",
            },
            json={
                "model": MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
    if r.status_code != 200:
        err = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
        msg = err.get("error", {}).get("message", r.text) or f"API error {r.status_code}"
        raise HTTPException(status_code=r.status_code, detail=msg)
    data = r.json()
    content = (data.get("choices") or [{}])[0].get("message", {}).get("content") or ""
    return content.strip()


# --- Summary ---
class SummaryRequest(BaseModel):
    document_name: str
    content: str


@app.post("/api/summary")
async def summary(req: SummaryRequest):
    content = req.content
    if len(content) > 12000:
        content = content[:12000] + "\n\n[Content truncated for processing...]"
    system = """You are an expert document summarizer for a student learning platform called Padh.AI. Generate a well-structured, comprehensive summary of the provided document. Format your response using this exact structure:

## Summary
A 2-4 sentence summary of what the document is about.

## Key Points
- Point 1
- Point 2
- Point 3
(list all important points)

Keep the language clear, concise, and student-friendly. Do NOT include any other sections."""
    user = f'Please summarize the following document titled "{req.document_name}":\n\n{content}'
    summary_text = await groq_chat(
        [{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.3,
        max_tokens=2048,
    )
    return {"summary": summary_text}


# --- Plagiarism check (alternate mock: no Groq; 1st upload low, 2nd high, etc.) ---
PLAGIARISM_DISPLAY_THRESHOLD = 30
_plagiarism_upload_count = 0


class PlagiarismCheckRequest(BaseModel):
    content: str


@app.post("/api/plagiarism-check")
async def plagiarism_check(req: PlagiarismCheckRequest):
    """Alternate mock: first upload = low plagiarism (allow), second = high (block), then repeat. Returns random percentage. No Groq call."""
    global _plagiarism_upload_count
    _plagiarism_upload_count += 1
    is_first_or_odd = (_plagiarism_upload_count % 2) == 1

    if is_first_or_odd:
        within_threshold = True
        plagiarism_percentage = random.randint(5, 28)
    else:
        within_threshold = False
        plagiarism_percentage = random.randint(35, 85)

    return {
        "plagiarism_percentage": plagiarism_percentage,
        "within_threshold": within_threshold,
        "threshold": PLAGIARISM_DISPLAY_THRESHOLD,
    }


# --- OCR (Tesseract) for images and scanned documents ---
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"}


@app.post("/api/ocr")
async def ocr_extract_text(file: UploadFile = File(...)):
    """Extract text from an uploaded image or scanned document using Tesseract OCR."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        text = pytesseract.image_to_string(image)
        return {"text": (text or "").strip()}
    except pytesseract.pytesseract.TesseractNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Tesseract OCR is not installed or not in PATH. Install it from https://github.com/UB-Mannheim/tesseract/wiki and set TESSERACT_CMD in backend .env to the path of tesseract.exe.",
        )
    except (PermissionError, OSError) as e:
        if getattr(e, "winerror", None) == 5 or getattr(e, "errno", None) == 13:
            raise HTTPException(
                status_code=503,
                detail="Access denied when running Tesseract. Try: (1) Run the backend terminal as Administrator, or (2) Install Tesseract to a folder outside Program Files (e.g. C:\\Tesseract-OCR) and set TESSERACT_CMD in .env to that path.",
            )
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")


# --- Quiz (with RAG for document-based) ---
RAG_RETRIEVAL_SYSTEM = """You are a retrieval system for a student learning platform. Your task is to extract the most relevant sections from the given document that should be used to create quiz questions testing understanding of key concepts.

Rules:
- Return ONLY the extracted text from the document. Do not add any explanation, summary, or meta-commentary.
- Preserve the original order and wording of the document. Copy the most important passages that cover main concepts, definitions, and facts suitable for multiple-choice questions.
- Include diverse sections so quiz questions can cover different parts of the material.
- Limit the total output to about 3500 characters so it fits in the next step. If the document is long, select the most conceptually rich passages."""

QUIZ_SYSTEM = """You are a quiz generator for a student learning platform called Padh.AI. Generate exactly 5 multiple-choice questions based on the given topic or retrieved document content.

CRITICAL: You MUST respond with ONLY a valid JSON array, no markdown, no explanation, no code fences. The response must start with [ and end with ].

Each question object must have exactly this structure:
{"id":1,"question":"...","options":["A","B","C","D"],"correct":0}

Rules:
- "correct" is the 0-based index of the correct option (0, 1, 2, or 3)
- Each question must have exactly 4 options
- Questions should be educational, clear, and progressively challenging
- Cover different aspects of the topic or retrieved content
- Keep questions concise and student-friendly"""


async def retrieve_relevant_sections(content: str, document_name: str, max_chars: int = 12000) -> str:
    """RAG retrieval: extract the most relevant sections from the document for quiz generation."""
    if len(content) <= max_chars:
        return content
    # Truncate for retrieval call to stay within context
    chunk = content[:max_chars] + "\n\n[Document continues...]"
    user_msg = f'Document title: "{document_name}"\n\nExtract the key sections from this document that are most suitable for creating quiz questions:\n\n{chunk}'
    retrieved = await groq_chat(
        [
            {"role": "system", "content": RAG_RETRIEVAL_SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.2,
        max_tokens=2048,
    )
    return retrieved.strip() if retrieved else content[:4000]


class QuizRequest(BaseModel):
    topic: Optional[str] = None
    document_name: Optional[str] = None
    content: Optional[str] = None


@app.post("/api/quiz")
async def quiz(req: QuizRequest):
    if req.topic and req.topic.strip():
        # Topic-based: conceptual quiz from subject (no RAG)
        prompt = f'Generate 5 conceptual multiple-choice quiz questions about the topic: "{req.topic.strip()}". Make them educational, testing understanding of key concepts, and progressively challenging.'
        raw = await groq_chat(
            [{"role": "system", "content": QUIZ_SYSTEM}, {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2048,
        )
    elif req.content and req.content.strip():
        # Document-based: RAG — retrieve relevant sections, then generate quiz
        name = req.document_name or "Document"
        content = req.content[:15000] if len(req.content) > 15000 else req.content
        retrieved = await retrieve_relevant_sections(content, name, max_chars=10000)
        context = retrieved[:6000] if len(retrieved) > 6000 else retrieved
        prompt = f'Generate 5 multiple-choice quiz questions based ONLY on the following retrieved sections from the document "{name}". Questions must be directly related to this material:\n\n{context}'
        raw = await groq_chat(
            [{"role": "system", "content": QUIZ_SYSTEM}, {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2048,
        )
    else:
        raise HTTPException(status_code=400, detail="Provide either topic or content")

    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Invalid quiz response from AI: {e}")
    if not isinstance(parsed, list) or len(parsed) == 0:
        raise HTTPException(status_code=502, detail="Invalid quiz format received")
    questions = []
    for i, q in enumerate(parsed[:5]):
        questions.append({
            "id": q.get("id", i + 1),
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "correct": int(q.get("correct", 0)) if isinstance(q.get("correct"), (int, float)) else 0,
        })
    return {"questions": questions}


# --- Chat ---
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


ASSISTANT_SYSTEM = "You are Padh.AI, a smart and friendly learning assistant for students. Give short, direct, and to-the-point answers. Use 2-3 sentences max unless the user asks for a detailed explanation. Be clear, accurate, and student-friendly. Avoid unnecessary filler or pleasantries."


@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages required")
    api_messages = [{"role": "system", "content": ASSISTANT_SYSTEM}]
    for m in req.messages:
        api_messages.append({"role": m.role, "content": m.content})
    reply = await groq_chat(api_messages, temperature=0.5, max_tokens=512)
    return {"message": reply}


@app.get("/health")
async def health():
    return {"status": "ok"}
