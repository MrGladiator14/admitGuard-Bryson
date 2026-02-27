# admitGuard

A comprehensive candidate admission form system with validation, exception handling, and audit trail capabilities.

## Overview

admitGuard is a modern web application designed to streamline the candidate admission process. It features:

- **Dynamic Form Generation**: Configuration-driven form fields with real-time validation
- **Exception Management**: Allow exceptions for validation failures with proper rationale tracking
- **Audit Trail System**: Complete logging of all submissions with detailed tracking
- **Responsive Design**: Mobile-friendly interface with modern UI components
- **Data Persistence**: Local storage for audit logs with export/import capabilities

## Features

### Core Functionality
- Real-time form validation with visual feedback
- Exception requests with keyword-based rationale validation
- Progress tracking and completion indicators
- Tab-based navigation between form and audit trail

### Audit Trail System
- Persistent storage of all submission data
- Expandable detail views for each submission
- Exception tracking and manager review flags
- JSON export/import functionality
- Summary statistics and filtering

### User Experience
- Clean, modern interface with smooth animations
- Confirmation modal before submission
- Responsive design for all devices
- Accessible form elements and proper labeling

## Setup

1. Clone the repository
2. Open `src/index.html` in a modern web browser
3. No additional dependencies required - runs entirely in the browser

## File Structure

```
src/
├── index.html          # Main application HTML
├── styles.css          # Complete styling and responsive design
├── script.js           # All application logic and functionality
└── schema.json         # Form configuration and validation rules
```

## Configuration

The form is driven by `src/schema.json` which defines:
- Field types and validation rules
- Exception allowances and rationale keywords
- Error messages and field labels
- Input attributes and options

## Screenshots

[Screenshots to be added]
