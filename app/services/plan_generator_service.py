from datetime import datetime, timezone, timedelta
from typing import Dict, List, Tuple, Any

from beanie import PydanticObjectId

from app.models.student import Student
from app.models.attempt import Attempt
from app.schemas.weak_topic_schema import WeakTopicResponse
from app.services.weak_topic_service import compute_weak_topics_for_student
from app.utils.constants import (
    LOW_PROGRESS_THRESHOLD,
    SPLIT_WEAK, SPLIT_NEW, SPLIT_REVISION,
    MIN_TASK_MINUTES, LOW_HOURS_ONE_TASK_MAX_MINUTES,
    REVISION_AGE_DAYS,
    NEW_TOPIC_PLACEHOLDER
)


def _subject_progress(progress_map: Dict[str, float], subject: str) -> float:
    return float(progress_map.get(subject, 0.0))


# -----------------------------
# AI-like priority scoring
# -----------------------------
def _score_candidate(
    category: str,
    subject: str,
    progress_map: Dict[str, float],
    incorrect: int = 0,
    total: int = 1
) -> float:

    subject_progress = _subject_progress(progress_map, subject)

    error_rate = incorrect / total if total else 0
    attempt_intensity = min(incorrect / 5, 1)

    score = (
        0.5 * error_rate +
        0.3 * (1 - subject_progress) +
        0.2 * attempt_intensity
    )

    if category == "weak_topic":
        score += 0.2
    elif category == "revision":
        score += 0.1

    return score


def _make_task(description: str, subject: str, topic: str, minutes: int, category: str) -> Dict[str, Any]:
    return {
        "description": description,
        "subject": subject,
        "topic": topic,
        "duration_minutes": int(minutes),
        "category": category
    }


def _split_into_two(bucket_minutes: int) -> Tuple[int, int]:
    a = bucket_minutes // 2
    b = bucket_minutes - a
    return a, b


# --------------------------------
# Revision topic detection
# --------------------------------
async def _compute_revision_candidates(student_id: PydanticObjectId) -> List[Tuple[str, str]]:

    correct_attempts = await Attempt.find(
    Attempt.student_id == student_id,
    Attempt.is_correct == True
).to_list()

    last_seen: Dict[Tuple[str, str], datetime] = {}

    for a in correct_attempts:
        key = (a.subject, a.topic)
        if key not in last_seen or a.timestamp > last_seen[key]:
            last_seen[key] = a.timestamp

    cutoff = datetime.now(timezone.utc) - timedelta(days=REVISION_AGE_DAYS)

    revision = []

    for (subject, topic), last_time in last_seen.items():

        lt = last_time
        if lt.tzinfo is None:
            lt = lt.replace(tzinfo=timezone.utc)

        if lt < cutoff:
            revision.append((subject, topic))

    return revision


