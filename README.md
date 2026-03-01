<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  Backend API for Tic-Tac-Toe (OX) built with <strong>NestJS</strong>, <strong>Prisma</strong>, <strong>PostgreSQL</strong>, and <strong>OAuth 2.0 (Auth0)</strong>.
</p>

---

# Tic Tac Toe API

Backend implementation for a Tic-Tac-Toe Web Application.

This service provides:

- OAuth 2.0 authentication (Auth0)
- Player vs Bot gameplay
- Score tracking with streak bonus logic
- Admin-style score inspection endpoint
- Docker-ready deployment

---

## Overview

This project implements a RESTful backend for a Tic-Tac-Toe (OX) game.

Core Features:

- OAuth 2.0 login via Auth0 (RS256 + JWKS validation)
- Play against a bot
- Automatic score calculation:
  - Win = +1
  - Lose = -1
  - Draw = 0
- Bonus rule:
  - 3 consecutive wins -> +1 extra point
  - Win streak resets after bonus is granted
- Persistent score tracking per user
- Clean architecture with modular separation

The system is stateless and production-ready.

---

## Tech Stack

- **Framework**: NestJS (Fastify adapter)
- **Language**: TypeScript
- **Runtime**: Bun
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: OAuth 2.0 (Auth0) + Passport JWT
- **Cache**: Redis (optional)
- **Testing**: Jest
- **Containerization**: Docker + Docker Compose

---

## Architecture

```
src/
 ├── auth/             # OAuth strategy & guards
 ├── user/             # User management
 ├── game/             # Game logic (OX engine)
 ├── score/            # Score & streak calculation
 ├── main.ts
 └── prisma.service.ts # Prisma service
```

Design principles:

- Thin controllers
- Business logic inside services
- Fully testable GameService
- Separation of auth / game / scoring concerns

---

## Authentication (OAuth 2.0)

Authentication is handled via Auth0.

Flow:

1. Frontend authenticates user with Auth0
2. Frontend sends `Authorization: Bearer <access_token>`
3. Backend validates:
   - issuer
   - audience
   - RS256 signature via JWKS
4. User is resolved/created internally

No local password storage is implemented.

---

## Environment Variables

Create `.env` (local development):

```
PORT=3001
NODE_ENV=local

DATABASE_URL=postgresql://postgres:123456@localhost:5432/tic_tac_toe

OAUTH_ISSUER=https://YOUR_DOMAIN.auth0.com/
OAUTH_AUDIENCE=https://tic-tac-toe-api

REDIS_HOST=localhost
REDIS_PORT=6379
```

For Docker, use `.env.docker` or environment section in compose file.

---

## Installation

Install dependencies:

```bash
bun install
```

Generate Prisma client:

```bash
bunx prisma generate
```

Push schema to database:

```bash
bunx prisma db push
```

---

## Running the Application

### Development

```bash
bun run start:dev
```

### Production

```bash
bun run build
bun run start:prod
```

Server runs at:

```
http://localhost:3001/api
```

---

## API Endpoints

All protected endpoints require:

```
Authorization: Bearer <access_token>
```

---

### Game

#### Play

```
POST /api/game/play
```

Body:

```json
{
  "board": [null, null, null, null, null, null, null, null, null],
  "position": 0
}
```

Response:

```json
{
  "board": ["X", null, null, null, "O", null, null, null, null],
  "result": "WIN" // WIN | LOSE | DRAW | null
}
```

Rules:

- Player = X
- Bot = O
- Bot move = random empty cell
- Score updates automatically when game ends

---

### Score

#### Get All Player Scores

```
GET /api/scores
```

Returns all users and their current scores.

---

## Score Logic

Scoring Rules:

- WIN -> +1
- LOSE -> -1
- DRAW -> 0
- 3 consecutive wins -> +1 bonus
- Win streak resets after bonus

Score processing flow:

```
GameService -> ScoreService -> Prisma
```

Game logic is isolated and unit-tested.

---

## Testing

Run unit tests:

```bash
bun run test
```

Coverage:

```bash
bun run test:cov
```

Tested scenarios include:

- Invalid move
- Win detection
- Lose detection
- Draw detection
- ScoreService invocation
- Streak bonus logic

---

## Docker

### Build

```bash
docker build -t tic_tac_toe-api .
```

### Run with Compose

```bash
docker compose up --build
```

Services:

- app
- postgres
- redis

Application will run on:

```
http://localhost:3001
```

---

## Production Notes

- Stateless backend
- OAuth 2.0 compliant
- RS256 JWT validation via JWKS
- Clean modular structure
- Docker-ready
- No unnecessary dependencies

---

## License

MIT
