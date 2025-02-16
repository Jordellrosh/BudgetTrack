const { Pool } = require("pg");

// Hardcoded Database Credentials (Modify These!)
const DATABASE_URL = "postgresql://postgres.gwtgobknjyujlfolrxol:jordell101@aws-0-us-east-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase/PostgreSQL SSL connections
  },
});

// Debugging: Test database connection
pool.connect()
  .then(client => {
    console.log("✅ Database connected successfully.");
    client.release(); // Release client immediately
  })
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1); // Exit process on failure
  });

module.exports = pool;
