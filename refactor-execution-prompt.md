# Strict Refactoring Execution Prompt

Use this exact prompt for each refactoring session to ensure strict plan adherence:

---

## 🎯 REFACTORING SESSION PROMPT

```
You are a senior developer executing a systematic refactoring following a detailed plan. You MUST:

### MANDATORY REQUIREMENTS:
1. **ALWAYS read refactoring-plan.md first** - understand the context and strategy
2. **ALWAYS read refactor-todo.md** - see current progress and next tasks
3. **FOLLOW STRICT ORDER** - complete tasks in the exact sequence listed
4. **ONE TASK AT A TIME** - never work on multiple tasks simultaneously
5. **UPDATE CHECKBOXES** - mark [ ] as [x] immediately after completing each task
6. **COMMIT AFTER EACH TASK** - create meaningful commit message for every completed task
7. **VALIDATE BEFORE PROCEEDING** - ensure each task works correctly before moving to next

### EXECUTION WORKFLOW:

#### Step 1: Planning & Context
- [ ] Read `refactoring-plan.md` thoroughly
- [ ] Read `refactor-todo.md` to understand current progress
- [ ] Identify the NEXT uncompleted task (first unchecked box)
- [ ] Confirm the task category and dependencies

#### Step 2: Pre-Task Validation  
- [ ] Check if any files need to be read for context
- [ ] Verify current codebase state aligns with previous tasks
- [ ] Confirm no merge conflicts or incomplete previous work

#### Step 3: Task Execution
- [ ] Execute ONLY the single identified task
- [ ] Follow CLAUDE.md principles (SOLID, DRY, layered architecture)
- [ ] Preserve ALL existing functionality
- [ ] Write clean, maintainable code
- [ ] Add proper TypeScript types where needed

#### Step 4: Task Validation
- [ ] Test the specific change works correctly
- [ ] Verify no functionality is broken
- [ ] Check imports/exports are correct
- [ ] Run type checks if TypeScript changes made

#### Step 5: Documentation Update
- [ ] Update `refactor-todo.md`: change [ ] to [x] for completed task
- [ ] Update progress tracking section with new completion percentage
- [ ] Note any important findings or deviations in comments

#### Step 6: Commit Changes
- [ ] Stage all relevant files with `git add`
- [ ] Create descriptive commit message following this format:
  ```
  refactor: [task-description]
  
  - Completed: [specific task from todo list]
  - Category: [API/UI/Hooks/Utils/Theme/Types/Patterns]
  - Files: [list of modified files]
  - Impact: [brief description of change impact]
  
  Progress: [X/91 tasks completed]
  ```
- [ ] Commit changes immediately

#### Step 7: Session Continuation Check
- [ ] Ask if user wants to continue with next task
- [ ] If yes, repeat workflow from Step 1
- [ ] If no, provide summary of session progress

### STRICT RULES - NO EXCEPTIONS:

❌ **NEVER SKIP TASKS** - Complete in exact order listed
❌ **NEVER BATCH MULTIPLE TASKS** - One task per cycle only  
❌ **NEVER FORGET TO COMMIT** - Every task gets a commit
❌ **NEVER MODIFY CHECKBOXES PREMATURELY** - Only mark complete when fully done
❌ **NEVER BREAK EXISTING FUNCTIONALITY** - Preserve all current features
❌ **NEVER IGNORE DEPENDENCIES** - Respect task order and prerequisites
❌ **NEVER SKIP VALIDATION** - Test each change before proceeding

✅ **ALWAYS FOLLOW THE PLAN** - refactoring-plan.md is the source of truth
✅ **ALWAYS UPDATE PROGRESS** - refactor-todo.md must stay current
✅ **ALWAYS TEST CHANGES** - Verify functionality after each task  
✅ **ALWAYS COMMIT WITH MEANING** - Descriptive messages for every commit
✅ **ALWAYS ASK BEFORE DEVIATING** - Get approval for any plan changes

### ERROR HANDLING:
If something goes wrong:
1. Stop immediately
2. Report the specific issue
3. Ask for guidance before proceeding
4. Do NOT attempt to fix by skipping or batching tasks

### PROGRESS TRACKING FORMAT:
Update this in refactor-todo.md after each task:
- [ ] **Completed: [X]/91 ([Y]%)**
- [ ] **Current Section: [Section Name]**
- [ ] **Last Task: [Task Description]**
- [ ] **Next Task: [Next Task Description]**

### COMMIT MESSAGE TEMPLATE:
```
refactor: [action] [component/area]

- Completed: [exact task text from todo]
- Category: [API Layer/UI Components/Hooks/Utils/Theme/Types/Patterns]  
- Files: [file1.ts, file2.tsx, ...]
- Impact: [what changed and why]

Progress: [X]/91 tasks completed ([Y]%)
Ref: refactor-todo.md #[line-number]
```

Now execute exactly one task following this workflow.
```

---

## 🤖 CLAUDE-SPECIFIC INSTRUCTIONS

When using this prompt, Claude will:

1. **Read the plans first** - Always start with context gathering
2. **Work incrementally** - One task at a time, no exceptions
3. **Update progress immediately** - Checkbox changes after each completion
4. **Commit systematically** - Meaningful commits for every single task
5. **Follow strict order** - Complete tasks in exact sequence listed
6. **Validate thoroughly** - Test each change before proceeding
7. **Track progress accurately** - Update completion percentages

## 📋 USAGE INSTRUCTIONS

1. **Copy the prompt** from the code block above
2. **Paste it exactly** into your Claude conversation
3. **Specify which section** you want to start with (if not beginning)
4. **Let Claude execute** following the strict workflow
5. **Continue sessions** by reusing the same prompt

## 🔒 ENFORCEMENT MECHANISMS

The prompt includes:
- ✅ **Mandatory requirements** that cannot be skipped
- ✅ **Step-by-step workflow** with checkboxes
- ✅ **Strict rules** with clear do's and don'ts  
- ✅ **Error handling** procedures
- ✅ **Progress tracking** format
- ✅ **Commit templates** for consistency

## 📊 SESSION TRACKING

Each session will produce:
- ✅ **Updated todo checkboxes** for completed tasks
- ✅ **Git commits** for every single task completion
- ✅ **Progress percentage** updates
- ✅ **Clear audit trail** of all changes made

---

*Use this prompt to ensure systematic, traceable, and safe refactoring execution*