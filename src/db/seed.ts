import "reflect-metadata";
import { AppDataSource } from "../server";
import { AdminUser } from "../models/AdminUser";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seedDatabase() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const adminRepository = AppDataSource.getRepository(AdminUser);

    // Check if admin already exists
    const existingAdmin = await adminRepository.findOne({
      where: { email: "admin@mouhamedev.sn" }
    });

    if (existingAdmin) {
      console.log("⚠️  Admin account already exists!");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
    } else {
      // Get password from environment or use default for development only
      const password = process.env.ADMIN_PASSWORD || "Change_Me_123!@#";
      const passwordHash = await bcrypt.hash(password, 10);

      // Create admin user
      const admin = adminRepository.create({
        email: "admin@mouhamedev.sn",
        passwordHash,
        role: "admin"
      });

      await adminRepository.save(admin);

      console.log("✅ Admin account created successfully!");
      console.log("");
      console.log("📋 Login credentials:");
      console.log(`   Email: admin@mouhamedev.sn`);
      console.log(`   Password: ${password}`);
      console.log("");
      console.log("🌐 Access admin dashboard: http://localhost:5174");
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedDatabase();
