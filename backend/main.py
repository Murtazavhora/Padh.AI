from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import conceptualQuestions
import uvicorn

app = FastAPI(title="Learning Platform API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(conceptualQuestions.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)