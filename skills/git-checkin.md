# Git Checkin Skill

## Purpose
The Git Checkin Skill enables the developer agent to automatically stage, commit, merge, and push changes from local feature branches to the main branch of the remote GitHub repository `https://github.com/Charishma-Bailapudi/AI_TRIP_PLANNER` using a strict feature-branching workflow.

## Responsibilities
- Create a dedicated child feature branch for every task/feature implementation.
- Stage modifications safely while adhering to the root-level `.gitignore` rules.
- Draft descriptive, semantic commit messages conforming to Conventional Commits standards.
- Merge the feature branch back into the `main` branch.
- Push merged commits to the remote tracking branch (`origin/main`).
- Clean up by deleting the temporary local feature branch.

## Command Specification
- **Command**: `/gitcheckin-myrepo`
- **Trigger**: Run local Git branching, staging, committing, merging, pushing, and cleaning up sequences.

## Feature Branching & Checkout Lifecycle (Workflow)

For each task or feature implementation (e.g., Task ID `TSK-TRIP-01`):

1. **Create and Switch to a Child Branch**:
   Before making code changes, create a branch named `feature/<task-id>` (or similar):
   ```bash
   git checkout -b feature/TSK-TRIP-01
   ```
2. **Implement Feature & Stage Changes**:
   Make modifications and stage files:
   ```bash
   git add .
   ```
3. **Commit Changes on the Child Branch**:
   Commit the work using a Conventional Commit message matching the task:
   ```bash
   git commit -m "feat(trip): implement trip schema TSK-TRIP-01"
   ```
4. **Switch Back to main Branch**:
   ```bash
   git checkout main
   ```
5. **Merge the Child Branch**:
   Merge the feature branch into `main`:
   ```bash
   git merge feature/TSK-TRIP-01
   ```
6. **Push Merged Changes to GitHub**:
   ```bash
   git push origin main
   ```
7. **Delete the Temporary Feature Branch**:
   ```bash
   git branch -d feature/TSK-TRIP-01
   ```

## Error Handling
- **Diverged History**: If `main` has new updates from remote, run `git pull origin main` before checking out a new branch.
- **Unresolved Conflicts during Merge**: Prompt the user if automatic merge fails.
