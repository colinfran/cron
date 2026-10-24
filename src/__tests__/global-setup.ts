import pg from "pg";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "******localhost:5432/cronpulse_test";

export async function setup() {
  const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();

  await client.query(`
    DO $$ BEGIN
      CREATE TYPE alert_channel_type AS ENUM ('email', 'slack', 'discord', 'telegram', 'webhook');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE scheduled_job_status AS ENUM ('active', 'paused');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE scheduled_job_type AS ENUM ('http', 'reminder');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE run_status AS ENUM ('success', 'failed', 'timeout');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      name TEXT,
      email_verified TIMESTAMP,
      image TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS accounts (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alert_channels (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type alert_channel_type NOT NULL,
      config JSONB NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS scheduled_jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      status scheduled_job_status NOT NULL DEFAULT 'active',
      type scheduled_job_type NOT NULL DEFAULT 'http',
      schedule TEXT NOT NULL,
      http_url TEXT,
      http_method TEXT NOT NULL DEFAULT 'GET',
      http_headers JSONB,
      http_body TEXT,
      timeout_ms INTEGER NOT NULL DEFAULT 30000,
      last_run_at TIMESTAMP,
      next_run_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS scheduled_runs (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
      status run_status NOT NULL,
      response_code INTEGER,
      response_time_ms INTEGER,
      response_body TEXT,
      error_message TEXT,
      started_at TIMESTAMP NOT NULL,
      completed_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await client.end();
}
