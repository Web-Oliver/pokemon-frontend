# item-ordering-export - Task 1

Execute task 1 for the item-ordering-export specification.

## Task Description

Create core ordering interfaces and types

## Code Reuse

**Leverage existing code**: src/domain/models/card.ts, src/interfaces/api/IExportApiService.ts\_

## Requirements Reference

**Requirements**: Data model interfaces from design\_

## Usage

## Instructions

This command executes a specific task from the item-ordering-export specification.

**Automatic Execution**: This command will automatically execute:

**Process**:

1. Load the item-ordering-export specification context (requirements.md, design.md, tasks.md)
2. Execute task 1: "Create core ordering interfaces and types"
3. **Prioritize code reuse**: Use existing components and utilities identified above
4. Follow all implementation guidelines from the main /spec-execute command
5. Mark the task as complete in tasks.md
6. Stop and wait for user review

**Important**: This command follows the same rules as /spec-execute:

- Execute ONLY this specific task
- **Leverage existing code** whenever possible to avoid rebuilding functionality
- Mark task as complete by changing [ ] to [x] in tasks.md
- Stop after completion and wait for user approval
- Do not automatically proceed to the next task

## Next Steps

After task completion, you can:

- Review the implementation
- Run tests if applicable
- Execute the next task using /item-ordering-export-task-[next-id]
- Check overall progress with /spec-status item-ordering-export
