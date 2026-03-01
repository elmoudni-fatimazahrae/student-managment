async function start() {
  const { default: EmbeddedPostgres } = await import("embedded-postgres");

  const pg = new EmbeddedPostgres({
    databaseDir: "./pg-data",
    user: "postgres",
    password: "postgres",
    port: 5433,
    persistent: true,
  });
  try {
    console.log("Starting embedded PostgreSQL server...");
    await pg.initialise();
    await pg.start();
    console.log("PostgreSQL server started on port 5433");
    console.log("Connection: postgresql://postgres:postgres@localhost:5433/postgres");
    console.log("Press Ctrl+C to stop");
    
    // Create the database
    await pg.createDatabase("student_management");
    console.log("Database 'student_management' created");
    console.log("Use: postgresql://postgres:postgres@localhost:5433/student_management");
  } catch (error) {
    if (error.message && error.message.includes("already")) {
      console.log("PostgreSQL server is already running on port 5433");
      console.log("Use: postgresql://postgres:postgres@localhost:5433/student_management");
    } else {
      console.error("Error:", error.message || error);
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nStopping PostgreSQL server...");
  process.exit(0);
});

start();
