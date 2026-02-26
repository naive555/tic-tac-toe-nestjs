<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  Backend service built with <strong>NestJS</strong>, <strong>Prisma</strong>, and <strong>PostgreSQL</strong> for a simple Tic-Tac-Toe game API with authentication and scoring system.
</p>

---

## Overview

This project is a backend API for a Tic-Tac-Toe game.

Main features:

- User registration & login (JWT authentication)
- Play Tic-Tac-Toe against a simple bot
- Automatic score calculation (Win / Lose / Draw)
- Persistent score tracking per user
- Unit tests for core game logic

The goal is clean architecture, modular structure, and testable business logic.

---

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Testing**: Jest
- **Containerization**: Docker (optional)

---

## Requirements

- Node.js >= 18
- PostgreSQL >= 14
- Docker (optional)

---

## Environment Variables

Create `.env` file:

```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/tic_tac_toe"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"
```

---

## Installation

```bash
bun install
```

Generate Prisma client:

```bash
bunx prisma generate
```

Run migrations:

```bash
bunx prisma migrate dev
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
http://localhost:3000
```

---

## API Endpoints

### Auth

#### Register

```
POST /auth/register
```

Body:

```json
{
  "username": "user1",
  "password": "password"
}
```

#### Login

```
POST /auth/login
```

Response:

```json
{
  "accessToken": "jwt-token"
}
```

---

### Game

Requires `Authorization: Bearer <token>`

#### Play Game

```
POST /game/play
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

Game rules:

- Player is always `X`
- Bot is `O`
- Bot move is random
- Score is automatically updated when game ends

---

## Score System

Each user has cumulative score:

- WIN
- LOSE
- DRAW

Score is updated automatically via GameService → ScoreService flow.

---

## Project Structure

```
src/
 ├── auth/
 ├── user/
 ├── game/
 ├── score/
 ├── prisma/
```

Design principles:

- Clear separation of concerns
- Business logic inside services
- Controllers are thin
- Testable core logic

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

GameService is covered with unit tests including:

- Invalid move
- Win case
- Lose case
- Draw case
- ScoreService invocation

---

## Docker (Optional)

Build image:

```bash
docker build -t tic-tac-toe-api .
```

Run container:

```bash
docker run -p 3000:3000 tic-tac-toe-api
```

Make sure PostgreSQL is accessible from container.

---

## Notes

- Stateless API
- JWT-based authentication
- Simple random bot logic (no minimax)
- Designed for clarity and testability over complexity

Simple game. Clean structure. No overengineering.

---

## License

MIT
