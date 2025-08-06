# Generic Refactoring Execution Prompt

Copy and paste this prompt for any refactoring session:

---

```
Execute systematic refactoring following these MANDATORY steps:

1. READ: Find and read refactoring-plan.md and refactor-todo.md (or similar planning docs)
2. IDENTIFY: Find the next uncompleted task (first unchecked [ ] box)  
3. EXECUTE: Complete ONLY that single task following the plan
4. UPDATE: Change [ ] to [x] in the todo file for the completed task
5. COMMIT: Create commit with format "refactor: [task-description] - Progress: X/Y tasks"
6. ASK: "Task completed. Continue with next task? (y/n)"

STRICT RULES:
- ONE task at a time, NO batching
- MUST read plans before starting
- MUST update checkbox after completion  
- MUST commit after each task
- MUST follow exact task order
- NEVER skip or modify the plan without asking

If no refactoring plans exist, ask user to provide them first.
```

---

**Usage**: Copy the prompt above and paste into any Claude conversation to execute systematic refactoring with automatic progress tracking and commits.