# --------------------------------
# Main planner
# --------------------------------
async def generate_daily_tasks(
    student: Student,
    study_hours_override: float | None = None
) -> Tuple[int, List[Dict[str, Any]]]:

    hours = float(study_hours_override) if study_hours_override is not None else float(student.study_hours_per_day)
    total_minutes = int(round(hours * 60))

    progress_map = student.subjects_progress or {}

    # -----------------------------
    # 1. Weak topic analysis
    # -----------------------------
    weak_results: List[WeakTopicResponse] = await compute_weak_topics_for_student(student.id)

    weak_candidates = []

    for w in weak_results:
        if not w.weak:
            continue

        score = _score_candidate(
            "weak_topic",
            w.subject,
            progress_map,
            incorrect=w.incorrect_count,
            total=w.total_attempts
        )

        weak_candidates.append({
            "category": "weak_topic",
            "subject": w.subject,
            "topic": w.topic,
            "score": score,
            "incorrect_count": w.incorrect_count
        })

    # -----------------------------
    # 2. Revision candidates
    # -----------------------------
    revision_topics = await _compute_revision_candidates(student.id)

    revision_candidates = []

    for s, t in revision_topics:

        score = _score_candidate(
            "revision",
            s,
            progress_map
        )

        revision_candidates.append({
            "category": "revision",
            "subject": s,
            "topic": t,
            "score": score
        })

    # -----------------------------
    # 3. New topic candidates
    # -----------------------------
    subjects_sorted = sorted(progress_map.keys(), key=lambda s: progress_map.get(s, 0))

    new_candidates = []

    for s in subjects_sorted:

        score = _score_candidate(
            "new_topic",
            s,
            progress_map
        )

        new_candidates.append({
            "category": "new_topic",
            "subject": s,
            "topic": NEW_TOPIC_PLACEHOLDER,
            "score": score
        })

    # sort candidates
    weak_candidates.sort(key=lambda x: (-x["score"], -x["incorrect_count"]))
    revision_candidates.sort(key=lambda x: -x["score"])
    new_candidates.sort(key=lambda x: -x["score"])

    all_candidates = weak_candidates + new_candidates + revision_candidates
    all_candidates.sort(key=lambda x: -x["score"])

    # -----------------------------
    # Low hours mode
    # -----------------------------
    if total_minutes <= LOW_HOURS_ONE_TASK_MAX_MINUTES:

        if not all_candidates:
            return total_minutes, [
                _make_task(
                    "Study and revise General Studies fundamentals",
                    "General Studies",
                    "Next topic",
                    total_minutes,
                    "new_topic"
                )
            ]

        c = all_candidates[0]

        desc = (
            f"Focus on weak area: {c['topic']} + solve MCQs"
            if c["category"] == "weak_topic"
            else f"Revise {c['topic']} + quick practice"
            if c["category"] == "revision"
            else f"Study next topic in {c['subject']} + make notes"
        )

        return total_minutes, [
            _make_task(desc, c["subject"], c["topic"], total_minutes, c["category"])
        ]

    # -----------------------------
    # Bucket time allocation
    # -----------------------------
    weak_m = int(total_minutes * SPLIT_WEAK)
    new_m = int(total_minutes * SPLIT_NEW)
    rev_m = total_minutes - weak_m - new_m

    if not weak_candidates:
        new_m += weak_m
        weak_m = 0

    if not revision_candidates:
        if weak_candidates:
            weak_m += rev_m
        else:
            new_m += rev_m
        rev_m = 0

    if not new_candidates:
        if weak_candidates:
            weak_m += new_m
        else:
            rev_m += new_m
        new_m = 0

    tasks: List[Dict[str, Any]] = []

    def allocate_bucket(bucket_minutes: int, candidates: List[Dict[str, Any]]):

        if bucket_minutes <= 0 or not candidates:
            return

        if bucket_minutes < MIN_TASK_MINUTES:
            return

        if len(candidates) == 1 or bucket_minutes < 2 * MIN_TASK_MINUTES:

            c = candidates[0]

            desc = (
                f"Revise and practice: {c['topic']}"
                if c["category"] == "weak_topic"
                else f"Study next topic in {c['subject']} and make notes"
                if c["category"] == "new_topic"
                else f"Revision: {c['topic']} (summary + 10 MCQs)"
            )

            tasks.append(
                _make_task(desc, c["subject"], c["topic"], bucket_minutes, c["category"])
            )

            return

        a, b = _split_into_two(bucket_minutes)

        c1, c2 = candidates[0], candidates[1]

        desc1 = (
            f"Revise and practice: {c1['topic']}"
            if c1["category"] == "weak_topic"
            else f"Study next topic in {c1['subject']} and make notes"
            if c1["category"] == "new_topic"
            else f"Revision: {c1['topic']} (summary + 10 MCQs)"
        )

        desc2 = (
            f"Revise and practice: {c2['topic']}"
            if c2["category"] == "weak_topic"
            else f"Study next topic in {c2['subject']} and make notes"
            if c2["category"] == "new_topic"
            else f"Revision: {c2['topic']} (summary + 10 MCQs)"
        )

        tasks.append(_make_task(desc1, c1["subject"], c1["topic"], a, c1["category"]))
        tasks.append(_make_task(desc2, c2["subject"], c2["topic"], b, c2["category"]))

    allocate_bucket(weak_m, weak_candidates)
    allocate_bucket(new_m, new_candidates)
    allocate_bucket(rev_m, revision_candidates)

    current_sum = sum(t["duration_minutes"] for t in tasks)

    if tasks and current_sum != total_minutes:
        tasks[-1]["duration_minutes"] += (total_minutes - current_sum)

    return total_minutes, tasks