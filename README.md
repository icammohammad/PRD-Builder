# AI PRD Builder

A professional Product Requirements Document (PRD) generator powered by Gemini 3 Pro.

## Local Installation

### Prerequisites
- Node.js (v18 or later)
- MySQL OR SQLite
- PM2 (Global) `npm install -g pm2`

### 1. Clone the project
```bash
git clone <repository-url>
cd prd-builder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in the required variables:
```bash
cp .env.example .env
```
Key variables:
- `GEMINI_API_KEY`: Your Google AI Studio API Key.
- `DATABASE_URL`: Your database connection string (SQLite or MySQL).
- `JWT_SECRET`: A random string for auth tokens.

### 4. Database Setup
If using SQLite:
```bash
npm run prisma:sqlite:push
npm run prisma:sqlite:seed
```

If using MySQL:
```bash
npm run prisma:mysql:push
npm run prisma:mysql:seed
```

### 5. Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode with PM2 (Backend)
To run the server in the background using PM2:

1. Build the frontend:
```bash
npm run build
```

2. Start the backend with PM2:
```bash
pm2 start server.ts --name prd-builder-api --interpreter npx -- tsx
```
*Note: Using `--interpreter npx -- tsx` allows running the TypeScript file directly. For compiled JS, use `node dist/server.js`.*

3. Monitor:
```bash
pm2 status
pm2 logs prd-builder-api
```

### Scripts
- `npm run dev`: Start dev server (Server + Vite)
- `npm run build`: Build for production
- `npm run lint`: Run typescript checks
- `npm run prisma:sqlite:push`: Sync SQLite schema
- `npm run prisma:mysql:push`: Sync MySQL schema
