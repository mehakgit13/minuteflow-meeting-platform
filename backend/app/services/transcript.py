import re
from collections import Counter

TIMESTAMP_RE = re.compile(
    r"^\s*\[?(?P<time>\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(?P<speaker>[^:]{1,60})?:?\s*(?P<text>.+)$"
)
STOP_WORDS = {
    "the",
    "and",
    "for",
    "that",
    "with",
    "this",
    "from",
    "have",
    "will",
    "about",
    "into",
    "your",
    "our",
    "are",
    "was",
    "were",
    "but",
    "not",
    "you",
    "they",
    "their",
    "then",
    "than",
    "can",
    "could",
    "should",
    "would",
    "meeting",
    "team",
    "need",
    "also",
}


def time_to_seconds(value: str) -> int:
    parts = [int(p) for p in value.split(":")]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def parse_transcript(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    segments: list[dict] = []
    fallback_start = 0
    for line in lines:
        match = TIMESTAMP_RE.match(line)
        if match and match.group("time"):
            start = time_to_seconds(match.group("time"))
            speaker = (match.group("speaker") or "Speaker").strip(" -")
            body = match.group("text").strip()
        else:
            start = fallback_start
            speaker = "Speaker"
            body = line
        if not body:
            continue
        segments.append(
            {
                "speaker": speaker,
                "start_seconds": start,
                "end_seconds": start + max(8, min(45, len(body) // 3)),
                "text": body,
            }
        )
        fallback_start = segments[-1]["end_seconds"]
    for i in range(len(segments) - 1):
        segments[i]["end_seconds"] = max(
            segments[i]["start_seconds"] + 1, segments[i + 1]["start_seconds"]
        )
    return segments


def derive_topics(text: str, limit: int = 5) -> list[str]:
    words = re.findall(r"[A-Za-z][A-Za-z-]{3,}", text.lower())
    counts = Counter(word for word in words if word not in STOP_WORDS)
    return [word.title() for word, _ in counts.most_common(limit)]


def derive_summary(segments: list[dict]) -> str:
    if not segments:
        return "No transcript was provided. Add transcript content to generate a useful summary."
    snippets = [s["text"] for s in segments[:3]]
    return " ".join(snippets)[:700]
