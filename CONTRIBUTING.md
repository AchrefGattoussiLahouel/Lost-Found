# Contributing
 
## Workflow
 
1. Every task gets its own branch, created from `dev`.
2. Work and commit on that branch.
3. When the task is done, merge it into `dev`.
4. Delete the branch after merging. The commits stay in `dev`'s history.
```bash
git checkout dev
git pull origin dev
git checkout -b feature/user-login      # branch named after the task
 
# ... work and commit ...
 
git checkout dev
git pull origin dev
git merge feature/user-login
git push origin dev
 
git branch -d feature/user-login
```
 
If you use pull requests (GitHub/GitLab), open a PR from your task branch into `dev` and choose **Create a merge commit**.
 
## Branch Names
 
Name the branch after the task, in lowercase with hyphens:
 
```
<type>/<task-name>
```
 
Types: `feature`, `fix`, `refactor`, `docs`, `chore`
 
Examples:
 
```
feature/user-login
fix/null-error-on-checkout
refactor/auth-service
```
 
## Commit Messages
 
```
<type>: <short description>
 
<optional body: explain why the change was needed>
```
 
Types:
 
| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code cleanup, no behavior change |
| `test` | Adding or fixing tests |
| `chore` | Maintenance, dependencies, config |
 
Rules:
 
- Write in the imperative: "add login", not "added login".
- Keep the first line under 72 characters, no period at the end.
- Each commit should do one thing. Avoid messages like "wip" or "fix stuff".
- Add a body when the reason is not obvious. Explain **why**, not what.
Examples:
 
```
feat: add user login endpoint
```
 
```
fix: handle null cart on checkout
 
Checkout crashed when a session expired mid-purchase because
the cart was never reloaded.
```
 
## Rules
 
- Never commit directly to `dev`. Always use a task branch.
- Make sure the code runs and tests pass before merging into `dev`.
- One task per branch. Don't mix unrelated changes.
 
