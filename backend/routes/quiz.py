import json
import os
import re
import uuid
from collections import Counter
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

QUESTION_COUNT = 10


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct: int
    explanation: str


class QuizGenerateRequest(BaseModel):
    topic: Optional[str] = None
    content: Optional[str] = None
    difficulty_level: int = Field(default=1, ge=1, le=3)


class QuizGenerateMoreRequest(BaseModel):
    topic: Optional[str] = None
    content: Optional[str] = None
    difficulty_level: int = Field(default=2, ge=1, le=3)


class QuizSubmitRequest(BaseModel):
    quiz_id: str
    questions: List[QuizQuestion]
    answers: Dict[str, int]


def _normalize_text(value: Optional[str]) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def _difficulty_label(difficulty_level: int) -> str:
    return {1: "easy", 2: "moderate", 3: "advanced"}.get(difficulty_level, "easy")


def _extract_json_array(text: str) -> Optional[List[Dict[str, Any]]]:
    cleaned = (text or "").strip()
    if not cleaned:
        return None

    fence_match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, flags=re.DOTALL | re.IGNORECASE)
    if fence_match:
        cleaned = fence_match.group(1).strip()

    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start == -1 or end == -1 or end <= start:
        return None

    candidate = cleaned[start : end + 1]
    try:
        data = json.loads(candidate)
    except json.JSONDecodeError:
        return None

    if not isinstance(data, list):
        return None
    return data


def _validate_and_normalize_questions(raw_questions: Any) -> Optional[List[Dict[str, Any]]]:
    if not isinstance(raw_questions, list) or len(raw_questions) == 0:
        return None

    normalized: List[Dict[str, Any]] = []
    for index, item in enumerate(raw_questions, start=1):
        if not isinstance(item, dict):
            return None

        question = _normalize_text(str(item.get("question", "")))
        explanation = _normalize_text(str(item.get("explanation", "")))
        options = item.get("options")
        correct = item.get("correct")

        if not question or not explanation:
            return None
        if not isinstance(options, list) or len(options) != 4:
            return None
        if any(not _normalize_text(str(opt)) for opt in options):
            return None
        if not isinstance(correct, int) or correct < 0 or correct > 3:
            return None

        normalized.append(
            {
                "id": index,
                "question": question,
                "options": [_normalize_text(str(opt)) for opt in options],
                "correct": correct,
                "explanation": explanation,
            }
        )

    return normalized


def _build_prompt(topic: str, content: str, difficulty_level: int) -> str:
    difficulty = _difficulty_label(difficulty_level)
    context_lines = []
    if topic:
        context_lines.append(f"Topic: {topic}")
    if content:
        context_lines.append(f"Document content context:\n{content[:3000]}")

    context_block = "\n\n".join(context_lines)
    return (
        "Generate exactly 10 academically relevant MCQ questions. "
        f"Difficulty: {difficulty}.\n\n"
        f"{context_block}\n\n"
        "Return ONLY a valid JSON array with exactly 10 objects. "
        "No markdown, no extra text.\n"
        "Each object must include exactly these keys:\n"
        "- id (integer)\n"
        "- question (string)\n"
        "- options (array of exactly 4 strings)\n"
        "- correct (integer from 0 to 3)\n"
        "- explanation (string)\n"
        "Ensure options are plausible and only one is correct."
    )


async def _generate_with_gemini(
    topic: str,
    content: str,
    difficulty_level: int,
) -> Optional[List[Dict[str, Any]]]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    prompt = _build_prompt(topic=topic, content=content, difficulty_level=difficulty_level)

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a quiz generator. Return ONLY valid JSON array, no markdown, no explanation."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 4096,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=30.0,
            )
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print("❌ GROQ REQUEST FAILED:", e)
        return None

    text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    print("✅ GROQ RAW RESPONSE:", text)

    parsed = _extract_json_array(text)
    if parsed is None:
        return None

    return _validate_and_normalize_questions(parsed)


