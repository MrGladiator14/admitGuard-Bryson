**Task**

Implement real-time inline validation that checks each form field against specific rules as the user types or changes values. Display validation error messages in red text immediately below each field when rules are violated. Additionally, display a summary banner at the top of the form showing all active validation errors. Keep the submit button disabled until all strict validation rules pass completely. When Interview Status is set to "Rejected", display a red blocking banner with the message "Rejected candidates cannot be enrolled." that takes priority over all other validations.

**Objective**
Prevent invalid data submission by catching errors early through immediate user feedback, blocking rejected candidates from enrollment, and ensuring all required fields meet exact specifications before the form can be submitted. Provide clear visibility of all validation issues through both inline feedback and a top-level summary to guide users toward form completion.

**Validation Behavior:**

- Validation errors should trigger on user input (as they type or change dropdown selections), not only on submit
- Display inline error messages in red text immediately below each field
- Display a summary banner at the top of the form listing all active validation errors
- When Interview Status is "Rejected", the red blocking banner "Rejected candidates cannot be enrolled." appears at the top and prevents submission regardless of other field states
- The submit button must remain disabled if any strict validation rule fails
- Soft rule violations can be overridden if the user provides documented rationale containing one of the approved exception keywords

**Behavioral Rules:**

1. The assistant should validate each field in real-time as the user types or changes values, not waiting for form submission.
2. The assistant should display validation errors inline below each field in red text, and also aggregate all errors in a summary banner at the form top.
3. The assistant should keep the submit button disabled until all 7 strict rules pass completely.
4. The assistant should treat Interview Status "Rejected" as an absolute blocker that displays a red banner and prevents submission regardless of other field states.
5. The assistant should allow soft rule violations only when accompanied by documented rationale containing one of the approved exception keywords.
