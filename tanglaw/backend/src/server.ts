import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes";

/**
 * Entry point for the Tanglaw backend server.
 * Configures middleware, routes, and error handling,
 * then starts the Express HTTP listener.
 */

dotenv.config({ path: ".env.local" });

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_URL;

if (!frontendOrigin) {
  throw new Error("FRONTEND_URL environment variable is required");
}

// Strip trailing slash to avoid CORS origin mismatch (browser sends origin without /)
const corsOrigin = frontendOrigin.replace(/\/+$/, "");

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", apiRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Tanglaw backend is running." });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) {
    return;
  }
  res.status(500).json({ error: "Internal Server Error" });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});

export default app;
