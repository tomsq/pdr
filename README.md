# iwd

Plan-and-delegate workflow for [Claude Code](https://claude.com/claude-code): the main session (a high-tier model) plans, specs, and reviews, while cheaper Sonnet-tier `implementer` subagents do the actual coding.

## What's inside

- `skills/iwd/SKILL.md` - the `/iwd` skill: workflow for decomposing a task, speccing units, delegating, reviewing, and verifying
- `agents/implementer.md` - the `implementer` subagent definition (Sonnet) that executes well-specified implementation tasks
- `bin/iwd.js` - standalone CLI built on the [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk) that runs the same workflow outside Claude Code
- `.claude-plugin/` - manifests that make the repo installable as a Claude Code plugin

There are two ways to use this, and they're different things. **The plugin** installs the skill and agent into Claude Code as a managed bundle you invoke with `/iwd` inside a session. **The CLI** is a standalone runtime - it drives the same workflow through the Agent SDK, in any terminal, without Claude Code.

## Install as a Claude Code plugin

```sh
claude plugin marketplace add tomsq/iwd
claude plugin install iwd@tomsq
```

That installs the `iwd` skill and the `implementer` agent. Invoke with `/iwd` in any session, or just ask to build a feature with delegated implementation.

If you'd rather own editable copies than subscribe to a managed bundle, copy the files in by hand instead:

```sh
cp -r skills/iwd ~/.claude/skills/iwd
cp agents/implementer.md ~/.claude/agents/implementer.md
```

Pick one route. Doing both leaves you with the skill and agent registered twice.

## Run via npx

Runs the plan-and-delegate workflow against the current directory. No install needed:

```sh
npx iwd "add input validation to the signup form"

# options
npx iwd "task" -m opus --implementer-model sonnet --max-budget 5
```

Auth: uses `ANTHROPIC_API_KEY`, or your existing Claude Code login. The orchestrator runs with `permissionMode: "acceptEdits"` and can read, edit, and run commands in the current directory.

You can also run straight from GitHub: `npx github:tomsq/iwd "task"`.

## How it works

1. **Understand & plan** - the main session reads the codebase and decomposes the task into independently executable units
2. **Spec** - each unit gets files to touch, exact behavior, constraints, and verification steps
3. **Delegate** - `implementer` agents run the specs (parallel when independent)
4. **Review** - the main session reads the diffs, fixes small issues, re-delegates substantial rework
5. **Verify** - build/tests/typecheck across the whole change

Small edits, design-judgment work, and exploratory debugging stay in the main session; delegation is for well-specified mechanical work.
