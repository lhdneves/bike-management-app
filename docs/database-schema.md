# Bicycle Maintenance, Expense, and Component Control Management System Database Schema

---

## 1. Initial Database Schema Draft

This section outlines the initial draft of the database tables and their key fields, based on the project's requirements and user stories.

### `users` Table
This table will store information for all types of users (bike owners, mechanics, administrators).

* `id` (UUID, Primary Key) - Unique identifier for the user.
* `name` (TEXT, Not Null) - Full name of the user.
* `email` (TEXT, Unique, Not Null) - User's email, used for login and unique identification.
* `password_hash` (TEXT, Not Null) - Hashed password for security.
* `phone_number` (TEXT, Optional) - User's phone number.
* `role` (ENUM: 'BIKE_OWNER', 'MECHANIC', 'ADMIN', Not Null) - Defines the user's role in the system.
* `created_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP) - Timestamp of when the record was created.
* `updated_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP, On Update: CURRENT_TIMESTAMP) - Timestamp of the last update.

### `bikes` Table
Stores details about each bicycle registered by a bike owner.

* `id` (UUID, Primary Key) - Unique identifier for the bike.
* `owner_id` (UUID, Foreign Key to `users.id`, Not Null) - Links the bike to its owner.
* `name` (TEXT, Not Null) - Name given to the bike (e.g., "Minha Mountain Bike").
* `description` (TEXT, Optional) - Short description of the bike.
* `manufacturer` (TEXT, Optional) - Bike manufacturer.
* `type` (ENUM: 'SPEED', 'MOUNTAIN_BIKE', 'ELECTRIC', 'URBAN', etc., Not Null) - Type of bicycle.
* `traction_type` (ENUM: 'MANUAL', 'ASSISTED', Not Null) - Specifies if it's manual or assisted/electric.
* `created_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)
* `updated_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP, On Update: CURRENT_TIMESTAMP)

### `components` Table
Records individual components associated with a bike.

* `id` (UUID, Primary Key) - Unique identifier for the component.
* `bike_id` (UUID, Foreign Key to `bikes.id`, Not Null) - Links the component to a specific bike.
* `name` (TEXT, Not Null) - Name of the component (e.g., "Pneu Dianteiro", "Corrente").
* `description` (TEXT, Optional) - Detailed description of the component.
* `installation_date` (DATE, Optional) - Date when the component was installed or last replaced.
* `observation` (TEXT, Optional) - Any relevant observations about the component.
* `created_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)
* `updated_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP, On Update: CURRENT_TIMESTAMP)

### `mechanics` Table
Stores specific details for users who are mechanics. This table will have a one-to-one relationship with the `users` table where `role` is 'MECHANIC'.

* `id` (UUID, Primary Key) - Unique identifier for the mechanic profile.
* `user_id` (UUID, Foreign Key to `users.id`, Unique, Not Null) - Links to the core user account.
* `address` (TEXT, Not Null) - Physical address of the mechanic's workshop.
* `phone` (TEXT, Not Null) - Workshop phone number.
* `opening_hours` (TEXT, Optional) - A simple string for operating hours (e.g., "Mon-Fri 9-6"). Can be more complex later.
* `rating` (DECIMAL, Optional) - Average rating, if a rating system is implemented.
* `created_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)
* `updated_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP, On Update: CURRENT_TIMESTAMP)

### `maintenance_records` Table
Logs all maintenance services performed on a bike.

* `id` (UUID, Primary Key) - Unique identifier for the maintenance record.
* `bike_id` (UUID, Foreign Key to `bikes.id`, Not Null) - Links the maintenance to a specific bike.
* `mechanic_id` (UUID, Foreign Key to `mechanics.id`, Optional) - Links to the mechanic who performed the service (if registered in the system).
* `service_date` (DATE, Not Null) - Date the maintenance was performed.
* `service_description` (TEXT, Not Null) - Description of the service performed.
* `cost` (DECIMAL(10, 2), Optional) - The total cost of the service.
* `created_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)
* `updated_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP, On Update: CURRENT_TIMESTAMP)

### `scheduled_maintenance` Table
Stores upcoming maintenance appointments.

* `id` (UUID, Primary Key) - Unique identifier for the scheduled maintenance.
* `bike_id` (UUID, Foreign Key to `bikes.id`, Not Null) - Links the scheduled maintenance to a specific bike.
* `scheduled_date` (DATE, Not Null) - The date the maintenance is scheduled for.
* `service_description` (TEXT, Not Null) - Description of the service planned.
* `notification_days_before` (INTEGER, Optional) - Number of days before the `scheduled_date` to send an email reminder.
* `is_completed` (BOOLEAN, Not Null, Default: FALSE) - Flag to mark if the scheduled maintenance has been completed (and potentially moved to `maintenance_records`).
* `created_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)
* `updated_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP, On Update: CURRENT_TIMESTAMP)

### `banners` Table
Manages advertising banners displayed in the application.

* `id` (UUID, Primary Key) - Unique identifier for the banner.
* `image_url` (TEXT, Not Null) - URL to the banner image.
* `target_url` (TEXT, Optional) - URL to redirect to when the banner is clicked.
* `description` (TEXT, Optional) - Brief description or alt text for the banner.
* `start_date` (DATE, Optional) - Date from which the banner should be active.
* `end_date` (DATE, Optional) - Date until which the banner should be active.
* `is_active` (BOOLEAN, Not Null, Default: TRUE) - Flag to enable/disable the banner display.
* `tags` (TEXT[], Optional) - Array of text tags (e.g., ['speed', 'mountain_bike']) for targeted display.
* `created_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)
* `updated_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP, On Update: CURRENT_TIMESTAMP)