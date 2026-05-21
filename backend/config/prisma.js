const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// Use a fallback URL if DATABASE_URL is not set (e.g. during some test environments)
const connectionString = process.env.DATABASE_URL || "postgresql://shreyasharma@localhost:5432/climbup?schema=public";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
