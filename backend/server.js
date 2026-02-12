import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on :${PORT}`);
  console.log(`✅ Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown handling for Railway
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});
