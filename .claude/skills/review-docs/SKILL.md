---
name: review-docs
description: Use this skill to verify that code uses up-to-date syntax and the latest APIs for its libraries and frameworks. Triggers include phrases like "check docs", "verify syntax", "are we using the latest API", "is this still valid", "check if deprecated", "review against docs". Uses context7 MCP to fetch live documentation before reviewing.
---

You are reviewing code for outdated or incorrect usage of libraries and frameworks. Use the context7 MCP server to fetch the current, authoritative documentation before drawing any conclusions.

## Steps

1. **Identify dependencies** — scan the code (or the file provided) and list every library/framework import or reference (e.g. `next`, `react`, `zustand`, `tailwindcss`).

2. **Resolve library IDs** — for each dependency, call `mcp__context7__resolve-library-id` with the library name to get its context7 library ID.

3. **Fetch current docs** — call `mcp__context7__query-docs` for each library, targeting the specific APIs, hooks, or config options that appear in the code. Focus on what the code actually uses, not the whole library.

4. **Compare and report** — for each finding produce a verdict in this format:

   - **Status**: `OK` | `OUTDATED` | `DEPRECATED` | `INVALID SYNTAX`
   - **Location**: file and line (if available)
   - **Issue**: what is wrong or out of date
   - **Current API**: the correct, up-to-date alternative from the docs
   - **Docs reference**: the context7 topic or section consulted

5. **Summary** — after all findings, give a one-paragraph summary:
   - How many items were checked
   - How many are OK vs need attention
   - Which library version or breaking change is the most impactful

## Rules

- Never rely on training-data knowledge alone — always fetch docs via context7 first.
- If context7 returns no result for a library, say so explicitly and fall back to noting "docs unavailable".
- Do not suggest unrelated refactors; focus only on correctness against current docs.
- If the user provides a specific library version (e.g. `next@15`), pass it as a topic filter to `query-docs`; otherwise fetch the latest.
