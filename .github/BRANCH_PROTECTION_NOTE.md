# Branch protection — make CI a required check before merge to `main`

> CI (`.github/workflows/ci.yml`) only _reports_ status. GitHub will still let a
> red PR merge unless you mark the CI job as a **required status check**. This is
> a one-time **manual** setup in repo Settings — it cannot be committed to the repo.

## Why this matters here

Rac can't read code, so the safety net has to be mechanical: a PR that fails
lint, typecheck, or test must be **physically un-mergeable**. That's exactly what
a required status check does. It also makes the gitflow auto-merge policy safe —
auto-merge will simply wait for CI to go green instead of merging broken code.

## Steps (GitHub UI)

1. Open the repo on GitHub → **Settings** → **Branches** (or **Rules → Rulesets**).
2. Under **Branch protection rules**, click **Add branch protection rule**.
3. **Branch name pattern:** `main`
4. Tick **Require status checks to pass before merging**.
   - Also tick **Require branches to be up to date before merging** (forces a
     re-run against the latest `main` — prevents "passed on a stale base" merges).
5. In the status-check search box, type and select the CI job:
   **`lint · typecheck · test (Node 20.x)`**
   - The check only appears in the list **after CI has run at least once**, so
     open one PR (or push to `develop`) first, let CI run, then come back here.
   - If you later add Node versions to the matrix, add each new
     `lint · typecheck · test (Node XX.x)` entry as a required check too.
6. (Recommended) Also tick **Require a pull request before merging** so nothing
   lands on `main` without going through a PR + CI.
7. Click **Create** / **Save changes**.
8. **Repeat steps 2–7 for `develop`** with branch name pattern `develop`, so
   regressions are blocked one step before they can reach `main`.

## Verify it works

1. Open a throwaway PR that deliberately breaks lint (e.g. an unused variable).
2. Confirm the PR shows a red **`lint · typecheck · test (Node 20.x)`** check and
   the **Merge** button is disabled / blocked.
3. Fix the lint error, push — the check goes green and Merge unblocks.
4. Delete the throwaway branch.

## Matching repo policy

This pairs with the `safe-git-workflow` skill's auto-merge policy
(squash + delete branch, skip drafts, require mergeable): with the required check
in place, auto-merge only fires once CI is green, so it can never merge a broken PR.
