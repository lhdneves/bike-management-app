-- Bicycle Maintenance Management System - Supabase Database Setup
-- Execute this script in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs
CREATE TYPE "UserRole" AS ENUM ('BIKE_OWNER', 'MECHANIC', 'ADMIN');
CREATE TYPE "BikeType" AS ENUM ('SPEED', 'MOUNTAIN_BIKE', 'ELECTRIC', 'URBAN');
CREATE TYPE "TractionType" AS ENUM ('MANUAL', 'ASSISTED');

-- 1. Users Table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone_number" TEXT,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Bikes Table
CREATE TABLE "bikes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "owner_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer" TEXT,
    "type" "BikeType" NOT NULL,
    "traction_type" "TractionType" NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Components Table
CREATE TABLE "components" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bike_id" UUID NOT NULL REFERENCES "bikes"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "installation_date" DATE,
    "observation" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Mechanics Table
CREATE TABLE "mechanics" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "opening_hours" TEXT,
    "rating" DECIMAL(3,2),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Maintenance Records Table
CREATE TABLE "maintenance_records" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bike_id" UUID NOT NULL REFERENCES "bikes"("id") ON DELETE CASCADE,
    "mechanic_id" UUID REFERENCES "mechanics"("id") ON DELETE SET NULL,
    "service_date" DATE NOT NULL,
    "service_description" TEXT NOT NULL,
    "cost" DECIMAL(10,2),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Scheduled Maintenance Table
CREATE TABLE "scheduled_maintenance" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bike_id" UUID NOT NULL REFERENCES "bikes"("id") ON DELETE CASCADE,
    "scheduled_date" DATE NOT NULL,
    "service_description" TEXT NOT NULL,
    "notification_days_before" INTEGER,
    "is_completed" BOOLEAN DEFAULT FALSE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Banners Table
CREATE TABLE "banners" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "image_url" TEXT NOT NULL,
    "target_url" TEXT,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
    "tags" TEXT[],
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX "idx_bikes_owner_id" ON "bikes"("owner_id");
CREATE INDEX "idx_components_bike_id" ON "components"("bike_id");
CREATE INDEX "idx_mechanics_user_id" ON "mechanics"("user_id");
CREATE INDEX "idx_maintenance_records_bike_id" ON "maintenance_records"("bike_id");
CREATE INDEX "idx_maintenance_records_mechanic_id" ON "maintenance_records"("mechanic_id");
CREATE INDEX "idx_scheduled_maintenance_bike_id" ON "scheduled_maintenance"("bike_id");
CREATE INDEX "idx_scheduled_maintenance_date" ON "scheduled_maintenance"("scheduled_date");
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_bikes BEFORE UPDATE ON "bikes" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_components BEFORE UPDATE ON "components" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_mechanics BEFORE UPDATE ON "mechanics" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_maintenance_records BEFORE UPDATE ON "maintenance_records" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_scheduled_maintenance BEFORE UPDATE ON "scheduled_maintenance" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_banners BEFORE UPDATE ON "banners" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Insert sample admin user (password: admin123)
INSERT INTO "users" ("name", "email", "password_hash", "role") VALUES 
('Administrator', 'admin@bikemanager.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBfrK/5.j6KY3O', 'ADMIN');

-- Insert sample bike owner (password: owner123)
INSERT INTO "users" ("name", "email", "password_hash", "phone_number", "role") VALUES 
('João Silva', 'joao@example.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '11999999999', 'BIKE_OWNER');

-- Insert sample mechanic user (password: mechanic123)
INSERT INTO "users" ("name", "email", "password_hash", "phone_number", "role") VALUES 
('Carlos Mecânico', 'carlos@mecanicosilva.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '11888888888', 'MECHANIC');

-- Get the mechanic user ID and create mechanic profile
INSERT INTO "mechanics" ("user_id", "address", "phone", "opening_hours", "rating")
SELECT "id", 'Rua das Bicicletas, 123 - São Paulo, SP', '11888888888', 'Segunda a Sexta: 8:00-18:00', 4.8
FROM "users" WHERE "email" = 'carlos@mecanicosilva.com';

-- Sample active banner
INSERT INTO "banners" ("image_url", "target_url", "description", "tags") VALUES 
('https://via.placeholder.com/800x200/4A90E2/FFFFFF?text=Promoção+Pneus', 'https://example.com/pneus', 'Promoção especial em pneus para mountain bike', ARRAY['MOUNTAIN_BIKE', 'MANUAL']);

COMMIT;