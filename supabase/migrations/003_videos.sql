CREATE TABLE videos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  template_id     UUID REFERENCES templates(id) ON DELETE SET NULL,
  variation       TEXT CHECK (variation IN ('hard_selling','soft_selling','aesthetic')),
  script          JSONB,
  scene_assets    JSONB,
  voice_url       TEXT,
  music_url       TEXT,
  output_url      TEXT,
  duration_sec    INT,
  status          TEXT DEFAULT 'queued' CHECK (status IN ('queued','processing','preview','done','failed')),
  progress        INT DEFAULT 0,
  error_log       TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_videos_product ON videos(product_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created ON videos(created_at DESC);

CREATE TABLE render_queue (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id    UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed')),
  priority    INT DEFAULT 0,
  started_at  TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_log   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
