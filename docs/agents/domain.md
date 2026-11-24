# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root.
- **`DECISIONS.md`** at the repo root, with the decisions in `CHARTER.md` section 10: read the entries that touch the area you're about to work in.

If `GLOSSARY.md` doesn't exist, **proceed silently**. Don't flag its absence; don't suggest creating it upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates it lazily when terms actually get resolved.

## File structure

Single-context repo:

```
/
├── CHARTER.md
├── DECISIONS.md
├── GLOSSARY.md
└── src/
```

## Record decisions in `DECISIONS.md`

`DECISIONS.md` takes the place of `docs/adr/`. When a skill says to write or read an ADR, use an entry there, with date, decision, rationale, authority, and consequences (`CHARTER.md` section 7.4). Substantial changes require Ammar's approval.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts an existing decision, surface it explicitly rather than silently overriding:

> _Contradicts D3-D (KaTeX first), but worth reopening because…_
