# Padh.AI – AI-Powered Academic Resource Hub (RAG-Based Learning Assistant)

Padh.AI is an AI-powered academic learning platform that helps students transform unstructured academic resources into structured, personalized, and interactive study material.

The system allows students to upload academic documents such as PDFs, notes, and study materials, and then uses a **Retrieval-Augmented Generation (RAG)** pipeline to generate meaningful learning outputs such as:

- Smart Summaries
- Concept Explanations
- Previous Year Question (PYQ)-style Questions
- Interactive Quizzes
- Personalized Academic Assistance

The core idea behind Padh.AI is to build a practical, scalable academic assistant that can understand student-provided content and generate useful outputs **grounded in the uploaded documents**, rather than relying only on generic LLM responses.

---

## 🚀 Problem Statement

Students often face major challenges while studying from academic documents:

- Large PDFs and notes are difficult to revise quickly
- Important concepts are buried inside lengthy material
- Students struggle to identify exam-relevant questions
- Generic AI tools often give answers not grounded in the actual study material
- Manual preparation of summaries, PYQs, and quizzes is time-consuming

Padh.AI solves this by using a **RAG-based document understanding pipeline** that extracts relevant content from uploaded documents and generates academically useful outputs based on the retrieved context.

---

## 🎯 Project Objectives

- Build an academic AI assistant that works on student-uploaded documents
- Generate **context-aware** outputs grounded in uploaded study material
- Reduce time spent on manual summarization and question preparation
- Improve self-assessment using generated quizzes
- Provide a scalable architecture using **RAG instead of training a custom LLM**
- Make the solution practical for college-level deployment and future productization

---

## 🧠 Why RAG Instead of Training a Custom LLM?

Instead of training or fine-tuning a full large language model, Padh.AI uses **Retrieval-Augmented Generation (RAG)**.

### Why this approach?

- Faster to build
- Lower computational cost
- Easier to deploy
- No need to retrain models on every dataset
- Better grounding in user-uploaded academic content
- More practical for student projects and real-world MVPs

### Key Benefit

The LLM does not answer purely from its pre-trained knowledge.  
Instead, it first receives **retrieved relevant chunks from the uploaded academic documents**, making the output more relevant, accurate, and document-aware.

---

## 🏗️ High-Level System Architecture

Padh.AI follows a modular pipeline:

1. **Document Upload**
2. **Text Extraction / OCR**
3. **Preprocessing & Cleaning**
4. **Chunking**
5. **Embedding Generation**
6. **Vector Storage**
7. **Similarity Retrieval**
8. **Prompt Construction with Retrieved Context**
9. **LLM Response Generation**
10. **Feature Output Layer**
   - Summary
   - PYQs
   - Quiz
   - Concept Q&A

This architecture makes the platform scalable and modular.

---

## 🔄 RAG Pipeline

Padh.AI follows a **Retrieval-Augmented Generation (RAG)** pipeline to ensure that all AI-generated outputs are grounded in the uploaded academic documents instead of relying only on generic model knowledge.

This makes the system more relevant, context-aware, and useful for students.

### Step-by-Step Flow

1. **Document Upload**
   - User uploads academic resources such as PDFs, lecture notes, handouts, or study material.

2. **Text Extraction / OCR**
   - The system extracts text from the uploaded file.
   - If the document is scanned or image-based, OCR is used to convert it into readable text.

3. **Preprocessing**
   - Clean and normalize the extracted text.
   - Remove noise, extra spaces, broken lines, and formatting issues.

4. **Chunking**
   - Split the document into smaller meaningful chunks.
   - This improves retrieval quality and ensures the LLM gets only relevant context.

5. **Embedding Generation**
   - Convert each chunk into vector embeddings using an embedding model.
   - These embeddings capture semantic meaning.

6. **Vector Storage**
   - Store embeddings in a vector database / vector index.
   - Possible implementations: **FAISS**, **ChromaDB**, or **Supabase Vector** (future).

7. **User Request / Query**
   - The user selects an action such as:
     - Generate Summary
     - Generate PYQs
     - Generate Quiz
     - Ask a Conceptual Question

8. **Similarity Retrieval**
   - Retrieve the most relevant chunks from the vector store based on the user request.
   - This ensures only the most useful document context is passed forward.

9. **Prompt Construction**
   - Build a structured prompt containing:
     - Task instruction
     - Retrieved context
     - Formatting constraints
     - Academic output style

10. **LLM Generation**
    - Send the retrieved context + prompt to the LLM.
    - Generate context-aware outputs such as:
      - Summaries
      - Conceptual explanations
      - PYQ-style questions
      - MCQ quizzes

