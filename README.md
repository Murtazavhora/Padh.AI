# Padh.AI

AI-powered learning platform for students. Upload documents, get summaries, take topic-based quizzes, and chat with an assistant—all via a FastAPI backend using Groq AI.

---

## Getting Started

1. Clone the repo: `git clone <repository-url>`
2. **Backend**
   - `cd backend`
   - Create a virtual env (optional): `python -m venv .venv` then activate it
   - Install: `pip install -r requirements.txt`
   - **Tesseract OCR:** Install [Tesseract](https://github.com/tesseract-ocr/tesseract) on your system (required for image/scanned-doc uploads). On Windows, optionally set `TESSERACT_CMD` in `.env` to the path of `tesseract.exe` (e.g. `C:\Program Files\Tesseract-OCR\tesseract.exe`).
   - Copy `.env.example` to `.env` and set `GROQ_API_KEY=your_groq_api_key`
   - Run: `uvicorn main:app --reload` (API at `http://localhost:8000`)
3. **Frontend**
   - `cd frontend`
   - `npm install`
   - Optional: create `frontend/.env.local` with `VITE_API_BASE_URL=http://localhost:8000` (default is already `http://localhost:8000`)
   - Run: `npm run dev` (app at `http://localhost:5173`)

---

## Installing Tesseract (for image/scanned document OCR)

OCR for images (e.g. `.png`, `.jpg`) and scanned documents requires **Tesseract** to be installed on your machine.

**Windows**

1. Download the installer: [Tesseract at UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki).
2. Run the installer and note the install path (e.g. `C:\Program Files\Tesseract-OCR`).
3. Either add Tesseract to your system PATH, or set the path in the backend:
   - In `backend/.env` add:  
     `TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe`  
     (adjust the path if you installed elsewhere.)
4. Restart the backend after installing Tesseract.

**If you see "Access is denied" (WinError 5):** The Python process may not have permission to run Tesseract from `Program Files`. Either run your terminal/backend **as Administrator**, or reinstall Tesseract to a folder like `C:\Tesseract-OCR` and set `TESSERACT_CMD=C:\Tesseract-OCR\tesseract.exe` in `backend/.env`.

Without Tesseract (or with permission issues), image uploads will show an error and the document will not be added.

---

## How to Run

- **Backend:** From `backend/`, run `uvicorn main:app --reload`
- **Frontend:** From `frontend/`, run `npm run dev`
- **Build frontend:** `npm run build` (output in `frontend/dist`)
- **Preview build:** `npm run preview`

---

## Technologies Used

- **Frontend:** React 19, Vite 7, react-icons, CSS (dark theme)
- **Backend:** Python, FastAPI, httpx, python-dotenv, pytesseract, Pillow
- **OCR:** Tesseract (for images and scanned documents)
- **AI:** Groq API (Llama 3.3)

---

## Features

- **Document upload** – Add PDFs, docs, images, text; list in Recent Documents. **OCR** extracts text from images and scanned docs (Tesseract). **Plagiarism check** (Groq, 30% threshold) runs at upload: low plagiarism → document added; high → not uploaded.
- **Document summary** – AI summary (Summary + Key Points) via backend
- **Quiz mode** – 5 MCQs from topic or uploaded doc; 80%+ unlocks Tic Tac Toe
- **Assistant** – Short, on-point answers via backend chat
- **Recommended** – Active learning: 10 questions per topic + notes
- **Remove documents** – Delete from Recent Documents or Summary page
