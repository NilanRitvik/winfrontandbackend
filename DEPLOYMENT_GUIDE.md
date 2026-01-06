# Deploying Win365 Roulette to Vercel

This guide assumes you have a GitHub account and a Vercel account.

## Phase 1: Prepare Database (MongoDB Atlas)
Since Vercel is serverless, you cannot use a local database. You must use a cloud database.

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/login.
2.  Create a **New Cluster** (Shared/Free Tier is fine).
3.  **Database Access**: Create a database user (e.g., `adminUser`) and a secure password. *Write this password down*.
4.  **Network Access**: Add IP Address `0.0.0.0/0` to allow access from anywhere (required for Vercel).
5.  **Connect**: Click "Connect" -> "Connect your application". Copy the connection string.
    *   It looks like: `mongodb+srv://adminUser:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
    *   Replace `<password>` with your actual password.
    *   **Save this connection string**. You will need it as `MONGO_URI`.

## Phase 2: Deploy Backend (Server)

1.  **Push to GitHub**:
    *   Ensure your project is pushed to a GitHub repository.
    *   (Your `server` and `client` folders should be in the repo).

2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard) -> "Add New..." -> "Project".
    *   Import your GitHub repository.

3.  **Configure Project**:
    *   **Project Name**: `win365-server` (or similar).
    *   **Root Directory**: Click "Edit" and select the `server` folder. **This is crucial**.
    *   **Environment Variables**: Add the following:
        *   `MONGO_URI`: Your MongoDB Connection String from Phase 1.
        *   `JWT_SECRET`: A long random string (e.g., `mysecretkey12345`).
        *   `PORT`: `5000` (Optional, Vercel handles this, but good to have).
    *   **Framework Preset**: Select "Other" if not auto-detected (Vercel usually detects Node.js).

4.  **Deploy**:
    *   Click "Deploy".
    *   Wait for the build to finish.
    *   Once deployed, click on the project to get your **Production Domain**. It will look like: `https://win365-server.vercel.app`.
    *   **Copy this URL**.

## Phase 3: Update Client Configuration

1.  Go to your local code: `client/src/config.js`.
2.  Update the `if isProduction` line with your new **Server URL**.
    ```javascript
    export const API_BASE_URL = isProduction
        ? 'https://win365-server.vercel.app/api' // <-- PASTE YOUR VERCEL SERVER URL HERE + /api
        : 'http://localhost:5000/api';
    ```
3.  Commit and push this change to GitHub.

## Phase 4: Deploy Frontend (Client)

1.  **Import to Vercel (Again)**:
    *   Go to Vercel Dashboard -> "Add New..." -> "Project".
    *   Import the **SAME** GitHub repository again.

2.  **Configure Project**:
    *   **Project Name**: `win365-client` (or similar).
    *   **Root Directory**: Click "Edit" and select the `client` folder.
    *   **Framework Preset**: Vercel should auto-detect "Vite".
    *   **Environment Variables**:
        *   If you used `.env` validation, you might need to add `VITE_API_URL` here matching your server URL.
        *   But since we hardcoded it in `config.js` (Step 3), you might skip this unless you refactored to use `import.meta.env`.

3.  **Deploy**:
    *   Click "Deploy".
    *   Once finished, you will get your **Frontend Domain** (e.g., `https://win365-client.vercel.app`).

## Phase 5: Final Check

1.  Open your **Client URL**.
2.  Try to **Login/Register** (This verifies connection to Server and MongoDB).
3.  Try the **Roulette Extraction** (Verifies API functionality).

**Troubleshooting**:
*   **CORS Errors**: If you see CORS errors in the browser console, you might need to update `server/server.js` `cors()` config to explicitly allow your client domain:
    ```javascript
    app.use(cors({
        origin: ["https://win365-client.vercel.app", "http://localhost:5173"],
        credentials: true
    }));
    ```
    (You would commit and push this change to update the Server deployment).
