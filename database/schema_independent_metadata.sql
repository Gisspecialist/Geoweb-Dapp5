CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metadata_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT,
  steward TEXT NOT NULL,
  contact TEXT,
  license TEXT,
  bbox JSONB,
  spatial_reference TEXT,
  update_frequency TEXT,
  tags TEXT[],
  evidence TEXT,
  metadata_mode TEXT DEFAULT 'Independent / Non-Esri',
  verification_status TEXT DEFAULT 'user_declared',
  quality_score INTEGER DEFAULT 0,
  ipfs_uri TEXT,
  metadata_hash TEXT,
  tx_hash TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metadata_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata_record_id UUID REFERENCES metadata_records(id),
  version_number INTEGER NOT NULL,
  metadata_json JSONB NOT NULL,
  ipfs_uri TEXT,
  tx_hash TEXT,
  change_note TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata_record_id UUID REFERENCES metadata_records(id),
  reviewer_user_id UUID REFERENCES users(id),
  review_type TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS osm_reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  osm_username TEXT NOT NULL,
  changeset_id TEXT NOT NULL,
  target_area TEXT,
  contribution_type TEXT,
  features_changed INTEGER,
  quality_score INTEGER,
  reward_amount NUMERIC,
  status TEXT DEFAULT 'pending_admin_or_dao_review',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contribution_faucet_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  metadata_record_id UUID REFERENCES metadata_records(id),
  claimant TEXT NOT NULL,
  proof TEXT,
  payout_reference TEXT,
  reward_amount NUMERIC,
  status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metadata_records_source_type ON metadata_records(source_type);
CREATE INDEX IF NOT EXISTS idx_metadata_records_status ON metadata_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_metadata_records_hash ON metadata_records(metadata_hash);
