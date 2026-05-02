import os
import json
from dotenv import load_dotenv
from google import genai
from pypdf import PdfReader

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("MODEL", "gemini-1.5-flash")

def ask(prompt):
    try:
        res = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )
        return res.text
    except Exception as e:
        return str(e)

def clean_json(res):
    return res.replace("```json", "").replace("```", "").strip()

# Generate 5 questions from topic
def generate_questions(topic):
    prompt = f"""Generate 5 conceptual questions about {topic}.
Return ONLY JSON format:
{{
  "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
}}"""
    res = ask(prompt)
    res = clean_json(res)
    try:
        return json.loads(res)
    except:
        return {"questions": [f"Question {i+1} about {topic}" for i in range(5)]}

# Generate 5 more questions (different from previous)
def generate_more_questions(topic, current_questions):
    questions_list = "\n".join([f"- {q}" for q in current_questions])
    prompt = f"""Generate 5 MORE conceptual questions about {topic}.
These questions must be DIFFERENT from these existing questions:
{questions_list}

Return ONLY JSON format:
{{
  "questions": ["New Question 1", "New Question 2", "New Question 3", "New Question 4", "New Question 5"]
}}"""
    res = ask(prompt)
    res = clean_json(res)
    try:
        return json.loads(res)
    except:
        return {"questions": [f"Additional Question {i+1} about {topic}" for i in range(5)]}

# Evaluate answer
def evaluate_answer(question, answer):
    prompt = f"""Evaluate this answer.
Question: {question}
Answer: {answer}

Return ONLY JSON:
{{
  "correctness": "Correct/Partially Correct/Incorrect",
  "percentage": 0-100,
  "wrong": "what's missing or wrong",
  "correct_answer": "model answer",
  "feedback": "short improvement suggestion"
}}"""
    res = ask(prompt)
    res = clean_json(res)
    try:
        return json.loads(res)
    except:
        return {
            "correctness": "Unable to evaluate",
            "percentage": 0,
            "wrong": "Please try again",
            "correct_answer": "Answer the question thoroughly",
            "feedback": "Try providing more details"
        }

# Rewrite answer
def rewrite_answer(answer):
    prompt = f"Improve this answer:\n{answer}"
    res = ask(prompt)
    return {"rewritten": res}

# Generate questions from PDF
def generate_questions_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        
        prompt = f"""Based on this text, generate 5 conceptual questions.
Text: {text[:3000]}

Return ONLY JSON:
{{
  "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
}}"""
        res = ask(prompt)
        res = clean_json(res)
        try:
            return json.loads(res)
        except:
            return {"questions": [f"Question {i+1} based on the document" for i in range(5)]}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)