def _detect_topic_category(topic: str) -> str:
    t = topic.lower()
    if any(k in t for k in ["artificial intelligence", "ai"]):
        return "ai"
    if any(k in t for k in ["machine learning", "ml"]):
        return "ml"
    if "nlp" in t or "natural language" in t:
        return "nlp"
    if "python" in t:
        return "python"
    if "sql" in t:
        return "sql"
    if any(k in t for k in ["dbms", "database"]):
        return "dbms"
    if any(k in t for k in ["computer network", "networking", "network"]):
        return "networking"
    return "generic"


def _topic_terms(category: str, difficulty_level: int, topic: str) -> Dict[str, str]:
    level_terms = {
        1: {"depth": "basic", "action": "identify", "analysis": "simple understanding"},
        2: {"depth": "intermediate", "action": "apply", "analysis": "conceptual reasoning"},
        3: {"depth": "advanced", "action": "analyze", "analysis": "critical evaluation"},
    }
    common = level_terms.get(difficulty_level, level_terms[1])

    category_map = {
        "ai": {
            "concept": "intelligent agents",
            "method": "rule-based and learning-based approaches",
            "evaluation": "task success and robustness",
            "pitfall": "bias in training knowledge",
        },
        "ml": {
            "concept": "learning patterns from data",
            "method": "model training and validation",
            "evaluation": "generalization on unseen data",
            "pitfall": "overfitting to training samples",
        },
        "nlp": {
            "concept": "language understanding",
            "method": "tokenization and contextual representation",
            "evaluation": "semantic and task accuracy",
            "pitfall": "ambiguity and context loss",
        },
        "python": {
            "concept": "readable programming constructs",
            "method": "functions, modules, and libraries",
            "evaluation": "correctness and maintainability",
            "pitfall": "runtime and logical errors",
        },
        "sql": {
            "concept": "structured data querying",
            "method": "SELECT, JOIN, and filtering",
            "evaluation": "query correctness and efficiency",
            "pitfall": "incorrect joins or filters",
        },
        "dbms": {
            "concept": "organized data management",
            "method": "schema design and normalization",
            "evaluation": "consistency and retrieval performance",
            "pitfall": "redundancy and anomalies",
        },
        "networking": {
            "concept": "communication between systems",
            "method": "layered protocols and routing",
            "evaluation": "reliability and throughput",
            "pitfall": "congestion and packet loss",
        },
        "generic": {
            "concept": f"core ideas of {topic}",
            "method": f"standard approaches used in {topic}",
            "evaluation": f"quality measures in {topic}",
            "pitfall": f"common misconceptions in {topic}",
        },
    }
    data = category_map.get(category, category_map["generic"])
    return {**common, **data}


def _build_topic_fallback(topic: str, difficulty_level: int) -> List[Dict[str, Any]]:
    category = _detect_topic_category(topic)
    terms = _topic_terms(category, difficulty_level, topic)

    questions = [
        {
            "id": 1,
            "question": (
                f"In {topic}, what best represents a {terms['depth']} understanding of "
                f"{terms['concept']}?"
            ),
            "options": [
                f"Understanding how {terms['concept']} supports problem solving",
                "Memorizing unrelated facts without context",
                "Ignoring data and evidence while making decisions",
                "Treating every task as identical regardless of goals",
            ],
            "correct": 0,
            "explanation": (
                f"A strong foundation in {topic} starts by understanding how {terms['concept']} "
                "is used to solve target problems."
            ),
        },
        {
            "id": 2,
            "question": (
                f"Which option best describes how to {terms['action']} knowledge in {topic}?"
            ),
            "options": [
                f"Use {terms['method']} to address a clearly defined task",
                "Avoid structured methods and rely only on guesswork",
                "Use random outputs without checking outcomes",
                "Focus only on formatting and skip the core logic",
            ],
            "correct": 0,
            "explanation": (
                f"Application in {topic} requires using suitable methods such as "
                f"{terms['method']} for a concrete objective."
            ),
        },
        {
            "id": 3,
            "question": (
                f"At {terms['depth']} level, which practice improves {terms['analysis']} in {topic}?"
            ),
            "options": [
                "Comparing alternatives using evidence and clear criteria",
                "Choosing the first answer without verification",
                "Skipping assumptions and constraints",
                "Treating evaluation as optional",
            ],
            "correct": 0,
            "explanation": (
                "Higher-order understanding comes from comparing options critically, "
                "not from unverified choices."
            ),
        },
        {
            "id": 4,
            "question": f"Which metric is most useful when evaluating work in {topic}?",
            "options": [
                terms["evaluation"].capitalize(),
                "Number of pages written regardless of correctness",
                "How quickly results are copied",
                "Color theme used in presentation slides",
            ],
            "correct": 0,
            "explanation": (
                f"Meaningful evaluation in {topic} focuses on {terms['evaluation']}."
            ),
        },
        {
            "id": 5,
            "question": f"What is a common challenge to watch for in {topic}?",
            "options": [
                terms["pitfall"].capitalize(),
                "Using precise terminology",
                "Reviewing evidence before concluding",
                "Documenting assumptions clearly",
            ],
            "correct": 0,
            "explanation": (
                f"A frequent issue in {topic} is {terms['pitfall']}, which can reduce quality "
                "if not addressed."
            ),
        },
    ]
    return questions


