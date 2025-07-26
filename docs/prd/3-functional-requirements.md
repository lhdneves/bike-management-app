# 3. Functional Requirements

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
