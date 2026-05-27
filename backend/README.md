# Tanglaw Backend

This backend is a lightweight Express + TypeScript API service for the Tanglaw scholarship portal. It exposes sample scholarship data and message persistence endpoints used by the frontend.

## Quickstart

```bash
cd backend
npm install
npm run dev
```

## Available endpoints

- `GET /api/health` — service health check
- `GET /api/scholarships` — sample scholarship data
- `POST /api/messages` — create a new chat message record
- `GET /api/messages/:userId` — retrieve chat messages for a given user

## Build and run

```bash
npm run build
npm start
```
