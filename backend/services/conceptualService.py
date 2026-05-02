import json
import asyncio
from pypdf import PdfReader
import os

from services.groqService import groq_chat


# ---------------------- SAFE GROQ CALL ----------------------
async def ask(prompt):
    for attempt in range(2):  # retry once
        try:
            res = await groq_chat(
                [{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=700
            )
            return res
        except Exception as e:
            print("[GROQ ERROR]", e)
            await asyncio.sleep(1)

    return None


def clean_json(res):
    return (res or "").replace("```json", "").replace("```", "").strip()


# ---------------------- DIFFICULTY ----------------------
def get_difficulty_label(level: int):
    return {1: "easy", 2: "medium", 3: "hard"}.get(level, "easy")


def get_difficulty_instruction(level: int):
    if level == 1:
        return "Basic understanding and definitions."
    elif level == 2:
        return "Application and reasoning."
    elif level == 3:
        return "Deep analysis and critical thinking."
    return ""


# ---------------------- FALLBACKS ----------------------
def fallback_questions(input_text, difficulty="easy"):
    base = (input_text or "this topic")[:40]
    return {
        "questions": [
            f"What is {base}?",
            f"Explain {base} with example",
            f"Why is {base} important?",
            f"Where is {base} used?",
            f"Describe {base} in simple terms"
        ]
    }


def fallback_more():
    return {
        "questions": [
            "Advanced question 1",
            "Advanced question 2",
            "Advanced question 3",
            "Advanced question 4",
            "Advanced question 5"
        ]
    }


def fallback_eval():
    return {
        "correctness": "Unable to evaluate",
        "percentage": 0,
        "wrong": "Try again",
        "correct_answer": "Explain clearly",
        "feedback": "Add more detail"
    }


# ---------------------- GENERATE QUESTIONS ----------------------
async def generate_questions(input_text, difficulty_level=1):
    difficulty = get_difficulty_label(difficulty_level)
    instruction = get_difficulty_instruction(difficulty_level)

    safe_text = (input_text or "")[:1500]  # 🔥 reduced

    prompt = f"""
Generate EXACTLY 5 conceptual questions.

Difficulty: {difficulty.upper()}
Guidelines: {instruction}

Content:
{safe_text}

Return ONLY JSON:
{{"questions": ["Q1","Q2","Q3","Q4","Q5"]}}
"""

    res = await ask(prompt)

    if not res:
        return fallback_questions(input_text, difficulty)

    res = clean_json(res)

    try:
        data = json.loads(res)
        if "questions" in data and isinstance(data["questions"], list):
            return data
    except Exception as e:
        print("[JSON ERROR]", e)

    return fallback_questions(input_text, difficulty)


# ---------------------- GENERATE MORE ----------------------
async def generate_more_questions(input_text, current_questions, difficulty_level=2):
    difficulty = get_difficulty_label(difficulty_level)
    instruction = get_difficulty_instruction(difficulty_level)

    safe_text = (input_text or "")[:1500]

    existing = "\n".join([f"- {q}" for q in current_questions]) if current_questions else "None"

    prompt = f"""
Generate EXACTLY 5 NEW conceptual questions.

Difficulty: {difficulty.upper()}
Guidelines: {instruction}

Avoid repeating:
{existing}

Content:
{safe_text}

Return ONLY JSON:
{{"questions": ["Q1","Q2","Q3","Q4","Q5"]}}
"""

    res = await ask(prompt)

    if not res:
        return fallback_more()

    res = clean_json(res)

    try:
        data = json.loads(res)
        if "questions" in data:
            return data
    except Exception as e:
        print("[JSON ERROR]", e)

    return fallback_more()


# ---------------------- EVALUATE ----------------------
async def evaluate_answer(question, answer):
    prompt = f"""
Evaluate this answer.

Q: {question}
A: {answer}

Return ONLY JSON:
{{
  "correctness": "Correct/Partially Correct/Incorrect",
  "percentage": 0-100,
  "wrong": "what's missing",
  "correct_answer": "model answer",
  "feedback": "short suggestion"
}}
"""

    res = await ask(prompt)

    if not res:
        return fallback_eval()

    res = clean_json(res)

    try:
        return json.loads(res)
    except Exception as e:
        print("[JSON ERROR]", e)
        return fallback_eval()


# ---------------------- REWRITE ----------------------
async def rewrite_answer(answer):
    prompt = f"Improve this answer:\n{answer}"
    res = await ask(prompt)
    return {"rewritten": res or "Could not rewrite"}


# ---------------------- PDF ----------------------
async def generate_questions_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        return await generate_questions(text, 1)

    except Exception as e:
        print("[PDF ERROR]", e)
        return fallback_questions("")

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)