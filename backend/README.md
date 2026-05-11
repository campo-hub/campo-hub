# Everything Campus Backend

This backend is built for MongoDB storage and Firebase authentication. It exposes a small API for user profile lookup and marketplace listings.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI` to your MongoDB connection string.
3. Set `MONGO_DB_NAME` if you want a custom database name.
4. Set Firebase Admin credentials with `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.

## Install

```bash
cd backend
npm install
```

## Run

```bash
npm start
```

## API Endpoints

- `GET /health`
- `GET /users/me` - requires `Authorization: Bearer <Firebase ID token>`
- `GET /listings`
- `GET /listings/:id`
- `POST /listings` - requires Firebase auth

## Notes

- Authentication is handled by Firebase Admin verifying the frontend ID token.
- Listings and user metadata are stored in MongoDB.
- Use the same Firebase project for the web app so the frontend can issue ID tokens.
