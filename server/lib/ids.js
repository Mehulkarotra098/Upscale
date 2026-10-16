// Database ids from untrusted input.

const MAX_DB_INT = 2147483647;

/** Positive Postgres INT id, or null. Out-of-range numbers would make the database reject the whole query. */
export function toDbId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= MAX_DB_INT ? n : null;
}
