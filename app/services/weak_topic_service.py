from beanie import PydanticObjectId
from typing import List

from app.schemas.weak_topic_schema import WeakTopicResponse
from app.models.attempt import Attempt


WEAK_TOPIC_THRESHOLD = 3


async def compute_weak_topics_for_student(student_id: PydanticObjectId) -> List[WeakTopicResponse]:

    attempts = await Attempt.find(Attempt.student_id == student_id).to_list()

    groups = {}

    for attempt in attempts:
        key = (attempt.subject, attempt.topic)

        if key not in groups:
            groups[key] = {"incorrect": 0, "total": 0}

        groups[key]["total"] += 1

        if not attempt.is_correct:
            groups[key]["incorrect"] += 1

    results = []

    for (subject, topic), counts in groups.items():

        incorrect = counts["incorrect"]
        total = counts["total"]

        weak = incorrect >= WEAK_TOPIC_THRESHOLD and (incorrect / total) >= 0.5

        results.append(
            WeakTopicResponse(
                subject=subject,
                topic=topic,
                incorrect_count=incorrect,
                total_attempts=total,
                weak=weak
            )
        )

    results.sort(key=lambda x: (-x.weak, -x.incorrect_count))

    return results