11. **Output Delivery**
    - Display the generated result to the user in the frontend.
    - Optionally store metadata for analytics or future personalization.

---

## 📌 Why This Pipeline Matters

Instead of asking the LLM to answer from general knowledge alone, the system first retrieves relevant information from the uploaded academic documents.

This ensures:

- **Higher relevance**
- **Better grounding in study material**
- **Reduced hallucination risk**
- **More personalized academic assistance**
- **Better quality summaries, PYQs, and quizzes**

---

## 🧠 Simple Flow Representation

```text
Upload Document
   ↓
Text Extraction / OCR
   ↓
Preprocessing & Cleaning
   ↓
Chunking
   ↓
Embedding Generation
   ↓
Vector Storage
   ↓
User Request (Summary / PYQ / Quiz / Q&A)
   ↓
Similarity Retrieval
   ↓
Prompt Construction
   ↓
LLM Response Generation
   ↓
Frontend Output
```

---

## 🛠️ Suggested Tools / Technologies

This project can be implemented using the following technologies:

### Frontend

- **React.js** – for building the user interface
- **Vite** – for fast frontend development
- **CSS / Tailwind CSS** – for styling the application

### Backend

- **Python**
- **FastAPI** – for creating backend APIs

### Document Processing

- **PyMuPDF / PyPDF2 / pdfplumber** – for extracting text from PDF files
- **Tesseract OCR / EasyOCR** – for extracting text from scanned or image-based documents

### RAG / AI Processing

- **LangChain / LlamaIndex** – optional frameworks for managing the RAG pipeline
- **Sentence Transformers / Embedding APIs** – for converting text chunks into embeddings
- **FAISS / ChromaDB** – for storing and retrieving document embeddings
- **Gemini / OpenAI / Groq** – for generating summaries, PYQs, quizzes, and explanations

### Storage (Optional / Future)

- **Supabase** – for user authentication, storing progress, and dashboard data
- **PostgreSQL** – for storing metadata and analytics

---

## 📁 Suggested Project Structure

```bash
Padh.AI/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── routes/
│   │   ├── upload.py
│   │   ├── summary.py
│   │   ├── pyq.py
│   │   ├── quiz.py
│   │   └── qa.py
│   │
│   ├── services/
│   │   ├── extractor.py
│   │   ├── chunker.py
│   │   ├── embedder.py
│   │   ├── retriever.py
│   │   └── llm_service.py
│   │
│   ├── vectorstore/
│   │   └── ...
│   │
│   └── requirements.txt
│
└── README.md
```

---

## 📌 Example Use Cases

### 1. Summary Generation

- User uploads academic notes or a PDF
- The system extracts the important content
- A short and useful summary is generated for quick revision

### 2. PYQ Generation

- User uploads subject material
- The system identifies important concepts
- It generates PYQ-style questions for exam practice

### 3. Quiz Generation

- User enters a topic or selects an uploaded document
- The system creates multiple-choice questions (MCQs)
- The user can attempt the quiz for self-assessment

### 4. Concept Explanation

- User asks a question related to the uploaded material
- The system retrieves relevant content from the document
- A simple explanation is generated based on that context

---

## ▶️ How to Run the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend will run on:

```bash
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## 🔐 Environment Variables (Optional)

If you are using an LLM API such as Gemini, OpenAI, or Groq, add the API key in an environment file.

Example:

```env
GEMINI_API_KEY=your_api_key_here
```

You only need the API key for the provider you are actually using.

---

## 📊 Future Enhancements

- User login and authentication
- Personalized dashboard
- Quiz history tracking
- Weak-topic analysis
- Adaptive quiz difficulty
- Flashcard generation
- Spaced repetition learning
- Leaderboards and gamification
- Supabase integration for real data storage
- Multi-document support
- Citation-based answers from uploaded documents

---

## 🎓 Academic Importance

Padh.AI is designed as an AI-assisted academic learning platform that combines:

- Document understanding
- Information retrieval
- Large language models
- Automated question generation
- Personalized learning support

This project shows how **RAG (Retrieval-Augmented Generation)** can be used in education to make AI outputs more relevant and more useful than general-purpose chatbot responses.

---

## 🏁 Conclusion

Padh.AI is a practical RAG-based academic assistant that helps students turn static study material into interactive learning resources.

By combining document upload, text extraction, retrieval, and AI generation, the platform can provide:

- Summaries
- Concept explanations
- PYQs
- Quizzes
- Future personalized learning support

This makes studying more efficient, interactive, and student-friendly.

---

## 📄 License

This project is for academic and educational purposes.