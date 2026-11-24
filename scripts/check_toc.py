"""Check docs/table-of-contents.md against docs/gap-assessment.md."""

import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs"
errors = []


def check(ok, message):
    if not ok:
        errors.append(message)


def ids(text):
    return re.findall(r"`([a-z0-9-]+)`", text)


chapters = {}  # ID -> whether the chapter is in the Full Book part
part = None
last_in_part = {}
for block in re.split(r"(?m)^(?=#{2,3} )", (DOCS / "table-of-contents.md").read_text(encoding="utf-8")):
    heading = block.splitlines()[0]
    if found := re.match(r"## \d+\. Part (\w+)", heading):
        part = found[1]
    if not (found := re.match(r"### (\d+)\. ", heading)):
        continue
    number = int(found[1])
    fields = dict(re.findall(r"(?m)^- \*\*(\w+):\*\* ?(.*)$", block))
    check({"ID", "Outcome", "Needs", "Level"} <= fields.keys(), f"chapter {number}: missing field")
    chapter = "".join(ids(fields.get("ID", ""))[:1])
    check(chapter and chapter not in chapters, f"chapter {number}: missing or repeated ID")
    check(number == len(chapters) + 1, f"{chapter}: expected number {len(chapters) + 1}")
    needs = ids(fields.get("Needs", ""))
    check(needs or number == 1, f"{chapter}: no prerequisites")
    for need in needs:
        check(need in chapters, f"{chapter}: needs {need}, which does not come earlier")
    numbers = re.findall(r"(?m)^  (\d+)\. ", block)
    lessons = len(numbers)
    check(numbers == [str(i) for i in range(1, lessons + 1)], f"{chapter}: lesson numbers skip")
    if part == "V":
        check(lessons == 0, f"{chapter}: lessons are not listed in Part V")
    else:
        check(3 <= lessons <= 6, f"{chapter}: {lessons} lessons")
    chapters[chapter] = part == "V"
    last_in_part[part] = (chapter, heading)

for name in ("I", "II", "III"):
    check("Capstone" in last_in_part[name][1], f"Part {name} does not end with a capstone")

used = set()
rows = 0
for line in (DOCS / "gap-assessment.md").read_text(encoding="utf-8").splitlines():
    if line.startswith("## "):
        section = line[3]
    if not line.startswith("| ") or section not in "23":
        continue
    cells = [cell.strip() for cell in line.strip("|").split("|")]
    if cells[0] in ("MML", "ID", "---"):
        continue
    rows += 1
    # Columns hold no escaped pipes, so the last cell is the chapter list.
    milestone = cells[4]
    covered = ids(cells[-1])
    used.update(covered)
    for chapter in covered:
        check(chapter in chapters, f"{cells[0]}: unknown chapter {chapter}")
    covered = [chapter for chapter in covered if chapter in chapters]
    if milestone == "–":
        check(covered or cells[-1] in ("–", "later"), f"{cells[0]}: no chapter")
        continue
    for label, full_book in (("M1", False), ("M2", True)):
        has = any(chapters[chapter] == full_book for chapter in covered)
        check(has == (label in milestone), f"{cells[0]}: {milestone} does not match {cells[-1]}")

check(rows == 86, f"expected 86 topic rows, found {rows}")
for chapter in chapters:
    check(chapter in used, f"{chapter}: covers no topic in the gap assessment")

print("\n".join(errors) or f"OK: {len(chapters)} chapters, {rows} topics")
sys.exit(bool(errors))
