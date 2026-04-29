# Deployment Guide: Tawsila.tn

This guide explains how to deploy the **Next.js frontend**, the **Spring Boot backend**, and the **PostgreSQL database**.

## 1. Database Deployment (Render)

Render provides a managed PostgreSQL service that is easy to set up.

1.  Log in to [Render](https://render.com/).
2.  Click **New** -> **PostgreSQL**.
3.  Name your database (e.g., `tawsila-db`).
4.  Copy the **Internal Database URL** (for the backend) and **External Database URL** (for local testing).

## 2. Backend Deployment (Render)

The backend is a Spring Boot application.

1.  Click **New** -> **Web Service**.
2.  Connect your GitHub repository.
3.  **Name:** `tawsila-backend`.
4.  **Runtime:** Select **Docker** (This will use the `Dockerfile` in your root).
5.  **Environment Variables:**
    *   `APP_PERSISTENCE_MODE`: `postgres`
    *   `POSTGRES_URL`: `jdbc:postgresql://dpg-d7ol9ubbc2fs73ca0vr0-a/tawsila_db` (Internal URL for Render)
    *   `POSTGRES_USER`: `tawsila_db_user`
    *   `POSTGRES_PASSWORD`: `hVI19Yu4RmJHK5KhNSinjkGRZjtuQsQb`
    *   `POSTGRES_SCHEMA`: `public`
    *   `PORT`: `8080`

## 3. Frontend Deployment (Vercel or Render)

### Option A: Vercel (Recommended for Next.js)

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New** -> **Project**.
3.  Connect your GitHub repository.
4.  Select the `tawsila-frontend` folder as the **Root Directory**.
5.  **Framework Preset:** `Next.js`.
6.  **Environment Variables:**
    *   `NEXT_PUBLIC_API_BASE_URL`: `https://tawsila-backend-ztnw.onrender.com` (The URL of your deployed backend)
7.  Click **Deploy**.

### Option B: Render (Static Site)

1.  Click **New** -> **Static Site**.
2.  Connect your GitHub repository.
3.  **Root Directory:** `tawsila-frontend`.
4.  **Build Command:** `npm run build`.
5.  **Publish Directory:** `out` (or `.next` depending on your build config).

## 4. Final Wiring (CORS)

Once your frontend is deployed (e.g., `https://tawsila.vercel.app`), you **must** update the backend to allow requests from that domain.

1.  In the backend code (`WebSecurityConfig.java`), update `allowedOrigins`:
    ```java
    .allowedOrigins("http://localhost:3000", "https://tawsila-eta.vercel.app")
    ```
2.  Redeploy the backend.

## 5. Verification

1.  Check the backend health: `https://your-backend-url.onrender.com/api/system/health`.
2.  Open your frontend URL and try to log in or search for a trip.
