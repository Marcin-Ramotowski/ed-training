#!/bin/bash
# .claude/hooks/block-dangerous.sh
INPUT=$(cat)

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE 'rm\s+-rf|git\s+push\s+--force|DROP\s+TABLE'; then
  echo '{"permissionDecision": "deny", "permissionDecisionReason": "Zablokowano niebezpieczną komendę. Użyj bezpieczniejszej alternatywy."}'
  exit 0
fi

exit 0