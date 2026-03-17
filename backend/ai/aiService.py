import httpx
import os

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

async def call_gemini(prompt):
    try:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return None
            
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_URL}?key={api_key}",
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                return data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            return None
    except:
        return None