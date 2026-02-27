**Situation**
You are a senior frontend developer building an internal enrollment management tool for an education company. The system processes candidate admissions through a structured form that captures academic credentials, screening results, and interview outcomes. The tool serves both candidates filling the form and administrators reviewing submissions.

**Task**
Build a single-page, card-based candidate admission form using vanilla HTML, CSS (with Flexbox for responsive layout), and minimal JavaScript that collects the following 11 fields:

- Full Name (text)
- Email Address (text)
- Phone Number (tel)
- Date of Birth (date picker)
- Highest Qualification (dropdown: B.Tech, B.E., B.Sc, BCA, M.Tech, M.Sc, MCA, MBA)
- Graduation Year (number)
- Percentage / CGPA (text with toggle to switch modes)
- Screening Test Score (number)
- Interview Status (dropdown: Cleared, Waitlisted, Rejected)
- Aadhaar Number (text)
- Offer Letter Sent (dropdown: Yes, No)

Each field must include a label, input element, and designated validation message area below. Add a progress indicator to guide users through the form. Disable the submit button until all strict validations pass. Use a modern, minimal design with neutral colors and symmetrical styling—not a generic template. Ensure responsive layout using Flexbox that works on desktop and tablet viewports.

**Objective**
Enable candidates to complete their admission application with data quality assurance while creating an audit trail for administrators to review submissions and identify candidates requiring manual review.

**Knowledge**

*Validation Rules Configuration:*

Use this comprehensive rules configuration to structure your form fields and validation logic:

"""`<Replace this text with the VALIDATION RULES CONFIG or upload a file>`"""

*Field-by-Field Rules:*

**Strict Rules** (block submission, no exceptions allowed):

- Full Name: Regex `^[a-zA-Z\s]{2,}$` → Error: "Name must be at least 2 characters with no numbers."
- Email: Regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` → Error: "Valid and unique email format required."
- Phone: Regex `^[6-9]\d{9}$` → Error: "Must be a 10-digit Indian mobile number starting with 6, 7, 8, or 9."
- Highest Qualification: Regex `^(B\.Tech|B\.E\.|B\.Sc|BCA|M\.Tech|M\.Sc|MCA|MBA)$` → Error: "Must be a valid degree from the approved list."
- Interview Status: Regex `^(Cleared|Waitlisted|Rejected)$` → Error: "Status must be Cleared, Waitlisted, or Rejected."
- Aadhaar Number: Regex `^\d{12}$` → Error: "Aadhaar must be exactly 12 digits."
- Offer Letter Sent: Regex `^(Yes|No)$` → Error: "Must select Yes or No."

**Soft Rules** (allow exceptions with documented rationale, require user acknowledgment):

- Date of Birth: Age range 18–35 years → Error: "Candidate age must be between 18 and 35." Hint: "Age must be between 18 and 35 years." Exception keywords: ["approved by", "special case", "documentation pending", "waiver granted"]
- Graduation Year: Range 2015–2025 → Error: "Graduation year must be between 2015 and 2025 (inclusive)." Hint: "Accepted range: 2015 to 2025." Exception keywords: ["approved by", "special case", "documentation pending", "waiver granted"]
- Percentage / CGPA: Minimum 60% or 6.0 CGPA (10-point scale) → Error: "Minimum 60% or 6.0 CGPA (10-point scale) required." Hint: "Enter percentage (e.g. 72.5) or CGPA (e.g. 7.8). Values ≥10 are treated as percentage; values <10 as CGPA." Exception keywords: ["approved by", "special case", "documentation pending", "waiver granted"]
- Screening Test Score: Minimum 40 out of 100 → Error: "Screening score must be 40 or higher out of 100." Hint: "Score out of 100. ≥60 = Cleared | 40–59 = Waitlisted | <40 = Rejected (requires override)." Exception keywords: ["approved by", "special case", "documentation pending", "waiver granted"]

*Form Behavior:*

- Display validation messages in real-time below each field as users interact with inputs
- Show inline error messages for strict-rule violations in red text below the offending field
- Submit button remains disabled while any strict-rule validation fails
- For soft-rule violations, display a warning state but allow progression to exception workflow (implemented in later phase)
- Use modern, minimal design with neutral color palette and clear visual hierarchy
- Apply symmetrical styling using Flexbox for consistent spacing and alignment

**Constraints**

- Build only the form structure, layout, and field organization in this phase
- Do not implement validation logic, exception workflows, or submission handlers yet
- Focus on the HTML skeleton and CSS composition using vanilla HTML and minimal CSS
- Ensure responsive layout using Flexbox that works on desktop and tablet viewports
- Avoid generic templates; create a custom, professional design
- Eliminate contradicting or redundant statements in all instructions
