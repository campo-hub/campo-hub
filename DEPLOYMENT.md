# Deployment Guide

## Frontend: GitHub Pages

This project is configured to publish the frontend to GitHub Pages at:

`https://campo-hub.github.io/campoub`

### 1. Install dependencies

From the `frontend` folder:

```bash
npm install
```

### 2. Set the backend URL for production

Open `frontend/.env.production` and set:

```env
VITE_API_BASE=https://your-backend-service.onrender.com
```

### 3. Build and deploy

From the `frontend` folder:

```bash
npm run deploy
```

This runs `npm run build` and publishes `dist` to the `gh-pages` branch.

### 4. Verify

Open the Pages site URL and confirm the app loads correctly.

> If you use a custom GitHub Pages branch or folder, update the repository settings accordingly.

## Backend: Render

The backend is already prepared for Render deployment.

### 1. Create a new Web Service

- In Render, create a new Web Service
- Connect your GitHub repo
- Set the root directory to `backend`
- Set the environment to `Node`
- Use the build command:

```bash
npm install
```

- Use the start command:

```bash
npm start
```

- Set the port to `4000` or leave the default

### 2. Add environment variables

In Render, configure all required secrets:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `PORT` (optional)
- `ALLOWED_ORIGINS` (set to your frontend URL, e.g. `https://campo-hub.github.io`)
- `MONGO_TLS_INSECURE` (only if needed; default is `false`)

### 3. Deploy

Render will build and deploy the backend automatically.

## Notes

- The frontend now uses `HashRouter` and Vite base `/campoub/`, which is compatible with GitHub Pages.
- The backend uses server-side auth verification and explicit validation.
- Make sure your frontend production backend URL points to the Render service.
