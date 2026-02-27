
**Task**
Implement soft rule validations for four candidate eligibility criteria. When a soft rule is violated, the assistant should:

1. Display an amber/yellow warning below the affected field
2. Provide a "Request Exception" toggle/checkbox
3. When toggled ON, reveal a text area for "Exception Rationale"
4. Validate the rationale meets minimum requirements before allowing submission override
5. Maintain visual distinction between strict errors (red), soft warnings (amber), and valid fields (green)

**Objective**
Enable flexible candidate screening that enforces baseline eligibility standards while allowing authorized exceptions with documented justification, reducing friction for edge cases while maintaining audit trail compliance.

**Knowledge**
Soft rule violations require:

* Rationale minimum length: 30 characters
* Rationale must contain at least ONE of these exact phrases: "approved by", "special case", "documentation pending", or "waiver granted"
* Invalid rationale should trigger a helpful error message explaining requirements
* Valid rationale overrides the soft rule violation and permits form submission

Soft rules to validate:

1. Date of Birth: Candidate age must be 18-35 years (calculated from today's date)
2. Graduation Year: Must fall between 2015-2025
3. Percentage/CGPA: ≥60% (percentage mode) OR ≥6.0 (10-point CGPA scale)
4. Screening Test Score: Must be ≥40 out of 100

**Behavioral Rules**

* Show warnings only when soft rule thresholds are breached; valid entries display no warning
* Exception toggle remains hidden until a soft rule violation occurs
* Exception Rationale text area only appears when toggle is activated
* Rationale validation must check both length (≥30 characters) and phrase inclusion before enabling submission
* Form submission remains blocked until all soft rule violations are either resolved or properly justified
