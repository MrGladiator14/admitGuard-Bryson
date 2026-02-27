**Task**
Test the form against 6 specific scenarios covering field validation (Name, Phone, Aadhaar), state transitions, and conditional submission logic. For each scenario, attempt to submit the form and document whether it passes (behaves as expected) or fails (behaves unexpectedly).

**Objective**
Identify which validation rules and conditional logic are working correctly and which require fixes, so the form enforces all requirements consistently before allowing submission.

**Knowledge**
Field validation requirements:

* Name: Must not be empty, must be at least 2 characters, must contain only letters and spaces
* Phone: Must be 10 digits and start with 6, 7, 8, or 9
* Aadhaar: Must be exactly 12 digits with no letters or special characters
* Interview Status: Dropdown field that affects submission eligibility
* Offer Letter: Dropdown field with conditional rules based on Interview Status

Conditional submission rules:

* Form cannot be submitted if Interview Status is "Rejected" (regardless of other fields)
* Form can be submitted if Interview Status is "Waitlisted" and Offer Letter is "Yes"
* Form cannot be submitted if Interview Status is "Rejected" even if Offer Letter is set to "Yes"

**Test Scenarios**

Scenario 1 (Name field validation):

* Input "A" → Expected: Reject (too short)
* Input "John123" → Expected: Reject (contains numbers)
* Input "" (empty) → Expected: Reject (required field)

Scenario 2 (Phone field validation):

* Input "1234567890" → Expected: Reject (doesn't start with 6-9)
* Input "98765" → Expected: Reject (too short)

Scenario 3 (Aadhaar field validation):

* Input "12345678901" → Expected: Reject (11 digits, not 12)
* Input "12345678901a" → Expected: Reject (contains letter)

Scenario 4 (Interview Status rejection):

* Set Interview Status to "Rejected" → Expected: Form submission blocked

Scenario 5 (Conditional logic - allowed):

* Set Interview Status to "Waitlisted" and Offer Letter to "Yes" → Expected: Form submission allowed

Scenario 6 (Conditional logic - blocked):

* Set Interview Status to "Rejected" and Offer Letter to "Yes" → Expected: Form submission blocked

For each test, provide:

* **Scenario number and description**
* **Input/action taken**
* **Expected result**
* **Actual result**
* **Status** (Pass/Fail)
* **Issue description** (if failed)
