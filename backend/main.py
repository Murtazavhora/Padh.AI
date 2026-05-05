import os
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load env (works locally, ignored safely in production)
load_dotenv()

# Routers
from routes import chat, ocr, plagiarism, summary
from routes import quiz
from routes.conceptualRoutes import router as conceptual_router
from routes import auth
from routes import upload
from routes.documents import router as documents_router

app = FastAPI(title="Padh.AI API")

# ---------------------------------------------------------------------------
# CORS (🔥 UPDATED FOR PRODUCTION)
# ---------------------------------------------------------------------------
FRONTEND_URL = os.getenv("FRONTEND_URL")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add deployed frontend dynamically
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # 🔥 allow all vercel previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(conceptual_router, prefix="/api/conceptual")
app.include_router(quiz.router,        prefix="/api/quiz")
app.include_router(summary.router,     prefix="/api/summary")
app.include_router(plagiarism.router,  prefix="/api/plagiarism-check")
app.include_router(ocr.router,         prefix="/api/ocr")
app.include_router(chat.router,        prefix="/api/chat")
app.include_router(auth.router,        prefix="/api/auth")
app.include_router(upload.router,      prefix="/api/upload")
app.include_router(documents_router,   prefix="/api/documents")

# ---------------------------------------------------------------------------
# Health Check (used by Render)
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------------------------------------------------------------------
# Local Run ONLY
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)