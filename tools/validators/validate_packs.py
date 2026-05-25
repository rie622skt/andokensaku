"""Validate question pack JSON files against the runtime schemas.

Run with:
    uv run --project tools/mcp_search_server \
        python tools/validators/validate_packs.py \
        assets/data/packs/compare_v1.json

Or validate every pack in the standard location:
    python tools/validators/validate_packs.py

The validator mirrors the zod schemas in src/data/models/. If you change one,
update both.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Iterable
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field, ValidationError, field_validator
from typing import Literal


# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------

Difficulty = Literal["easy", "normal", "hard"]
ModeLiteral = Literal["compare", "speed", "panel9", "stairs"]


class WordHit(BaseModel):
    word: str = Field(..., min_length=1)
    hit_count: int = Field(..., ge=0)


class QuestionBase(BaseModel):
    id: str = Field(..., min_length=1)
    difficulty: Difficulty = "normal"
    snapshot_date: str
    source: str = "google-cse"


class CompareQuestion(QuestionBase):
    mode: Literal["compare"]
    left: WordHit
    right: WordHit
    explanation: str | None = None


class ComparePack(BaseModel):
    id: str
    mode: Literal["compare"]
    version: int = Field(..., ge=1)
    questions: list[CompareQuestion]


class SpeedRound(QuestionBase):
    mode: Literal["speed"]
    threshold: int = Field(..., ge=0)
    comparator: Literal["over", "under"]
    duration_sec: int = Field(..., ge=1)
    words: list[WordHit] = Field(..., min_length=5)


class SpeedPack(BaseModel):
    id: str
    mode: Literal["speed"]
    version: int = Field(..., ge=1)
    rounds: list[SpeedRound]


class Panel(BaseModel):
    row: int = Field(..., ge=0, le=2)
    col: int = Field(..., ge=0, le=2)
    panel_word: str = Field(..., min_length=1)


class Panel9Board(QuestionBase):
    mode: Literal["panel9"]
    panels: list[Panel] = Field(..., min_length=9, max_length=9)
    hand_pool: list[str] = Field(..., min_length=8)
    and_hit_table: dict[str, int]
    rounds: int = Field(5, ge=1)

    @field_validator("and_hit_table")
    @classmethod
    def _and_table_values(cls, v: dict[str, int]) -> dict[str, int]:
        for key, value in v.items():
            if "|" not in key:
                raise ValueError(f"AND key {key!r} missing '|' separator")
            if value < 0:
                raise ValueError(f"AND value for {key!r} must be >= 0")
        return v


class Panel9Pack(BaseModel):
    id: str
    mode: Literal["panel9"]
    version: int = Field(..., ge=1)
    boards: list[Panel9Board]


class StairsRules(BaseModel):
    must_exceed: bool = True
    choice_count_per_step: int = Field(4, ge=2, le=6)


class StairsRun(QuestionBase):
    mode: Literal["stairs"]
    seed_word: str = Field(..., min_length=1)
    seed_hit_count: int = Field(..., ge=0)
    max_steps: int = Field(..., ge=1)
    word_pool: list[WordHit] = Field(..., min_length=20)
    step_rules: StairsRules


class StairsPack(BaseModel):
    id: str
    mode: Literal["stairs"]
    version: int = Field(..., ge=1)
    runs: list[StairsRun]


SCHEMA_BY_MODE: dict[str, type[BaseModel]] = {
    "compare": ComparePack,
    "speed": SpeedPack,
    "panel9": Panel9Pack,
    "stairs": StairsPack,
}


# --------------------------------------------------------------------------
# Validators
# --------------------------------------------------------------------------

class ValidationIssue:
    def __init__(self, path: str, message: str, fatal: bool = True) -> None:
        self.path = path
        self.message = message
        self.fatal = fatal

    def __str__(self) -> str:
        prefix = "ERROR" if self.fatal else "WARN "
        return f"[{prefix}] {self.path}: {self.message}"


def _sanity_check(pack: Any, mode: str) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []

    if mode == "compare":
        ids: set[str] = set()
        for q in pack.questions:
            if q.id in ids:
                issues.append(ValidationIssue(q.id, "duplicate question id"))
            ids.add(q.id)
            if q.left.word == q.right.word:
                issues.append(
                    ValidationIssue(q.id, "left and right words are identical")
                )
            ratio = max(q.left.hit_count, q.right.hit_count) / max(
                1, min(q.left.hit_count, q.right.hit_count)
            )
            if q.difficulty == "easy" and ratio < 2:
                issues.append(
                    ValidationIssue(
                        q.id,
                        f"easy question should have >=2x ratio (got {ratio:.2f})",
                        fatal=False,
                    )
                )
            if q.left.hit_count == 0 or q.right.hit_count == 0:
                issues.append(
                    ValidationIssue(q.id, "zero hit_count is suspicious", fatal=False)
                )

    elif mode == "speed":
        for r in pack.rounds:
            if len({w.word for w in r.words}) != len(r.words):
                issues.append(
                    ValidationIssue(r.id, "duplicate word in round")
                )

    elif mode == "panel9":
        for b in pack.boards:
            seen_coords = {(p.row, p.col) for p in b.panels}
            if len(seen_coords) != 9:
                issues.append(
                    ValidationIssue(b.id, "panels must cover all 9 grid cells")
                )
            for p in b.panels:
                for h in b.hand_pool:
                    key = f"{p.panel_word}|{h}"
                    if key not in b.and_hit_table:
                        issues.append(
                            ValidationIssue(
                                b.id,
                                f"missing and_hit_table entry for {key!r}",
                            )
                        )

    elif mode == "stairs":
        for r in pack.runs:
            pool_words = {w.word for w in r.word_pool}
            if r.seed_word in pool_words:
                issues.append(
                    ValidationIssue(
                        r.id,
                        "seed_word must not appear in word_pool",
                        fatal=False,
                    )
                )
            if len(pool_words) != len(r.word_pool):
                issues.append(
                    ValidationIssue(r.id, "duplicate words in word_pool")
                )

    return issues


def validate_pack(path: Path) -> tuple[bool, list[ValidationIssue]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    mode = raw.get("mode")
    if mode not in SCHEMA_BY_MODE:
        return False, [ValidationIssue(str(path), f"unknown mode: {mode!r}")]
    schema = SCHEMA_BY_MODE[mode]
    try:
        pack = schema.model_validate(raw)
    except ValidationError as e:
        return False, [
            ValidationIssue(str(path), f"schema error: {e.errors()[:5]}")
        ]
    issues = _sanity_check(pack, mode)
    fatal = any(i.fatal for i in issues)
    return not fatal, issues


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="*", type=Path)
    args = parser.parse_args(argv)

    if not args.paths:
        default_dir = Path("assets/data/packs")
        args.paths = sorted(p for p in default_dir.glob("*.json") if p.name != "packs_manifest.json")

    if not args.paths:
        print("no packs found")
        return 1

    overall_ok = True
    for p in args.paths:
        if not p.exists():
            print(f"[ERROR] {p}: file not found")
            overall_ok = False
            continue
        ok, issues = validate_pack(p)
        status = "OK" if ok else "FAIL"
        print(f"--- {p} [{status}] ---")
        for issue in issues:
            print(issue)
        if not ok:
            overall_ok = False
    return 0 if overall_ok else 1


if __name__ == "__main__":
    sys.exit(main())
