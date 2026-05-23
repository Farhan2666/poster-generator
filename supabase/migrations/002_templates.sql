CREATE TABLE templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  preview_url      TEXT,
  room_type        TEXT NOT NULL,
  background_url   TEXT,
  scene_duration   INT DEFAULT 6,
  product_position JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0,"scale":1,"rotation":0}',
  camera_angle     TEXT DEFAULT 'front',
  lighting_preset  TEXT DEFAULT 'neutral',
  color_palette    TEXT[] DEFAULT '{}',
  font_pair        JSONB DEFAULT '{"heading":"Inter","body":"Inter"}',
  subtitle_style   JSONB DEFAULT '{"position":"bottom","size":48,"color":"#ffffff","stroke":"#000000","align":"center"}',
  transition       TEXT DEFAULT 'fade' CHECK (transition IN ('fade','slide','zoom','none')),
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

INSERT INTO templates (name, slug, room_type, color_palette) VALUES
  ('Coquette Pink Room', 'coquette-pink-room', 'pink_bedroom', ARRAY['#f8bbd0','#f06292','#ec407a']),
  ('Minimal Korea Room', 'minimal-korea-room', 'korea_minimal', ARRAY['#f5f5f5','#e0e0e0','#bdbdbd']),
  ('Pinterest Bedroom', 'pinterest-bedroom', 'pinterest_bedroom', ARRAY['#ffe0b2','#ffab91','#a5d6a7']),
  ('Study Desk Aesthetic', 'study-desk-aesthetic', 'study_desk', ARRAY['#d7ccc8','#a1887f','#8d6e63']),
  ('Warm Bedroom', 'warm-bedroom', 'warm_bedroom', ARRAY['#ffcc80','#ffb74d','#fff9c4']);
