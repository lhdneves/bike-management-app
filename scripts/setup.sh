#!/bin/bash

echo "🚲 Setting up Bicycle Maintenance System..."
echo ""

echo "Installing root dependencies..."
npm install

echo ""
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "Copying environment files..."
if [ ! -f "backend/.env" ]; then
    cp "backend/.env.example" "backend/.env"
    echo "✅ Created backend/.env from example"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

if [ ! -f "frontend/.env.local" ]; then
    cp "frontend/.env.example" "frontend/.env.local"
    echo "✅ Created frontend/.env.local from example"
else
    echo "⚠️  frontend/.env.local already exists, skipping..."
fi

echo ""
echo "📝 Next steps:"
echo "1. Configure your database connection in backend/.env"
echo "2. Run database migrations: npm run db:migrate"
echo "3. Seed the database: npm run db:seed"  
echo "4. Start the development servers: npm run dev"
echo ""
echo "🎉 Setup complete!"