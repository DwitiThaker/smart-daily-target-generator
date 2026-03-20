# 📘 Smart Daily Target Generator

**"The AI co-pilot that turns every UPSC aspirant into a topper"**  

---

## 🎯 The Problem

UPSC preparation is highly unstructured. Aspirants waste hours deciding what to study, repeat the same conceptual mistakes, and struggle to maintain daily consistency. Manual planning doesn't scale, and static schedules ignore real-time performance signals. The result: decision fatigue, uneven syllabus coverage, and stagnant mock scores.

## 💡 The Solution

A lightweight, rule-based backend service that ingests practice attempts, detects knowledge gaps, and auto-generates **personalized, time-boxed daily study plans**. 

---

## ⚙️ Core Intelligence & Rules

| Component | Logic |
| --- | --- |
| Weak Topic Detection | Groups attempts by (subject, topic); flags topics with ≥2 incorrect answers |
| Priority Scoring | +5 weak topic, +3 low syllabus progress (<0.5), +2 revision-ready (>3 days since last correct attempt) |
| Dynamic Time Allocation | Splits available hours: Weak 50% / New 30% / Revision 20%. Automatically redistributes unused buckets |
| Idempotent Generation | Safe to call multiple times/day; overwrites today's plan instead of duplicating |
| Edge-Case Resilience | Handles zero attempts, ≤1hr availability, and 100% progress gracefully without breaking |

---

## 🏗️ Architecture & Tech Stack

```

FastAPI (Routes) → Service Layer (Pure Business Logic) → Beanie ODM (MongoDB)

```

- **Language**: Python 3.11+

- **Framework**: FastAPI (async, auto OpenAPI docs, Pydantic validation)

- **Database**: MongoDB + Beanie ODM (type-safe document models, zero raw queries)

- **Design Principles**:

  - Strict separation of concerns (routes ≠ services ≠ models)

  - Pure, testable service functions (framework-agnostic)

  - Schema-driven validation (request/response isolated from DB models)

  - Deterministic fallbacks (no silent failures, graceful degradation)

  - Rule-based first for speed & debuggability; LLM/ML layers can sit on top once data volume justifies it

---

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/students` | POST / GET / PATCH | Manage profiles & syllabus progress |
| `/attempts` | POST | Record practice test results |
| `/students/{id}/weak-topics` | GET | Retrieve detected knowledge gaps |
| `/generate-daily-plan` | POST | Generate & persist today's study plan |

🌐 Full interactive documentation available at `/docs` (OpenAPI/Swagger).

---

## 📊 Sample Output

```json

{

  "student_id": "69b428b68827606de364ffe2",

  "date": "2026-03-16",

  "total_minutes": 240,

  "daily_plan": [

    {

      "description": "Revise and practice: Fundamental Rights",

      "subject": "Polity",

      "topic": "Fundamental Rights",

      "duration_minutes": 120,

      "category": "weak_topic"

    },

    {

      "description": "Study next topic in Economy and make notes",

      "subject": "Economy",

      "topic": "Next topic",

      "duration_minutes": 72,

      "category": "new_topic"

    },

    {

      "description": "Revision: 1857 Revolt (summary + 10 MCQs)",

      "subject": "History",

      "topic": "1857 Revolt",

      "duration_minutes": 48,

      "category": "revision"

    }

  ]

}

```
---

## 🧪 Demo Context & Production Notes

This is a **functional demo** built to showcase architecture, decision-making, and rapid execution. All core logic is implemented, tested, and structured for immediate production hardening:

- ✅ Async I/O, type-safe models, and schema isolation

- ✅ Idempotent writes, edge-case handling, and deterministic fallbacks

- ✅ Zero hardcoded thresholds (centralized in `app/utils/constants.py`)

- 🔄 Ready for: JWT auth, rate limiting, structured logging, CI/CD, and queue-based async generation

---

## 🔮 Roadmap (Next 30--60 Days)

- [ ] Spaced repetition engine (SM-2) for intelligent revision scheduling

- [ ] Canonical UPSC syllabus-topic mapping service

- [ ] LLM-enhanced task descriptions & micro-learning resource links

- [ ] Batch attempt ingestion + CSV import for coaching centers

- [ ] Analytics endpoint: `GET /students/{id}/progress-trend`

---

## 🚀 Quick Start

```bash

# 1. Clone & setup

git clone <your-repo-url>

cd smart-daily-target

python -m venv .venv && source .venv/bin/activate

pip install -r requirements.txt

# 2. Run MongoDB (local or Atlas)

# Update MONGO_URL in app/database.py if needed

# 3. Start server

uvicorn app.main:app --reload

```

Open `http://127.0.0.1:8000/docs` to test all endpoints interactively.

---

## 👤 Author

**Dwiti Thaker**  

🔗 [LinkedIn](https://www.linkedin.com/in/dwiti-thaker-a36358236)  

📧 [dwiti.thaker04@gmail.com.com]

*Open to technical deep-dives, integration discussions, or feedback*

---

> *"The AI co-pilot that turns every UPSC aspirant into a topper."*  

> Built in <48 hours with production-grade patterns. Ready to scale.
