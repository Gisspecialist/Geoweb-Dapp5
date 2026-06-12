# GeoWeb3 OSM Map Rewards Integration

## Purpose

The OSM Rewards module expands GeoWeb3 beyond ArcGIS service registration. It allows users to submit public OpenStreetMap contributions for review and pilot GEOW rewards. This lets GeoWeb3 operate without sensitive ArcGIS infrastructure while still proving the core value: rewarding trusted geospatial contributions.

## Production workflow

```text
User logs in or connects wallet
→ User links OSM username
→ User submits OSM changeset ID
→ Backend retrieves/validates public changeset information
→ Backend scores geometry, tags, target-area match and duplicate risk
→ Admin or DAO reviews the claim
→ Reward is approved, rejected or returned for correction
→ GEOW reward is issued after approval
→ Claim is written to the registry and audit log
```

## Backend endpoints

```text
GET  /api/osm/user/:username
GET  /api/osm/changesets/:username
POST /api/osm/verify-changeset
POST /api/osm/rewards/submit
```

## Database tables to add

```sql
CREATE TABLE osm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  osm_username TEXT NOT NULL,
  osm_user_id TEXT,
  verification_status TEXT DEFAULT 'unverified',
  linked_at TIMESTAMP DEFAULT now()
);

CREATE TABLE osm_reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  osm_username TEXT NOT NULL,
  changeset_id TEXT NOT NULL,
  area TEXT,
  contribution_type TEXT,
  contribution_description TEXT,
  features_changed INTEGER,
  quality_score INTEGER,
  reward_amount NUMERIC,
  status TEXT DEFAULT 'pending_review',
  oracle_signature TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE osm_review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID,
  reviewer_id UUID,
  decision TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

## Quality checks

Every reward claim should be checked for:

```text
claimed OSM username matches changeset author
changeset is recent or within project window
features are inside target project area
geometry is valid
required tags are present
feature is not duplicated
changeset has not been reverted
no unresolved negative OSM comments
contribution is useful to project goals
```

## Anti-abuse controls

```text
one reward per changeset
rate limits by wallet, email, IP and OSM username
manual review for high-value claims
DAO review for disputed claims
duplicate feature detection
blacklist for repeated abuse
revert detection before final reward release
```

## Reward bands

```text
25 GEOW: small useful correction or cleanup
50 GEOW: medium quality mapped feature set
75 GEOW: high-quality contribution inside priority area
Manual amount: special DAO/admin-approved contribution
```

## Important production note

Do not automatically reward all OSM edits. Reward only reviewed, useful, non-duplicative and non-reverted contributions. The module should encourage better mapping, not spam.
