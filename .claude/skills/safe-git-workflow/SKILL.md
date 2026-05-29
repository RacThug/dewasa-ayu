---
name: safe-git-workflow
description: Use when about to commit code, create a PR, merge a PR, or run destructive git operations (reset --hard, branch -D, push --force, clean -fd, checkout that overwrites, stash drop) — enforces branch verification, explicit staging, working-tree safety, gitflow base for PRs, and auto-merge policy (squash + delete branch, skip drafts, require mergeable).
---

# Safe Git Workflow

## Overview

Git operations that touch shared state (commit, push, PR) or discard work (reset, force-push, clean) are easy to do wrong under context fatigue. Checks below cost seconds; the mistakes cost hours. Derived from real failures: committing to `main` instead of a feature branch, and `git reset --hard` wiping uncommitted edits without warning.

## When to use

- About to `git commit` for the first time in a session or after any branch switch
- About to `gh pr create`
- About to `gh pr merge` (any PR — your own or otherwise)
- About to run destructive git: `reset --hard`, `branch -D`, `push --force`, `clean -fd`, `checkout <ref> -- <path>` over local edits, `stash drop`, `stash clear`

## Project conventions

Read root `CLAUDE.md` for: base branch (often `develop`, not `main`), branch naming, commit format. If silent, default to gitflow: features → `develop` → `main`; PRs draft by default.

## Pre-commit checks

1. **Verify branch:** `git branch --show-current`. If `main` / `master` / `develop`, **STOP and confirm with user** — these usually need PRs, not direct commits.
2. **Inspect tree:** `git status`. Read every line; catch scratch files, env files, unintended carry-over.
3. **Stage explicitly:** `git add <specific paths>`. **Never** `git add -A` / `.` / `-u` — they sweep in unrelated work.
4. **Verify staged diff:** `git diff --cached`. Unstage surprises with `git restore --staged <path>`.
5. **HEREDOC for multi-line message** (preserves body + trailing co-author line):

   ```bash
   git commit -m "$(cat <<'EOF'
   <type>: <subject>

   <body>

   Co-Authored-By: <identity>
   EOF
   )"
   ```

## Pre-PR checks

1. **Explicit base:** `--base <branch>` per project convention (default `develop`). Don't let `gh` infer.
2. **Draft for code, ready for docs.** Code PRs (anything with runtime verification — tests, build, deploy preview, lighthouse) open with `--draft`; promote via `gh pr ready <N>` after verification passes. Pure documentation PRs (specs, READMEs, design docs) open as ready when confident in the content — structural verification at write-time is sufficient and reviewers can still request changes via comments.
3. **Title <70 chars**, details in body.
4. **HEREDOC body** with `## Summary` + `## Test plan` sections; link issues (`Refs #N`).
5. **Push with upstream first:** `git push -u origin <branch>`.

## Pre-merge checks

Project policy: **autonomous auto-merge is enabled** for non-conflict, non-draft PRs. The agent merges its own PRs after opening them, then pulls the updated base.

1. **Inspect PR state:** `gh pr view <N> --json mergeable,isDraft,state,baseRefName --jq '{state, isDraft, mergeable, base: .baseRefName}'`.
2. **Eligibility gate (all must hold):**
   - `state` is `OPEN`
   - `isDraft` is `false` — **NEVER auto-merge a draft PR.** If you authored a draft that has stabilised, mark ready first: `gh pr ready <N>`.
   - `mergeable` is `MERGEABLE` (not `CONFLICTING`, not `UNKNOWN`)
3. **Default mode:** `gh pr merge <N> --squash --delete-branch`. Squash keeps one commit per PR on the base — clean history for solo dev; trivial revert.
4. **After merge: sync local base.** `git checkout <base> && git pull --ff-only`. New work branches off the freshly-synced base.
5. **CI:** when CI is configured (post-#15), add `--auto` and let GitHub merge when checks go green. Until then, manual mode is acceptable.
6. **Target `main`:** same auto-merge rules unless the project later adds an explicit guard. PRs to `main` from `develop` (release flow) follow the same policy by default.

If any eligibility check fails, **STOP and report** — do not work around the gate.

## Pre-destructive-op checks

1. **`git status` first.** If working tree is dirty, **STOP**.
2. **Stash uncommitted work:** `git stash push -m "<reason>" -- <paths>`. Only proceed after tree is clean OR user explicitly confirms work is disposable.
3. **Uncommitted edits are NOT in git's object store.** `git fsck --lost-found` will not recover them. Once `reset --hard` runs, untracked changes are gone unless the editor has local history.
4. **`reflog -5` after** to confirm committed work is recoverable.
5. **`push --force` requires explicit user OK** and never targets `main` / `master` / `develop`. Prefer `--force-with-lease`.

## Quick reference

| Operation             | Safe form                                                          | Forbidden / confirm                                                                        |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Stage                 | `git add <path>`                                                   | `add -A`, `add .`, `add -u`                                                                |
| Multi-line message    | HEREDOC                                                            | `-m "line1\nline2"`                                                                        |
| Commit                | On feature branch                                                  | To `main` / `develop`                                                                      |
| Discard local changes | `git stash push -- <files>` then op                                | `reset --hard` without status check                                                        |
| Reset to remote       | Stash → `reset --hard origin/<branch>`                             | Skipping stash                                                                             |
| Force push            | User OK + `--force-with-lease` + not main/develop                  | Reflex force after mistake                                                                 |
| Open code PR          | `--base <project-base> --draft`                                    | Inferring base; non-draft before verification                                              |
| Open doc PR           | `--base <project-base>` (ready, no draft flag)                     | Reflexively adding `--draft` to every PR                                                   |
| Merge PR              | `gh pr merge <N> --squash --delete-branch` after eligibility check | Merging draft; merging with `mergeable: CONFLICTING`; skipping post-merge `pull --ff-only` |

## Rationalizations — don't

| Excuse                        | Reality                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| "I know what branch I'm on"   | `git branch --show-current` is one command. Memory drifts.               |
| "Reset is faster than stash"  | Stash ~2s. Recovering wiped work: hours, often impossible.               |
| "`fsck` can recover anything" | Untracked edits are NOT in the object store. Gone means gone.            |
| "Solo project, no review"     | Draft PRs are free. Wrong-base PRs cost a force-push to fix.             |
| "User said go"                | "Go" = execute agreed plan; not "skip safety". Flag new destructive ops. |

## Red flags — STOP and run the check

- Committing without running `git branch --show-current` this turn
- About to `add -A` / `.` / `-u`
- About to `reset --hard` with ANY modified/untracked files in `git status`
- `gh pr create` without `--base` — and missing `--draft` for code PRs (doc PRs may omit it intentionally)
- `push --force` to any branch
- `gh pr merge` without first reading `mergeable` + `isDraft` from `gh pr view`
- Merging a draft PR "because the content is ready" — mark ready explicitly first
- Forgetting `git pull --ff-only` after a merge — next branch will diverge from base
- "It's fine, this is" — confirm with command, not memory

## Changelog

- v0.2.0 — 2026-05-28 — Adds Pre-merge checks section codifying project auto-merge policy: `gh pr merge --squash --delete-branch`, skip drafts, require `mergeable: MERGEABLE`, sync local base via `git pull --ff-only` after merge. Description + When-to-use + Quick Reference + Red flags updated to cover merge trigger.
- v0.1.1 — 2026-05-28 — Pre-PR check 2 differentiates code PRs (draft default) from doc PRs (ready default). Quick Reference splits "Open PR" into two rows. Red flag note updated to allow ready-by-default for docs.
- v0.1.0 — 2026-05-28 — Initial skill. Pre-commit / pre-PR / pre-destructive-op checks, quick reference, rationalizations, red flags.
