# Second Brain App

Second Brain is a full-stack TypeScript monorepo (React frontend + Express backend) for personal knowledge management. Save links, articles, videos and notes; organize them into multiple “brains,” tag and search items, auto-extract URL metadata, and share public collections via unique links. Built with MongoDB, JWT auth, TailwindCSS and TypeScript for a reliable, developer-friendly foundation.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp packages/server/.env.example packages/server/.env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

   This starts both the server (port 5000) and client (port 3000) concurrently.

## 📁 Project Structure

```
second-brain/
├── packages/
│   ├── server/           # Express.js backend
│   │   ├── src/
│   │   │   ├── models/   # MongoDB schemas
│   │   │   ├── routes/   # API endpoints
│   │   │   └── middleware/
│   │   └── package.json
│   └── client/           # React frontend
│       ├── src/
│       │   ├── components/
│       │   ├── contexts/
│       │   └── main.tsx
│       └── package.json
└── package.json          # Workspace root
```

## 🛠 Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing
- Automatic URL metadata extraction

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios for API calls
- Lucide React icons

## 🔥 Features

- **Authentication:** Register/login with JWT
- **Multiple Brains:** Organize content into different collections
- **Content Types:** Links, articles, videos, notes
- **Auto Metadata:** Automatic title/description extraction from URLs
- **Search & Filter:** Full-text search and type filtering
- **Tags:** Organize items with custom tags
- **Sharing:** Share brains publicly with unique URLs
- **Responsive:** Works on desktop and mobile

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in

### Brains
- `GET /api/brains` - Get user's brains
- `POST /api/brains` - Create new brain
- `POST /api/brains/:id/share` - Generate share link
- `GET /api/brains/shared/:token` - View shared brain

### Items
- `GET /api/items` - Get items (with search/filter)
- `POST /api/items` - Add new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

## 🚢 Deployment

### Environment Variables
```bash
# Server (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/second-brain
JWT_SECRET=your-super-secret-jwt-key
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```
