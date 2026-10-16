// SQL fragments shared by repositories.

/** A post visitors can see: published, and its publish time has passed (future dates are scheduled). */
export const LIVE = `p.status = 'published' AND p.published_at <= now()`;

/** Today's date in India, where readers and the team are (the database clock is UTC). */
export const TODAY = `(now() AT TIME ZONE 'Asia/Kolkata')::date`;

/** ILIKE pattern that matches `term` literally anywhere (escapes %, _ and \). */
export const contains = (term) => `%${String(term).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
