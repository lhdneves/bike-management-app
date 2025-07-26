@echo off
echo 🚲 Setting up Bicycle Maintenance System...
echo.

echo Installing root dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Copying environment files...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Created backend/.env from example
) else (
    echo ⚠️  backend/.env already exists, skipping...
)

if not exist "frontend\.env.local" (
    copy "frontend\.env.example" "frontend\.env.local"
    echo ✅ Created frontend/.env.local from example
) else (
    echo ⚠️  frontend/.env.local already exists, skipping...
)

echo.
echo 📝 Next steps:
echo 1. Configure your database connection in backend/.env
echo 2. Run database migrations: npm run db:migrate
echo 3. Seed the database: npm run db:seed
echo 4. Start the development servers: npm run dev
echo.
echo 🎉 Setup complete!
pause