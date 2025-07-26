# Epic 2: Bike & Component Management

## Overview
This epic covers all functionality related to bicycle registration, component tracking, and the main dashboard for managing bikes.

## Functional Requirements

### FR2: Main Dashboard
The system must display a main screen showing cards for registered bikes. If no bikes are registered, a message to register a bike should be displayed.

### FR3: Bike Registration
Functionality to register a bike, including: bike name (mandatory), short description, manufacturer, type (speed, mountain bike), traction (manual, assisted).

### FR4: Component Registration
Functionality to register components for a bike: name, description.

## User Stories
- As a system user, I want to be able to register my bicycles so that I can record their components, performed maintenance, and schedule future maintenance.

## Acceptance Criteria
- Dashboard displays bike cards for registered bikes
- Empty state message when no bikes registered
- Bike registration form with required and optional fields:
  - Bike name (mandatory)
  - Short description
  - Manufacturer
  - Type (speed, mountain bike)
  - Traction (manual, assisted)
- Component registration linked to specific bikes
- Component details: name, description

## Technical Notes
- Bike-component relationship (one-to-many)
- Dashboard should be responsive and intuitive
- Form validation for required fields