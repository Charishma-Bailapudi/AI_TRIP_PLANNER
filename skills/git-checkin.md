# Git Checkin Skill

## Purpose
The Git Checkin Skill enables the developer agent to automatically stage, commit, and push changes from the local repository to the remote GitHub repository `https://github.com/Charishma-Bailapudi/AI_TRIP_PLANNER`.

## Responsibilities
- Inspect local changes and untracked files.
- Stage modifications safely while adhering to the root-level `.gitignore` rules.
- Draft descriptive, semantic commit messages conforming to Conventional Commits standards.
- Push staged commits to the remote tracking branch (`origin/main`).

## Command Specification
- **Command**: `/gitcheckin-myrepo`
- **Trigger**: Run local Git staging, committing, and pushing sequences.

## Execution Workflow
1. Check status:
   ```bash
   git status
   ```
2. Stage modified and untracked files:
   ```bash
   git add .
   ```
3. Commit changes with a Conventional Commit message:
   ```bash
   git commit -m "<type>(<scope>): <short summary>"
   ```
   *Allowed Types*: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
4. Push to the remote repository:
   ```bash
   git push origin main
   ```

## Error Handling
- **No Remote Configured**: Check `git remote -v` and add origin if missing.
- **Untracked Secret Files**: Double-check `.gitignore` to prevent leaking environment files (`.env`).
- **Merge Conflicts**: Prompt the user to resolve conflicts or run pull operations if remote has conflicting commits.
