# pdr

**Plan, Delegate, Review.** A workflow for [Claude Code](https://claude.com/claude-code) where the main session (a high-tier model) plans, specs, and reviews, while cheaper Sonnet-tier `implementer` subagents do the coding. The main session never writes the code itself.

## How it works

The three verbs in the name are the main session's whole job. Every task runs through five steps:

1. **Understand & plan**: the main session reads the codebase and decomposes the task into independently executable units
2. **Spec**: each unit gets files to touch, exact behavior, constraints, and verification steps
3. **Delegate**: `implementer` agents run the specs, in parallel when the units are independent
4. **Review**: the main session reads the diffs, fixes small issues, re-delegates substantial rework
5. **Verify**: build, tests, and typecheck across the whole change

Small edits, design-judgment work, and exploratory debugging stay in the main session. **Delegation is for well-specified mechanical work.**

## What's inside

- `skills/pdr/SKILL.md`: the `/pdr` skill that drives the workflow above
- `agents/implementer.md`: the `implementer` subagent definition (Sonnet) that executes well-specified tasks
- `bin/pdr.js`: standalone CLI built on the [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk)
- `.claude-plugin/`: manifests that make the repo installable as a Claude Code plugin

That gives two ways to run it:

- **The plugin** installs the skill and agent into Claude Code, invoked with `/pdr` inside a session.
- **The CLI** drives the same workflow through the Agent SDK, in any terminal, without Claude Code.

## Install as a Claude Code plugin

The plugin route registers the `pdr` skill and the `implementer` agent as a managed bundle:

```sh
claude plugin marketplace add tomsq/pdr
claude plugin install pdr@tomsq
```

Invoke with `/pdr` in any session, or just ask for a feature with delegated implementation.

For editable copies rather than a managed bundle, copy the files in by hand:

```sh
cp -r skills/pdr ~/.claude/skills/pdr
cp agents/implementer.md ~/.claude/agents/implementer.md
```

**Pick one route.** Doing both registers the skill and agent twice.

## Run via npx

The CLI runs the same workflow against the current directory, with nothing to install:

```sh
npx pdr "add input validation to the signup form"

# options
npx pdr "task" -m opus --implementer-model sonnet --max-budget 5
```

It also runs straight from the repo: `npx github:tomsq/pdr "task"`.

Auth comes from `ANTHROPIC_API_KEY` or an existing Claude Code login. The orchestrator runs with `permissionMode: "acceptEdits"`, so **it can read, edit, and run commands in the current directory**.
