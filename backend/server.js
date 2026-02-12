import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 5000;

// Track if server is ready (migrations complete)
let isReady = false;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on :${PORT}`);
  console.log(`✅ Health check available at http://localhost:${PORT}/health`);
  // Mark as ready after server starts (migrations should be done by now)
  setTimeout(() => {
    isReady = true;
    console.log(`✅ Server ready to accept requests`);
  }, 2000);
});

// Graceful shutdown handling for Railway
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});
