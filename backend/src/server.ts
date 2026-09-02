import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes";

/**
 * Entry point for the Tanglaw backend server.
 * Configures middleware, routes, and error handling,
 * then starts the Express HTTP listener.
 */

for (const file of [".env.local", ".env"]) {
  dotenv.config({ path: file });
}

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_URL ?? "http://localhost:3000";

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
  if (err && typeof err === "object" && "type" in err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON request body." });
  }
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
