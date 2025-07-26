# Epic 1: User Authentication & Registration

## Overview
This epic covers all functionality related to user authentication, registration, and account management for bicycle owners in the system.

## Functional Requirements

### FR1: User Authentication
Functionality for login via email/password. If the bicycle owner does not have an account, the system must provide a new registration screen (name, email (repeat), phone, password (repeat)). Optionally allow registration via Google.

## User Stories
- As a bicycle owner, I want to register in the application so that I can access the system.

## Acceptance Criteria
- User can log in with email/password
- New users can register with name, email, phone, password
- Email verification (repeat entry)
- Password verification (repeat entry) 
- Optional Google OAuth integration
- Secure password storage and validation

## Technical Notes
- Implement secure authentication patterns
- Consider password complexity requirements
- Session management
- Optional OAuth integration with Google