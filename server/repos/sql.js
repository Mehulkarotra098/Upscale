// SQL fragments shared by repositories.

/** A post visitors can see: published, and its publish time has passed (future dates are scheduled). */
export const LIVE = `p.status = 'published' AND p.published_at <= now()`;

/** ILIKE pattern that matches `term` literally anywhere (escapes %, _ and \). */
export const contains = (term) => `%${String(term).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
