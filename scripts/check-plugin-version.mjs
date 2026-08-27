#!/usr/bin/env node
// Claude Code uses .claude-plugin/plugin.json's `version` to decide when
// installed users see an update, so it must track package.json's version.
// Run with --check to verify, or with no flag to sync plugin.json to package.json.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginPath = join(root, ".claude-plugin", "plugin.json");

const pkgVersion = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const pluginRaw = readFileSync(pluginPath, "utf8");
const plugin = JSON.parse(pluginRaw);

if (plugin.version === pkgVersion) {
  console.log(`plugin.json version ${plugin.version} matches package.json`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  console.error(
    `Version drift: package.json is ${pkgVersion}, .claude-plugin/plugin.json is ${plugin.version}.\n` +
      `Run \`npm run sync-plugin-version\` to fix.`,
  );
  process.exit(1);
}

writeFileSync(pluginPath, pluginRaw.replace(/"version":\s*"[^"]*"/, `"version": "${pkgVersion}"`));
console.log(`Synced plugin.json version ${plugin.version} -> ${pkgVersion}`);
