import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv('GEMINI_API_KEY')
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

def generate_questions(topic):
    try:
        if not API_KEY:
            return fallback_questions(topic)
            
        response = requests.post(
            f"{API_URL}?key={API_KEY}",
            json={"contents": [{"parts": [{"text": f"Generate 5 interview questions about {topic}. Return only numbered questions."}]}]},
            timeout=10
        )
        
        if response.status_code != 200:
            return fallback_questions(topic)
        
        data = response.json()
        text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        
        questions = []
        for line in text.split('\n'):
            line = line.strip()
            if line and '.' in line:
                q = line.split('.', 1)[-1].strip()
                if q:
                    questions.append(q)
        
        return {"questions": questions[:5], "source": "gemini", "topic": topic}
    except Exception as e:
        print(f"Error: {e}")
        return fallback_questions(topic)

def generate_more_questions(topic):
    return generate_questions(topic + " more advanced concepts")

def fallback_questions(topic):
    return {
        "questions": [
            f"Explain {topic}",
            f"Advantages of {topic}",
            f"Limitations of {topic}",
            f"Real world use of {topic}",
            f"Best practices of {topic}"
        ],
        "source": "fallback",
        "topic": topic
    }