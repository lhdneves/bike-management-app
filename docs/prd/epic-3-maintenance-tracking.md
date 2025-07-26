# Epic 3: Maintenance Tracking & Scheduling

## Overview
This epic covers all functionality related to maintenance logging, scheduling, reporting, and automated reminders.

## Functional Requirements

### FR5: Maintenance Logging
Functionality to record maintenance activities: date, mechanic, service description, service value.

### FR6: Maintenance Scheduling
Functionality to schedule future maintenance: future date, service to be performed.

### FR7: Maintenance Report
Functionality to display a report of performed maintenance, showing date, mechanic, and value for a chosen period (with total).

### FR10: Scheduled Maintenance Email Notifications
Functionality to send emails to the user for scheduled maintenance reminders.

## User Stories
- As a system user, I want to receive emails reminding me of upcoming maintenance a few days before the scheduled date.
- As a system user, I want to be able to view a report of performed maintenance and their costs, totaled by period.

## Acceptance Criteria
- Record maintenance with date, mechanic, service description, value
- Schedule future maintenance with date and service details
- Generate maintenance reports by time period
- Calculate total costs for selected periods
- Automated email reminders for scheduled maintenance
- Email sent few days before scheduled date

## Technical Notes
- Email scheduling system required
- Report generation with date filtering
- Cost calculation and totaling functionality
- Integration with mechanic data