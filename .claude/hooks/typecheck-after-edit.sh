#!/bin/bash
# .claude/hooks/typecheck-after-edit.sh
MAX_ATTEMPTS=5
COUNTER_FILE="/tmp/claude-typecheck-counter-$$"

# Licznik prób - zabezpieczenie przed nieskończoną pętlą
COUNT=0
if [ -f "$COUNTER_FILE" ]; then
  COUNT=$(cat "$COUNTER_FILE")
fi

if [ "$COUNT" -ge "$MAX_ATTEMPTS" ]; then
  rm -f "$COUNTER_FILE"
  exit 0  # Po 5 próbach przepuść - wymaga interwencji człowieka
fi

echo $((COUNT + 1)) > "$COUNTER_FILE"

# Uruchom typecheck
OUTPUT=$(npm run typecheck 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  rm -f "$COUNTER_FILE"  # Reset licznika po sukcesie
  exit 0
fi

# Typecheck nie przeszedł - zwróć błędy do agenta
cat <<EOF
{
  "decision": "block",
  "reason": "TypeScript errors found (attempt $((COUNT + 1))/$MAX_ATTEMPTS):\n$(echo "$OUTPUT" | tail -20 | jq -Rs .)"
}
EOF