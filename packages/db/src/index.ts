export { createDbClient, dbHealth, getDbSingleton, resetDbSingleton, type DbClient } from './client.js';
export { MIGRATION_SQL } from './migrations.js';
export { ensureMigrated } from './migrate.js';
export { encryptAesGcm, decryptAesGcm, parseKey, sha256, hashIdCard } from './crypto.js';
