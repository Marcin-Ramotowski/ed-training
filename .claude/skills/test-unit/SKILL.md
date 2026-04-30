---
name: test-unit
description: Use this skill when the user asks to generate, write, or add unit tests in Vitest for TypeScript/JavaScript code — either pasted directly or referenced by a file path. Triggers include phrases such as "write tests", "generate tests", "add unit tests", "cover with tests", "Vitest tests", "write tests", "unit tests", as well as any request to provide test coverage for a specific function, module, or file.
---

Generate unit tests using Vitest for the given code or file.

Requirements:
- Import from vitest: describe, it, expect, vi
- Test both happy paths and edge cases
- Mock external dependencies using vi.mock()
- Test names should be descriptive and written in Polish
- Each public function should have at least 3 tests

Place the test file next to the source file with the suffix .test.ts