# Epic 4: Mechanic Services & Location

## Overview
This epic covers all functionality related to mechanic registration, profile management, and location services for bicycle owners to find mechanics.

## Functional Requirements

### FR8: Proximity Mechanic View
Functionality to view nearby mechanics: select city, state. If available, show a list of mechanics in the city (name, address, phone).

### FR11: Mechanic Route Functionality
Functionality for a route to mechanics (implicitly from the user's location).

### FR12: Mechanic Registration
Functionality for mechanics to register: name, email (repeat), address, phone, password (repeat).

### FR13: Mechanic Login
Functionality for mechanics to log in via email/password.

### FR14: Mechanic Operating Hours
Functionality to record the mechanic's operating hours.

### FR15: Mechanic Profile Editing
Functionality for mechanics to edit their profile data: name, address, phone.

## User Stories
- As a system user, I want to be able to locate mechanics in my city.
- As a mechanic, I want to register my workshop so that I can be found by bicycle owners.

## Acceptance Criteria
- City/state selection for mechanic search
- Display mechanic list with name, address, phone
- Route functionality from user location to mechanic
- Mechanic registration with email verification
- Mechanic login system
- Operating hours management
- Profile editing for mechanics
- Secure mechanic authentication

## Technical Notes
- Location-based search functionality
- Mapping/routing integration
- Separate mechanic user type
- Geolocation services
- Operating hours scheduling system