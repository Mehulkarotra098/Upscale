// Loaded with `node --import` before integration tests. Points the app at a disposable schema in the test database,
// so tests never touch real data and test files can run in parallel.
const url = process.env.TEST_DATABASE_URL;
if (!url) {
  console.error('Integration tests need TEST_DATABASE_URL (a Postgres you can create schemas in). See README → Tests.');
  process.exit(1);
}

process.env.DATABASE_URL = url;
process.env.DB_SCHEMA = `test_${process.pid}_${Date.now().toString(36)}`;
process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-hmac-0123456789';
process.env.ADMIN_EMAIL = 'owner@example.com';
process.env.ADMIN_PASSWORD = 'owner-password-123';
process.env.ADMIN_NAME = 'Test Owner';
process.env.SITE_URL = 'https://uscale.test';
process.env.SITE_INDEXABLE = '1';
delete process.env.VERCEL;
delete process.env.VERCEL_ENV;
delete process.env.INDEXNOW_KEY;
delete process.env.CRON_SECRET;