STOPWORDS = {
    "the",
    "is",
    "are",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "by",
    "as",
    "at",
    "this",
    "that",
    "these",
    "those",
    "it",
    "from",
    "be",
    "was",
    "were",
    "can",
    "could",
    "should",
    "would",
    "about",
    "into",
    "their",
    "there",
    "them",
    "such",
    "also",
    "than",
    "then",
    "using",
    "used",
    "use",
}


def _extract_keywords(content: str, limit: int = 6) -> List[str]:
    chunk = content[:1000].lower()
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9_-]{2,}", chunk)
    filtered = [w for w in words if w not in STOPWORDS]
    if not filtered:
        return []
    counts = Counter(filtered)
    return [word for word, _ in counts.most_common(limit)]


def _build_content_fallback(content: str, difficulty_level: int) -> List[Dict[str, Any]]:
    chunk = _normalize_text(content[:1000])
    keywords = _extract_keywords(chunk)
    if len(keywords) < 4:
        keywords = ["concept", "process", "evidence", "application", "analysis", "outcome"]

    focus = keywords[0]
    secondary = keywords[1]
    tertiary = keywords[2]
    quaternary = keywords[3]

    depth_text = {1: "basic", 2: "intermediate", 3: "advanced"}.get(difficulty_level, "basic")

    return [
        {
            "id": 1,
            "question": f"Based on the provided content, what is the most likely main focus?",
            "options": [
                f"The discussion centers on {focus} and related ideas",
                "The text is only about citation formatting",
                "The content is unrelated to any academic theme",
                "The text contains no meaningful concepts",
            ],
            "correct": 0,
            "explanation": (
                f"The extracted keywords indicate {focus} as a central idea in the provided material."
            ),
        },
        {
            "id": 2,
            "question": (
                f"Which option best reflects a {depth_text} understanding of {secondary} "
                "in the document context?"
            ),
            "options": [
                f"Understanding how {secondary} contributes to the document's explanation",
                f"Ignoring {secondary} because only titles matter",
                f"Treating {secondary} as a purely decorative term",
                f"Assuming {secondary} has no relation to the topic",
            ],
            "correct": 0,
            "explanation": (
                f"A meaningful interpretation connects {secondary} to the broader explanation in the text."
            ),
        },
        {
            "id": 3,
            "question": "What is the best study strategy for this type of content?",
            "options": [
                f"Map links among {focus}, {secondary}, and {tertiary}",
                "Memorize isolated lines without understanding",
                "Skip examples and focus only on headings",
                "Avoid reviewing key terms after reading",
            ],
            "correct": 0,
            "explanation": "Connecting key concepts improves comprehension and retention."
        },
        {
            "id": 4,
            "question": f"Which inference is most reasonable from the provided content?",
            "options": [
                f"{quaternary.capitalize()} is likely part of the conceptual framework",
                "The document intentionally avoids all technical ideas",
                "No relationship exists among major terms",
                "Only non-academic storytelling is present",
            ],
            "correct": 0,
            "explanation": (
                f"Frequent terms suggest {quaternary} is conceptually connected to the main discussion."
            ),
        },
        {
            "id": 5,
            "question": "Which question would best test deeper comprehension of this material?",
            "options": [
                f"How do {focus} and {tertiary} interact in practical scenarios?",
                "What is the font style used in the document?",
                "How many spaces appear in each paragraph?",
                "What color would best match the topic?",
            ],
            "correct": 0,
            "explanation": (
                "Deeper comprehension is assessed by relationship and application questions, not formatting."
            ),
        },
    ]


