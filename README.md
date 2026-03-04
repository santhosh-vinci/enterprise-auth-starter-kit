# Secure Auth & RBAC Starter Kit (Node + React + Zod + Axios)

## Local Run

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with strong JWT secrets.

### 3) Start backend + frontend
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Architecture notes
- **Access token**: 15m JWT returned in response body and stored in-memory on the client.
- **Refresh token**: 7d JWT stored in an HTTP-only cookie.
- **Rotation**: `/api/auth/refresh` rotates refresh token and revokes previous token IDs.
- **RBAC**:
  - `User` => read posts
  - `Admin` => create/update/delete posts

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/posts`
- `POST /api/posts` (Admin)
- `PUT /api/posts/:id` (Admin)
- `DELETE /api/posts/:id` (Admin)
