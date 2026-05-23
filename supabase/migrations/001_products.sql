CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT DEFAULT '',
  theme            TEXT CHECK (theme IN ('coquette','minimal','aesthetic','dark','custom')),
  images           TEXT[] DEFAULT '{}',
  processed_images TEXT[] DEFAULT '{}',
  color_palette    TEXT[] DEFAULT '{}',
  image_status     TEXT DEFAULT 'pending' CHECK (image_status IN ('pending','processing','done','failed')),
  status           TEXT DEFAULT 'draft' CHECK (status IN ('draft','ready','archived')),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created ON products(created_at DESC);
