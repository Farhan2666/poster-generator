export interface Template {
  id: string;
  name: string;
  slug: string;
  preview_url: string;
  room_type: string;
  background_url: string;
  scene_duration: number;
  product_position: { x: number; y: number; z: number; scale: number; rotation: number };
  camera_angle: string;
  lighting_preset: string;
  color_palette: string[];
  font_pair: { heading: string; body: string };
  subtitle_style: {
    position: string;
    size: number;
    color: string;
    stroke: string;
    align: string;
  };
  transition: 'fade' | 'slide' | 'zoom' | 'none';
  is_active: boolean;
  created_at: string;
}
