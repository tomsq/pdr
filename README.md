# pdr

**Plan, Delegate, Review.** A workflow for [Claude Code](https://claude.com/claude-code) where the main session (a high-tier model) plans, specs, and reviews, while cheaper Sonnet-tier `implementer` subagents do the actual coding.

Those three verbs are what the main session does. The fourth thing - writing the code - is exactly what it doesn't do.

## What's inside

- `skills/pdr/SKILL.md` - the `/pdr` skill: workflow for decomposing a task, speccing units, delegating, reviewing, and verifying
- `agents/implementer.md` - the `implementer` subagent definition (Sonnet) that executes well-specified implementation tasks
- `bin/pdr.js` - standalone CLI built on the [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk) that runs the same workflow outside Claude Code
- `.claude-plugin/` - manifests that make the repo installable as a Claude Code plugin

There are two ways to use this, and they're different things. **The plugin** installs the skill and agent into Claude Code as a managed bundle you invoke with `/pdr` inside a session. **The CLI** is a standalone runtime - it drives the same workflow through the Agent SDK, in any terminal, without Claude Code.

## Install as a Claude Code plugin

```sh
claude plugin marketplace add tomsq/pdr
claude plugin install pdr@tomsq
```

That installs the `pdr` skill and the `implementer` agent. Invoke with `/pdr` in any session, or just ask to build a feature with delegated implementation.

If you'd rather own editable copies than subscribe to a managed bundle, copy the files in by hand instead:

```sh
cp -r skills/pdr ~/.claude/skills/pdr
cp agents/implementer.md ~/.claude/agents/implementer.md
```

Pick one route. Doing both leaves you with the skill and agent registered twice.

## Run via npx

Runs the workflow against the current directory. No install needed:

```sh
npx pdr "add input validation to the signup form"

# options
npx pdr "task" -m opus --implementer-model sonnet --max-budget 5
```

Auth: uses `ANTHROPIC_API_KEY`, or your existing Claude Code login. The orchestrator runs with `permissionMode: "acceptEdits"` and can read, edit, and run commands in the current directory.

You can also run straight from GitHub: `npx github:tomsq/pdr "task"`.

## How it works

1. **Understand & plan** - the main session reads the codebase and decomposes the task into independently executable units
2. **Spec** - each unit gets files to touch, exact behavior, constraints, and verification steps
3. **Delegate** - `implementer` agents run the specs (parallel when independent)
4. **Review** - the main session reads the diffs, fixes small issues, re-delegates substantial rework
5. **Verify** - build/tests/typecheck across the whole change

Small edits, design-judgment work, and exploratory debugging stay in the main session; delegation is for well-specified mechanical work.
