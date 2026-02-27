# Sprint Log — AdmitGuard

## Sprint 0
- **Goal:** Understand problem, plan approach, set up repo, research tools
- **Done:** Repo created, README written, wireframe sketched, researched AI Studio Build mode
- **Research:** Read [list sources], watched [list videos], experimented with AI Studio interface
- **Blockers:** None / [describe]
- **Key Decision:** Chose single-page form over multi-step wizard because [reason]
- **Prompts Drafted:** 3 (on paper, not run yet)

## Sprint 1
- **Goal:** Working form with strict validation
- **Done:** All 11 fields rendering, 7 strict rules validated
- **Blockers:** AI Studio generated phone validation that accepted letters — fixed with Prompt 3
- **Key Decision:** Used inline validation instead of submit-time validation for better UX
- **Prompts Used:** 3 (foundation, strict rules, edge cases)
- **AI Evaluation:** Prompt 1 output was 80% correct. Had to refine dropdown behavior manually.

## Sprint 2
- **Goal:** Strict validation rules for name, email, phone
- **Done:** Implemented strict validation logic for core fields
- **Blockers:** None
- **Key Decision:** Focused on high-quality validation for most critical fields first

## Sprint 3
- **Goal:** Soft rule exception system with rationale validation
- **Done:** Added exception handling system with validation rationales
- **Blockers:** None
- **Key Decision:** Implemented soft rules that allow exceptions but require justification

## Sprint 4
- **Goal:** Configurable rules engine refactored from hardcoded logic
- **Done:** Moved from hardcoded validation to configurable rules engine
- **Blockers:** None
- **Key Decision:** Created flexible system for easy rule modification

## Sprint 5
- **Goal:** Audit trail and audit log system
- **Done:** Complete audit trail with localStorage persistence, expandable details, flag/unflag functionality
- **Blockers:** None
- **Key Decision:** Used localStorage for persistence and added comprehensive logging with metadata

## Sprint 6
- **Goal:** UI/UX polishing and refinement
- **Done:** Enhanced button styling, improved responsive design, added gradients and transitions
- **Blockers:** None
- **Key Decision:** Focused on modern, polished UI with consistent styling patterns