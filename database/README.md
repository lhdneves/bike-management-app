# Database Setup Guide

## Supabase Configuration

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name:** `bicycle-maintenance-system`
   - **Database Password:** Generate a strong password
   - **Region:** Choose closest to your location
5. Click "Create new project"

### 2. Execute Database Schema

1. Wait for your project to be ready (usually 2-3 minutes)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and paste the entire content of `supabase-setup.sql`
4. Click **Run** to execute the script

### 3. Get Connection Details

1. Go to **Settings** > **Database**
2. Copy the **Connection string** (URI format)
3. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 4. Update Environment Variables

Update your `backend/.env` file:

```env
# Replace this with your actual Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Example:
# DATABASE_URL="postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

### 5. Test the Connection

Run the following commands to test:

```bash
cd backend
npm install
npx prisma db pull  # This should work if connection is successful
npx prisma generate
```

## Sample Data

The setup script includes sample users:

### Admin User
- **Email:** admin@bikemanager.com
- **Password:** admin123
- **Role:** ADMIN

### Bike Owner
- **Email:** joao@example.com  
- **Password:** owner123
- **Role:** BIKE_OWNER

### Mechanic
- **Email:** carlos@mecanicosilva.com
- **Password:** mechanic123
- **Role:** MECHANIC

## Database Schema Overview

### Tables Created:
- `users` - All system users (owners, mechanics, admins)
- `bikes` - Bicycles registered by owners
- `components` - Bike components and parts
- `mechanics` - Mechanic profile details
- `maintenance_records` - Completed maintenance history
- `scheduled_maintenance` - Future maintenance appointments
- `banners` - Advertisement banners

### Key Features:
- ✅ UUID primary keys
- ✅ Proper foreign key constraints
- ✅ Cascade deletes where appropriate
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Database indexes for performance
- ✅ Sample data for testing

## Troubleshooting

### Connection Issues
- Verify your password is correct
- Check if your IP is whitelisted (Supabase allows all by default)
- Ensure the project is fully initialized

### Prisma Issues
- Run `npx prisma db pull` to sync schema
- Run `npx prisma generate` to update client
- Check `schema.prisma` matches your database

### SQL Execution Errors
- Execute the SQL script in smaller chunks if needed
- Check for syntax errors in Supabase SQL Editor
- Verify all extensions are enabled

## Next Steps

After successful database setup:

1. Test Prisma connection: `npm run db:test`
2. Run migrations: `npm run db:migrate` 
3. Seed additional data: `npm run db:seed`
4. Start development: `npm run dev`