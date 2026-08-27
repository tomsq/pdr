#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { query } from "@anthropic-ai/claude-agent-sdk";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function stripFrontmatter(markdown) {
  const match = markdown.match(/^---\n[\s\S]*?\n---\n/);
  return match ? markdown.slice(match[0].length).trim() : markdown.trim();
}

function readDoc(relPath) {
  return stripFrontmatter(readFileSync(join(pkgRoot, relPath), "utf8"));
}

const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--model" || args[i] === "-m") flags.model = args[++i];
  else if (args[i] === "--implementer-model") flags.implementerModel = args[++i];
  else if (args[i] === "--max-budget") flags.maxBudgetUsd = Number(args[++i]);
  else if (args[i] === "--help" || args[i] === "-h") flags.help = true;
  else positional.push(args[i]);
}

const task = positional.join(" ").trim();

if (flags.help || !task) {
  console.log(`iwd - plan-and-delegate coding agent

The orchestrator plans, specs, and reviews. Sonnet-tier "implementer"
subagents do the actual coding. Runs against the current directory.

Usage:
  iwd "<task>" [options]

Options:
  -m, --model <model>          Orchestrator model (default: opus)
  --implementer-model <model>  Implementer model (default: sonnet)
  --max-budget <usd>           Stop when total cost exceeds this amount
  -h, --help                   Show this help

Auth: uses ANTHROPIC_API_KEY, or your existing Claude Code login.`);
  process.exit(flags.help ? 0 : 1);
}

const workflow = readDoc("skills/iwd/SKILL.md");
const implementerPrompt = readDoc("agents/implementer.md");

const stream = query({
  prompt: task,
  options: {
    model: flags.model ?? "opus",
    cwd: process.cwd(),
    permissionMode: "acceptEdits",
    allowedTools: ["Read", "Glob", "Grep", "Bash", "Edit", "Write", "Agent", "TodoWrite", "WebFetch"],
    systemPrompt: {
      type: "preset",
      preset: "claude_code",
      append: `${workflow}\n\nDelegate implementation units to the \`implementer\` subagent via the Agent tool.`,
    },
    agents: {
      implementer: {
        description:
          "Executes well-specified implementation tasks (code edits, refactors, mechanical changes) handed down by the orchestrator.",
        prompt: implementerPrompt,
        model: flags.implementerModel ?? "sonnet",
      },
    },
    ...(Number.isFinite(flags.maxBudgetUsd) ? { maxBudgetUsd: flags.maxBudgetUsd } : {}),
  },
});

for await (const message of stream) {
  if (message.type === "assistant" && message.message?.content) {
    for (const block of message.message.content) {
      if (block.type === "text" && block.text.trim()) {
        console.log(block.text);
      } else if (block.type === "tool_use" && block.name === "Agent") {
        console.log(`\n[delegating: ${block.input?.description ?? "implementation unit"}]`);
      }
    }
  } else if (message.type === "result") {
    const cost = message.total_cost_usd;
    if (typeof cost === "number") {
      console.log(`\nDone (${message.subtype}) - cost $${cost.toFixed(4)}`);
    }
    process.exit(message.subtype === "success" ? 0 : 1);
  }
}
