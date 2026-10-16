// Structured logs: one JSON line per event, so Vercel's log search can filter by tag, level or any field.

function write(level, tag, msg, fields) {
  const line = { level, tag, msg, ...fields };
  if (fields?.err instanceof Error)
    line.err = { name: fields.err.name, message: fields.err.message, code: fields.err.code, stack: fields.err.stack };
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(JSON.stringify(line));
}

export const log = {
  info: (tag, msg, fields) => write('info', tag, msg, fields),
  warn: (tag, msg, fields) => write('warn', tag, msg, fields),
  error: (tag, msg, fields) => write('error', tag, msg, fields),
};
