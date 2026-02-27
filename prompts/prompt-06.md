## **Task**

Refactor the existing form validation architecture to be  **configuration-driven** . You will move all validation logic from the hardcoded component/function into a centralized JSON configuration object and implement a dynamic validation engine that consumes it.

### **Objective**

The goal is to decouple business rules from application logic. This allows the operations team to modify validation parameters (like age ranges or required keywords) by simply updating the JSON config without requiring a code deployment or deep knowledge of the form's internal logic.
