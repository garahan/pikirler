# Pikirler - The World of Thoughts

A modern, minimalist social platform for sharing thoughts and ideas. Built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Features

- 🌙 Dark theme UI with custom animations
- 📝 Create and share thoughts
- ❤️ Like functionality
- 📊 Trending topics
- 🤖 AI-powered replies using Google Gemini
- ⏰ Schedule posts for later
- 🔐 Admin panel with bulk upload
- ⚡ Vercel cron jobs for automation
- 📦 Redis caching with Upstash

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Google Gemini API
- **Caching**: Upstash Redis
- **Deployment**: Vercel
- **Auth**: JWT

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Upstash Redis account
- Google Gemini API key
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/garahan/pikirler.git
cd pikirler
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your credentials:
```
DATABASE_URL="postgresql://user:password@localhost:5432/pikirler"
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
GEMINI_API_KEY="your-gemini-api-key"
ADMIN_SECRET="your-secret-admin-password"
JWT_SECRET="your-jwt-secret-key"
```

5. Set up the database:
```bash
npx prisma migrate dev --name init
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
pikirler/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel
│   ├── components/        # React components
│   └── layout.tsx         # Root layout
├── lib/                   # Utility functions
│   ├── db.ts             # Prisma client
│   ├── redis.ts          # Redis client
│   ├── gemini.ts         # Gemini API wrapper
│   └── auth.ts           # Authentication
├── prisma/               # Database schema
└── tailwind.config.js    # Tailwind configuration
```

## API Endpoints

### Posts
- `GET /api/feed` - Get global feed
- `POST /api/post` - Create new post
- `POST /api/like` - Toggle like on post

### Admin
- `POST /api/admin/upload` - Bulk upload posts
- `GET/POST /api/admin/settings` - Manage settings

### Cron Jobs
- `GET /api/cron/scheduler` - Auto-publish scheduled posts
- `GET /api/cron/gemini-bot` - Generate AI replies

## Admin Panel

Access the admin panel at `/admin` with your admin secret.

Features:
- Bulk upload posts from JSON
- Configure active hours
- View analytics

## Deployment

Deploy to Vercel with one click:

```bash
vercel deploy
```

Make sure to set environment variables in Vercel dashboard.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Author

Garahan

---

**Pikirleriň dünýäsi** – The world of thoughts