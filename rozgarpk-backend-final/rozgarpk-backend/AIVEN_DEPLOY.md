# RozgarPK: Aiven + Vercel Deployment

## Important

- Rotate the Aiven PostgreSQL password before use. It appeared in a shared screenshot.
- Aiven PostgreSQL Free is limited to 1 GB. Aiven Runtime hosts the backend and currently starts around $7/month; creating the Runtime app can incur charges.
- The backend and frontend folders currently have no Git repository configured. Push each project to GitHub before importing it into Aiven Runtime or Vercel.
- Never commit `.env` or paste `DATABASE_URL`, passwords, or JWT secrets into chat.

## 1. Import existing data into Aiven

From `rozgarpk-backend`, copy `.env.example` to `.env` and enter the rotated Aiven service URI as `DATABASE_URL`. The URI should include `sslmode=require`. `.env` is ignored by Git.

Run the one-time schema setup and JSON data import:

```powershell
npm install
npm run db:migrate-json
```

The migration imports users, worker profiles, jobs, chat rooms, and messages while preserving their IDs. It creates an `app_migrations` marker and will refuse to overwrite data if run again. Keep the original JSON store until you have verified the data in Aiven.

## 2. Deploy the backend to Aiven Runtime

1. Push the backend project to a GitHub repository.
2. In Aiven, choose **Runtime → Deploy application** and connect that repository. The included `Dockerfile` builds and starts the API.
3. Integrate the `rozgarpk-1508` PostgreSQL service with the Runtime app. Confirm its connection variable is `DATABASE_URL`.
4. Add these Runtime variables/secrets:
   - `JWT_ACCESS_SECRET`: a long, randomly generated secret
   - `JWT_ACCESS_EXPIRES`: `15m`
   - `CLIENT_URL`: the exact Vercel production origin, e.g. `https://your-site.vercel.app`
   - `PORT`: `5000`
5. Expose HTTP port `5000` in Aiven Runtime. After deployment, verify `<runtime-url>/health` reports `database: connected`.

## 3. Deploy the frontend to Vercel

1. Push the frontend project to GitHub and import it into Vercel.
2. Set the Vercel project root to the directory containing the frontend `package.json`.
3. Set these Vercel environment variables:
   - `VITE_API_URL`: `https://<runtime-url>/api`
   - `VITE_SOCKET_URL`: `https://<runtime-url>`
   - `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_PRESET` only if photo upload is configured
4. Deploy, copy the production origin, and set that exact value as `CLIENT_URL` in Aiven Runtime. Redeploy the backend after changing it.

## 4. Verify

Register a new client and worker, create a worker profile, post a job, start a conversation, and send a message. Check that both accounts and records remain after a backend redeploy. Vercel Hobby is intended for personal/non-commercial use; Aiven Runtime is not free.
