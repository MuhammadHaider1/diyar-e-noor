# DIYAR E NOOR — Union of Beloveds

A halal love, purity, and relationships content platform rooted in Islamic values.

## Tech Stack

- **Backend**: FastAPI (Python 3.12), PostgreSQL, SQLAlchemy 2.0 (async)
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Auth**: JWT (access + refresh tokens)
- **Payments**: JazzCash & Easypaisa integration
- **Deployment**: Docker Compose

## Quick Start

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- FastAPI backend on port 8000
- React frontend on port 80

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Features

### User Roles

- **Super Admin**: Full control, manage admins/subscriptions
- **Admin**: Create/edit posts (requires paid subscription)
- **User**: Browse, like, comment
- **Guest**: Read-only access

### Design

- Deep maroon/rose with warm gold accents
- Elegant Cormorant Garamond + Inter typography
- Islamic geometric patterns (subtle)
- Framer Motion animations throughout
- Immersive reading experience

## API Endpoints

- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/posts` - List posts
- `POST /api/v1/posts` - Create post (admin only)
- `GET /api/v1/posts/{slug}` - Get post
- `POST /api/v1/posts/{id}/like` - Toggle like
- `GET /api/v1/posts/{id}/comments` - Get comments
- `POST /api/v1/posts/{id}/comments` - Add comment
- `POST /api/v1/admin/subscribe` - Subscribe as admin
- `GET /api/v1/admin/subscription-status` - Check subscription
- `GET /api/v1/superadmin/admins` - List admins
- `GET /api/v1/superadmin/payments` - List payments

## License

Made with love and intention.