def _build_fallback_questions(topic: str, content: str, difficulty_level: int) -> List[Dict[str, Any]]:
    if topic:
        return _build_topic_fallback(topic=topic, difficulty_level=difficulty_level)
    return _build_content_fallback(content=content, difficulty_level=difficulty_level)


async def _generate_quiz(topic: str, content: str, difficulty_level: int) -> Dict[str, Any]:
    questions = await _generate_with_gemini(topic=topic, content=content, difficulty_level=difficulty_level)
    source = "gemini"

    if not questions:
        questions = _build_fallback_questions(topic=topic, content=content, difficulty_level=difficulty_level)
        validated = _validate_and_normalize_questions(questions)
        if not validated:
            raise HTTPException(status_code=500, detail="Failed to generate valid quiz questions.")
        questions = validated
        source = "fallback"

    return {
        "quiz_id": str(uuid.uuid4()),
        "difficulty_level": difficulty_level,
        "questions": questions,
        "source": source,
    }


def _compute_gamification(questions: List[QuizQuestion], answers: Dict[str, int]) -> Dict[str, Any]:
    total = len(questions)
    score = 0

    for q in questions:
        submitted = answers.get(str(q.id))
        if isinstance(submitted, int) and submitted == q.correct:
            score += 1

    accuracy = int(round((score / total) * 100)) if total > 0 else 0
    xp_earned = score * 10

    if xp_earned <= 20:
        level = "Beginner"
    elif xp_earned <= 40:
        level = "Learner"
    else:
        level = "Scholar"

    badges: List[str] = []
    if accuracy >= 80:
        badges.append("Quick Learner")
    if total > 0 and score == total:
        badges.append("Perfect Score")
    if score >= 3:
        badges.append("Knowledge Builder")

    return {
        "score": score,
        "total": total,
        "accuracy": accuracy,
        "xp_earned": xp_earned,
        "level": level,
        "badges": badges,
        "unlock_game": accuracy >= 80,
    }


@router.post("/generate")
async def generate_quiz(req: QuizGenerateRequest):
    topic = _normalize_text(req.topic)
    content = _normalize_text(req.content)
    if not topic and not content:
        raise HTTPException(status_code=400, detail="Either topic or content must be provided.")

    return await _generate_quiz(topic=topic, content=content, difficulty_level=req.difficulty_level)


@router.post("/submit")
async def submit_quiz(req: QuizSubmitRequest):
    if not req.questions:
        raise HTTPException(status_code=400, detail="Questions list cannot be empty.")

    for q in req.questions:
        if len(q.options) != 4:
            raise HTTPException(status_code=400, detail=f"Question {q.id} must have exactly 4 options.")
        if q.correct < 0 or q.correct > 3:
            raise HTTPException(status_code=400, detail=f"Question {q.id} has invalid correct index.")

    return _compute_gamification(req.questions, req.answers)


@router.post("/generate-more")
async def generate_more_quiz(req: QuizGenerateMoreRequest):
    topic = _normalize_text(req.topic)
    content = _normalize_text(req.content)
    if not topic and not content:
        raise HTTPException(status_code=400, detail="Either topic or content must be provided.")

    return await _generate_quiz(topic=topic, content=content, difficulty_level=req.difficulty_level)
