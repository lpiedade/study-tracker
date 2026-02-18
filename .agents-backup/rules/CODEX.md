---
trigger: always_on
---

# CODEX.md - Workspace Runtime Rules

This file defines Codex-compatible conventions for local agents and skills.

## Rule Priority

1. `AGENTS.md` (root/module rules)
2. `.agents/rules/CODEX.md`
3. `.agents/agents/*.md`
4. `.agents/skills/*/SKILL.md`

## Runtime Paths

- Agents: `.agents/agents/`
- Skills: `.agents/skills/`
- Scripts: `.agents/scripts/`

## Naming Conventions

- Agent file and `name` frontmatter must match kebab-case: `.agents/agents/<agent-name>.md`
- Skill directory and `name` frontmatter must match kebab-case: `.agents/skills/<skill-name>/SKILL.md`
- Workflow files use kebab-case under `.agents/workflows/`

## Execution Conventions

- Prefer repository-local scripts and workspace npm commands.
- Use `.agents/scripts/checklist.py` for incremental checks.
- Use `.agents/scripts/verify_all.py` for release-level checks.
- Keep script references on `.agents/...` paths only.

## Automation Conventions (Codex Desktop)

- Automations are managed outside this repo by Codex Desktop.
- Store automation setup in `$CODEX_HOME/automations/<id>/automation.toml`.
- Use short, specific automation names and self-contained prompts.

## Compatibility

- Deprecated references to `.agent/`, `GEMINI.md`, or provider-specific modes should be treated as outdated.
- Prefer Codex terminology in all new agent, skill, and workflow updates.
