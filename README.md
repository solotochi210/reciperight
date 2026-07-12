# RecipeRight

A community-driven recipe sharing platform. Users post recipes with photos, ingredients and steps; others discover, save, rate and comment. Built as an npm-workspaces monorepo.

## Tech Stack

**Client** — React 18, Vite, React Router v6, TanStack Query v5, Axios, React Hook Form + Zod, Framer Motion, Tailwind CSS, Lucide icons.

**Server** — Node.js + Express, Mongoose/MongoDB, JWT (access + refresh), Passport Google OAuth, Multer + Cloudinary, SendGrid, Helmet/CORS/rate-limit.

## Project Structure

```
recipe/
├── client/          # React + Vite frontend
├── server/          # Express REST API
├── package.json     # npm workspaces root
└── README.md
```

## Prerequisites

- Node.js >= 18
- A running MongoDB instance (local or Atlas)
- (Optional) Cloudinary, Google OAuth and SendGrid credentials for media, social login and email

## Setup

1. Install all workspace dependencies from the repo root:

```bash
npm install
```

2. Configure environment variables.

```bash
# server
cp server/.env.example server/.env

# client
cp client/.env.example client/.env
```

Fill in `server/.env` (at minimum `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).

3. Run both apps in development (from the repo root):

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000 (health check at `/api/health`)

Run them individually if preferred:

```bash
npm run dev:server
npm run dev:client
```

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Google OAuth |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Media uploads |
| `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` | Transactional email |
| `CLIENT_URL` | Allowed CORS origin (default http://localhost:5173) |

### Client (`client/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base URL (default http://localhost:5000/api) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run client + server concurrently |
| `npm run dev:server` | Run API only (nodemon) |
| `npm run dev:client` | Run client only (Vite) |
| `npm run build` | Build the client for production |
| `npm run start` | Start the API in production mode |
| `npm test` | Run server tests (Jest) |
