# iwd

Plan-and-delegate workflow for [Claude Code](https://claude.com/claude-code): the main session (a high-tier model) plans, specs, and reviews, while cheaper Sonnet-tier `implementer` subagents do the actual coding.

## What's inside

- `skills/iwd/SKILL.md` - the `/iwd` skill: workflow for decomposing a task, speccing units, delegating, reviewing, and verifying
- `agents/implementer.md` - the `implementer` subagent definition (Sonnet) that executes well-specified implementation tasks

## Install

Copy the files into your Claude Code user config:

```sh
cp -r skills/iwd ~/.claude/skills/iwd
cp agents/implementer.md ~/.claude/agents/implementer.md
```

Then invoke with `/iwd` in any session, or just ask to build a feature with delegated implementation.

## How it works

1. **Understand & plan** - the main session reads the codebase and decomposes the task into independently executable units
2. **Spec** - each unit gets files to touch, exact behavior, constraints, and verification steps
3. **Delegate** - `implementer` agents run the specs (parallel when independent)
4. **Review** - the main session reads the diffs, fixes small issues, re-delegates substantial rework
5. **Verify** - build/tests/typecheck across the whole change

Small edits, design-judgment work, and exploratory debugging stay in the main session; delegation is for well-specified mechanical work.
