/**
 * 建表 SQL（dev 用 pglite 直接执行；生产由 prisma migrate 接管）。
 * 15 张表的最小可用结构；索引与分区留待 Phase 1b 补齐。
 */

export const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS alumni_profile (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name_enc BYTEA NOT NULL,
  name_pinyin TEXT NOT NULL,
  id_card_enc BYTEA NOT NULL,
  id_card_hash BYTEA UNIQUE NOT NULL,
  phone_enc BYTEA NOT NULL,
  year INTEGER NOT NULL,
  college_id TEXT NOT NULL,
  dept_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alumni_application (
  id TEXT PRIMARY KEY,
  applicant_name TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id TEXT,
  reviewed_at TIMESTAMPTZ,
  evidence_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alumni_card (
  id TEXT PRIMARY KEY,
  alumni_id TEXT NOT NULL,
  card_no TEXT UNIQUE NOT NULL,
  qr_secret BYTEA NOT NULL,
  rotation_sec INTEGER NOT NULL DEFAULT 30,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS organization_node (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS organization_closure (
  ancestor TEXT NOT NULL,
  descendant TEXT NOT NULL,
  depth INTEGER NOT NULL,
  PRIMARY KEY (ancestor, descendant)
);

CREATE TABLE IF NOT EXISTS post (
  id TEXT PRIMARY KEY,
  org_node_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  visibility TEXT NOT NULL DEFAULT 'public',
  meta JSONB NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE post ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}';

ALTER TABLE post ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE post ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE post ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  template_id TEXT,
  dsl JSONB NOT NULL DEFAULT '{}',
  quota INTEGER NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  creator_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_enrollment (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  alumni_id TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  qr_ticket TEXT NOT NULL,
  check_in_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'enrolled',
  UNIQUE (activity_id, alumni_id)
);

CREATE TABLE IF NOT EXISTS reservation (
  id TEXT PRIMARY KEY,
  alumni_id TEXT NOT NULL,
  service_type TEXT NOT NULL,
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  companions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  qr_ticket TEXT NOT NULL,
  UNIQUE (service_type, slot_date, slot_time, alumni_id)
);

CREATE TABLE IF NOT EXISTS donation_order (
  id TEXT PRIMARY KEY,
  alumni_id TEXT,
  amount_cents BIGINT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'init',
  out_trade_no TEXT UNIQUE NOT NULL,
  paid_at TIMESTAMPTZ,
  message TEXT,
  anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donation_wall_entry (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS etl_job (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  stats JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS etl_staging (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  raw JSONB NOT NULL,
  normalized JSONB,
  error_code TEXT,
  dedupe_key TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_page (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  dsl JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  UNIQUE (slug, version)
);

CREATE TABLE IF NOT EXISTS portal_template (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  dsl JSONB NOT NULL DEFAULT '{}',
  builtin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  ip TEXT,
  ua TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  target TEXT NOT NULL,
  template TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
