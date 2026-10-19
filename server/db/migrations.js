// Schema history. Each entry runs once, in order, inside the migration transaction (see client.js).
// Never edit a migration that has shipped; add a new one. `search_path` is already set to the app schema.

export const MIGRATIONS = [
  {
    name: 'v1 baseline: users, media, categories, posts, redirects, revisions, views',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner','editor')),
        bio TEXT NOT NULL DEFAULT '',
        job_title TEXT NOT NULL DEFAULT '',
        avatar_media_id INT,
        token_version INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS login_attempts (
        id BIGSERIAL PRIMARY KEY, key TEXT NOT NULL, at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS login_attempts_key_at ON login_attempts (key, at);
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        mime TEXT NOT NULL DEFAULT 'image/webp',
        width INT NOT NULL, height INT NOT NULL,
        bytes BYTEA NOT NULL,
        bytes_sm BYTEA,
        sm_width INT,
        alt TEXT NOT NULL DEFAULT '',
        caption TEXT NOT NULL DEFAULT '',
        size INT NOT NULL DEFAULT 0,
        uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        seo_title TEXT NOT NULL DEFAULT '',
        seo_description TEXT NOT NULL DEFAULT '',
        service_slug TEXT NOT NULL DEFAULT '',
        sort INT NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL DEFAULT '',
        excerpt TEXT NOT NULL DEFAULT '',
        content_json JSONB,
        content_html TEXT NOT NULL DEFAULT '',
        toc JSONB NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
        published_at TIMESTAMPTZ,
        author_id INT REFERENCES users(id) ON DELETE SET NULL,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        tags TEXT[] NOT NULL DEFAULT '{}',
        cover_media_id INT REFERENCES media(id) ON DELETE SET NULL,
        seo_title TEXT NOT NULL DEFAULT '',
        seo_description TEXT NOT NULL DEFAULT '',
        focus_keyword TEXT NOT NULL DEFAULT '',
        canonical_url TEXT NOT NULL DEFAULT '',
        noindex BOOLEAN NOT NULL DEFAULT false,
        faq JSONB NOT NULL DEFAULT '[]',
        service_slug TEXT NOT NULL DEFAULT '',
        word_count INT NOT NULL DEFAULT 0,
        reading_minutes INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        content_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS posts_live ON posts (status, published_at DESC);
      CREATE INDEX IF NOT EXISTS posts_category ON posts (category_id);
      CREATE TABLE IF NOT EXISTS post_redirects (
        slug TEXT PRIMARY KEY, post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS post_revisions (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        content_json JSONB,
        saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS post_revisions_post ON post_revisions (post_id, saved_at DESC);
      CREATE TABLE IF NOT EXISTS post_views (
        post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        day DATE NOT NULL,
        n INT NOT NULL DEFAULT 0,
        PRIMARY KEY (post_id, day)
      );
      -- Defence in depth on Supabase: if this schema were ever exposed through the Data API, the anon and
      -- authenticated roles get nothing (RLS on, no policies). The app connects as the table owner, which RLS skips.
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE media ENABLE ROW LEVEL SECURITY;
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE post_redirects ENABLE ROW LEVEL SECURITY;
      ALTER TABLE post_revisions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;`,
  },
  {
    name: 'v2: post_media index of images per post, structured login_failures, missing indexes and keys',
    sql: `
      -- Which images each post uses. Replaces LIKE scans over article HTML for "used in" counts and delete checks.
      CREATE TABLE post_media (
        post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        media_id INT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, media_id)
      );
      CREATE INDEX post_media_media ON post_media (media_id);
      ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
      INSERT INTO post_media (post_id, media_id)
        SELECT DISTINCT p.id, ref.id
        FROM posts p
        CROSS JOIN LATERAL (SELECT (m[1])::int AS id FROM regexp_matches(p.content_html, '/media/([0-9]+)-', 'g') AS m) ref
        WHERE EXISTS (SELECT 1 FROM media WHERE media.id = ref.id)
        ON CONFLICT DO NOTHING;

      -- Failed sign-ins with separate columns, so per-IP and per-account checks use indexes.
      DROP TABLE login_attempts;
      CREATE TABLE login_failures (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        ip TEXT NOT NULL,
        at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX login_failures_ip_at ON login_failures (ip, at);
      CREATE INDEX login_failures_account ON login_failures (email, ip, at);
      ALTER TABLE login_failures ENABLE ROW LEVEL SECURITY;

      CREATE INDEX posts_updated ON posts (updated_at DESC);
      CREATE INDEX posts_author ON posts (author_id);
      CREATE INDEX media_created ON media (created_at DESC);

      UPDATE users SET avatar_media_id = NULL WHERE avatar_media_id IS NOT NULL
        AND avatar_media_id NOT IN (SELECT id FROM media);
      ALTER TABLE users ADD CONSTRAINT users_avatar_media_fk
        FOREIGN KEY (avatar_media_id) REFERENCES media(id) ON DELETE SET NULL;`,
  },
  {
    name: 'posts.indexnow_at: when IndexNow was last told about a post',
    sql: `ALTER TABLE posts ADD COLUMN IF NOT EXISTS indexnow_at TIMESTAMPTZ;`,
  },
  {
    name: 'site_pages: content date of each static page IndexNow was last told about',
    sql: `
      CREATE TABLE IF NOT EXISTS site_pages (
        url TEXT PRIMARY KEY,
        lastmod DATE NOT NULL,
        pinged_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;`,
  },
];
