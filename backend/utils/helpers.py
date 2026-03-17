import re

def parse_questions(text):
    questions = []
    for line in text.split('\n'):
        line = line.strip()
        if line and '.' in line and any(c.isdigit() for c in line[:3]):
            q = line.split('.', 1)[-1].strip()
            if q:
                questions.append(q)
    return questions[:5]

def strip_html(text):
    return re.sub('<[^<]+?>', '', text) if text else ''