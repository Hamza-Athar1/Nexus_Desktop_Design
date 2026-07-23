import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { testConnection } from './config/db.js';

const PORT = process.env.PORT || 5000;

testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Could not connect to MySQL. Check server/.env and that the');
    console.error('   nexus_desktop schema has been applied in MySQL Workbench.');
    console.error(err.message);
    process.exit(1);
  });

  // Graceful shutdown