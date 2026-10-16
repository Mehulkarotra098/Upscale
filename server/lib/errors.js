// One error type for every expected failure. `expose` errors carry a message that is safe to show the user;
// anything else becomes a generic 500 and is logged.

export class HttpError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} message user-facing message
   * @param {{ code?: string }} [opts]
   */
  constructor(status, message, { code } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.expose = true;
  }
}

export const badRequest = (msg) => new HttpError(400, msg);
export const unauthorized = (msg = 'Please sign in') => new HttpError(401, msg);
export const forbidden = (msg = 'You do not have permission to do that') => new HttpError(403, msg);
export const notFound = (msg = 'Not found') => new HttpError(404, msg);
export const conflict = (msg) => new HttpError(409, msg);
export const tooLarge = (msg = 'Request is too large') => new HttpError(413, msg);
export const tooMany = (msg) => new HttpError(429, msg);
export const unavailable = (msg, code) => new HttpError(503, msg, { code });

/** Status + safe message for any thrown value. */
export function describe(err) {
  if (err instanceof HttpError) return { status: err.status, message: err.message };
  // Postgres constraint errors from requests that raced each other or point at something just deleted
  if (err?.code === '23505')
    return { status: 409, message: 'That is already taken (someone may have just saved the same thing). Try again.' };
  if (err?.code === '23503') return { status: 400, message: 'Something this refers to no longer exists. Reload and try again.' };
  return { status: 500, message: 'Something went wrong. Try again.' };
}
