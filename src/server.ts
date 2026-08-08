import "reflect-metadata";
import express from "express";
import cors from "cors";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

// Load environment variables
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

// ⚠️ SECURITY: Validate critical environment variables
const validateSecurityConfig = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const jwtSecret = process.env.JWT_SECRET;

  // In production, JWT_SECRET MUST be set and strong
  if (nodeEnv === "production") {
    if (!jwtSecret) {
      console.error("❌ CRITICAL: JWT_SECRET is not set in production!");
      console.error("Set a strong JWT_SECRET in your .env file (min 32 chars)");
      process.exit(1);
    }
    if (jwtSecret.length < 32) {
      console.error("❌ CRITICAL: JWT_SECRET is too short! Use at least 32 characters.");
      console.error("Generate with: openssl rand -hex 32");
      process.exit(1);
    }
  } else {
    // In development, generate a temporary secret if missing
    if (!jwtSecret) {
      const tempSecret = crypto.randomBytes(32).toString("hex");
      process.env.JWT_SECRET = tempSecret;
      console.warn("⚠️  WARNING: Using temporary JWT_SECRET in development.");
      console.warn("   For persistence, add to .env: JWT_SECRET=" + tempSecret);
    }
  }
};

validateSecurityConfig();

// Import routes
import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
// NOTE: paths differ between dev (ts-node reads .ts source) and prod
// (compiled output in dist/, running via `node dist/server.js`)
export const AppDataSource = new DataSource({
  type: "postgres",
  // Prefer a single DATABASE_URL if provided (Render gives you this),
  // otherwise fall back to individual host/port/user/pass vars.
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "mouhamed_vj",
      }),
  ssl: isProd ? { rejectUnauthorized: false } : false,
  synchronize: true,
  logging: false,
  entities: [isProd ? "dist/models/**/*.js" : "src/models/**/*.ts"],
  migrations: [isProd ? "dist/db/migrations/**/*.js" : "src/db/migrations/**/*.ts"],
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://vj-sable.vercel.app",
    "https://mouhamed-iota.vercel.app",
  ],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log("✓ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });