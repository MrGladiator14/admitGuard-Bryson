
Task
Implement a persistent Audit Trail and Logging System for the existing form submission workflow.

Objective
Create a robust mechanism to track, store, and display every successful form submission. The goal is to provide administrators with a clear history of data entries, specifically highlighting any deviations (exceptions) and review statuses.

Behavioral Rules
Data Integrity: Ensure all form data is captured exactly as entered at the moment of submission.

Persistent Storage: Use localStorage to ensure the audit history survives page refreshes or browser restarts.

UX/UI Clarity: The Audit Log must be visually distinct from the data entry form and provide a high-level summary with "drill-down" capabilities for details.

Safety First: Include a "destructive action" confirmation (browser confirm or custom modal) before clearing any stored data.

Feature Requirements

1. Logging Mechanism
   Upon every successful submission, capture a JSON object containing:

Metadata: ISO Timestamp and a unique ID.

Payload: All input field values.

Exception Logic: Total count of exceptions used, a list of specific fields that triggered exceptions, and the accompanying rationale text.

Review Status: A boolean flaggedForManager status.

2. Audit Log View
   Create a new UI section (Tab or View) displaying a table with the following columns:

Candidate Name

Submission Timestamp (Formatted for readability)

Exception Count

Flagged Status (Styled as a badge: Yes/No)

Action: An "Expand/View" button that reveals the full JSON payload or a detailed list of rationales.

3. Data Management

Initialization: On page load, the system should fetch existing logs from localStorage.

Cleanup: Add a "Clear Log" button. This button must trigger a confirmation dialog to prevent accidental data loss.
