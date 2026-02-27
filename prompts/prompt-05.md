## **Task**

Implement a dynamic system-level validation and notification rule for the candidate submission form.

## **Objective**

To provide real-time feedback to users regarding the number of active exceptions on a form and to ensure that high-exception entries are systematically identified for administrative oversight without blocking the submission workflow.

## **Behavioral Rules**

### **1. Real-Time Counter**

* **Logic:** Continuously calculate the sum of active exceptions currently triggered on the form.
* **Display:** Position a counter prominently near the **Submit** button.
* **Format:** Use the string: `Active Exceptions: X/4` (where X is the current count).

### **2. Conditional Warning Banner**

* **Trigger:** If the active exception count is  **greater than 2** .
* **UI Component:** Display a warning banner with the following text:
  > "⚠️ This candidate has more than 2 exceptions. Entry will be flagged for manager review."
  >
* **Visibility:** The banner should appear/disappear dynamically as the exception count changes.

### **3. Submission & Data Handling**

* **Accessibility:** Do **not** disable the Submit button, regardless of the exception count.
* **Flagging Logic:** If the form is submitted with more than 2 exceptions, the record must be assigned a `Flagged` status attribute in the database.
* **Data Display:** Any UI component displaying this record (e.g., dashboards, tables) must visually include a "Flagged" indicator or tag.
