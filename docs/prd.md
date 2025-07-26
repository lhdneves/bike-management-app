# Bicycle Maintenance, Expense, and Component Control Management System Product Requirements Document (PRD)

## 1. Goals and Background Context

#### Goals
* Locate mechanics in their city
* Be reminded of recurring maintenance
* Control what maintenance has been performed
* Control maintenance-related expenses
* Control the lifespan of components
* Help bicycle owners save money
* Increase the safety of their rides

#### Background Context
This project is about building an application for managing the lifecycle of bicycles, including components, maintenance, and expenses. Bicycle owners typically lack control over their bike's lifecycle, leading to uncertainty about optimal maintenance timing, no record of past services, limited information on local mechanics and their ratings, and no systematic control over individual components. This absence of control results in unoptimized expenses, highlighting a clear need for a solution that provides better management.

## 2. User Stories

* **As a bicycle owner,** I want to register in the application so that I can access the system.
* **As a system user,** I want to be able to register my bicycles so that I can record their components, performed maintenance, and schedule future maintenance.
* **As a system user,** I want to receive emails reminding me of upcoming maintenance a few days before the scheduled date.
* **As a system user,** I want to be able to view a report of performed maintenance and their costs, totaled by period.
* **As a system user,** I want to be able to locate mechanics in my city.
* **As a mechanic,** I want to register my workshop so that I can be found by bicycle owners.
* **As a system administrator,** I want to be able to see registrations of bicycle owners and mechanics to generally assess the platform's performance.
* **As a system administrator,** I want to include banners with advertisements from segment suppliers to be displayed to bicycle owners.

## 3. Functional Requirements

1.  **User Authentication:** Functionality for login via email/password. If the bicycle owner does not have an account, the system must provide a new registration screen (name, email (repeat), phone, password (repeat)). Optionally allow registration via Google.
2.  **Main Dashboard:** The system must display a main screen showing cards for registered bikes. If no bikes are registered, a message to register a bike should be displayed.
3.  **Bike Registration:** Functionality to register a bike, including: bike name (mandatory), short description, manufacturer, type (speed, mountain bike), traction (manual, assisted).
4.  **Component Registration:** Functionality to register components for a bike: name, description.
5.  **Maintenance Logging:** Functionality to record maintenance activities: date, mechanic, service description, service value.
6.  **Maintenance Scheduling:** Functionality to schedule future maintenance: future date, service to be performed.
7.  **Maintenance Report:** Functionality to display a report of performed maintenance, showing date, mechanic, and value for a chosen period (with total).
8.  **Proximity Mechanic View:** Functionality to view nearby mechanics: select city, state. If available, show a list of mechanics in the city (name, address, phone).
9.  **Banner Display:** Functionality to show banners of interest to users, if available.
10. **Scheduled Maintenance Email Notifications:** Functionality to send emails to the user for scheduled maintenance reminders.
11. **Mechanic Route Functionality:** Functionality for a route to mechanics (implicitly from the user's location).
12. **Mechanic Registration:** Functionality for mechanics to register: name, email (repeat), address, phone, password (repeat).
13. **Mechanic Login:** Functionality for mechanics to log in via email/password.
14. **Mechanic Operating Hours:** Functionality to record the mechanic's operating hours.
15. **Mechanic Profile Editing:** Functionality for mechanics to edit their profile data: name, address, phone.
16. **Administrator Login:** Functionality for the administrator to log into the system.
17. **Administrator User Listing:** Functionality for the administrator to view the list of bicycle owners and mechanics.
18. **Administrator Banner Management:** Functionality for the administrator to include banners with tags to appear for bicycle owners who match the content (speed, mountain bike, assisted, manual).

## 4. Non-Functional Requirements (NFRs)

1.  **Security:** The system must be highly secure to prevent account invasions and data leaks.
2.  **Performance:** The system must be highly performant to satisfy users.
3.  **Usability:** The system must have excellent usability to attract new users.

## 5. User Flows

1.  **User Registration & Login Flow:**
    * User opens the app.
    * User chooses between login and new registration.
    * User completes registration.
    * User returns to the login screen and enters login/password.
    * User is redirected to the dashboard.
2.  **Bike Registration Flow:**
    * User enters the dashboard and sees cards of their registered bicycles.
    * If no bikes are registered, the user registers their bike and its components.
3.  **Maintenance Management Flow:**
    * Once the bike is registered, the user can record performed maintenance or schedule upcoming maintenance.
4.  **View Maintenance Flow:**
    * User can view performed and scheduled maintenance.
5.  **Maintenance Report Flow:**
    * User can view a report of past maintenance, choosing a period.
6.  **Mechanic Location Flow:**
    * User can locate mechanics in their city.

## 6. Data Model (High-Level)

1.  **Users:** (Bicycle Owners)
2.  **Bicycles:**
3.  **Components:** (of the bicycles)
4.  **Maintenance:**
5.  **Maintenance Schedules/Appointments:**
6.  **Mechanics:**
7.  **Banners:**