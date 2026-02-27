
**Task**

Implement real-time inline validation that checks each form field against specific rules as the user types or changes values. Display validation error messages in red text immediately below each field when rules are violated. Additionally, display a summary banner at the top of the form showing all active validation errors. Keep the submit button disabled until all strict validation rules pass completely. When Interview Status is set to "Rejected", display a red blocking banner with the message "Rejected candidates cannot be enrolled." that takes priority over all other validations.

**Objective**
Prevent invalid data submission by catching errors early through immediate user feedback, blocking rejected candidates from enrollment, and ensuring all required fields meet exact specifications before the form can be submitted. Provide clear visibility of all validation issues through both inline feedback and a top-level summary to guide users toward form completion.

**Knowledge**
The validation rules are configured as follows:

**STRICT RULES (No exceptions allowed - violations block submission):**

1. **Full Name** (field: full_name)

   - Input type: text
   - Validation pattern: `^[a-zA-Z\s]{2,}$`
   - Error message: "Name must be at least 2 characters with no numbers."
   - Requirements: Cannot be blank, minimum 2 characters, no numbers allowed
2. **Email Address** (field: email)

   - Input type: email
   - Validation pattern: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
   - Error message: "Valid and unique email format required."
   - Requirements: Must be valid email format (contains @ and a domain)
3. **Phone Number** (field: phone)

   - Input type: tel
   - Validation pattern: `^[6-9]\d{9}$`
   - Error message: "Must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9."
   - Requirements: Exactly 10 digits, must start with 6, 7, 8, or 9
4. **Highest Qualification** (field: highest_qualification)

   - Input type: select
   - Valid options: B.Tech, B.E., B.Sc, BCA, M.Tech, M.Sc, MCA, MBA
   - Validation pattern: `^(B\.Tech|B\.E\.|B\.Sc|BCA|M\.Tech|M\.Sc|MCA|MBA)$`
   - Error message: "Must be a valid degree from the approved list."
   - Requirements: Must select one from the dropdown (cannot be empty)
5. **Interview Status** (field: interview_status)

   - Input type: select
   - Valid options: Cleared, Waitlisted, Rejected
   - Validation pattern: `^(Cleared|Waitlisted|Rejected)$`
   - Error message: "Status must be Cleared, Waitlisted, or Rejected."
   - Special rule: If "Rejected" is selected, block submission entirely and display a red banner with the message "Rejected candidates cannot be enrolled." This banner takes priority over all other validations.
   - Requirements: Must select one from the dropdown (cannot be empty)
6. **Aadhaar Number** (field: aadhaar_number)

   - Input type: text
   - Validation pattern: `^\d{12}$`
   - Error message: "Aadhaar must be exactly 12 digits."
   - Requirements: Exactly 12 digits, no alphabets or special characters allowed
   - Hint: "Enter your 12-digit Aadhaar number."
7. **Offer Letter Sent** (field: offer_letter_sent)

   - Input type: select
   - Valid options: Yes, No
   - Validation pattern: `^(Yes|No)$`
   - Error message: "Must select Yes or No."
   - Special rule: Cannot be "Yes" unless Interview Status is "Cleared" or "Waitlisted". If this rule is violated, show error: "Offer letter can only be sent to cleared or waitlisted candidates."
   - Requirements: Must select one from the dropdown (cannot be empty)

**SOFT RULES (Exceptions allowed with documented rationale):**

The following fields allow exceptions when accompanied by documented rationale using approved keywords:

8. **Date of Birth** (field: dob)

   - Input type: date
   - Validation: Age must be between 18 and 35 years
   - Error message: "Candidate age must be between 18 and 35."
   - Hint: "Age must be between 18 and 35 years."
   - Exception keywords: "approved by", "special case", "documentation pending", "waiver granted"
9. **Graduation Year** (field: graduation_year)

   - Input type: number
   - Validation: Year must be between 2015 and 2025 (inclusive)
   - Error message: "Graduation year must be between 2015 and 2025 (inclusive)."
   - Hint: "Accepted range: 2015 to 2025."
   - Exception keywords: "approved by", "special case", "documentation pending", "waiver granted"
10. **Percentage / CGPA** (field: percentage_cgpa)

    - Input type: text
    - Validation: Minimum 60% or 6.0 CGPA (10-point scale)
    - Error message: "Minimum 60% or 6.0 CGPA (10-point scale) required."
    - Hint: "Enter percentage (e.g. 72.5) or CGPA (e.g. 7.8). Values ≥10 are treated as percentage; values <10 as CGPA."
    - Exception keywords: "approved by", "special case", "documentation pending", "waiver granted"
11. **Screening Test Score** (field: screening_test_score)

    - Input type: number
    - Validation: Score must be 40 or higher out of 100
    - Error message: "Screening score must be 40 or higher out of 100."
    - Hint: "Score out of 100. ≥60 = Cleared | 40–59 = Waitlisted | <40 = Rejected (requires override)."
    - Exception keywords: "approved by", "special case", "documentation pending", "waiver granted"

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
