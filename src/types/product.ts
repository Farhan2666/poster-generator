export interface Product {
  id: string;
  title: string;
  description: string;
  theme: 'coquette' | 'minimal' | 'aesthetic' | 'dark' | 'custom';
  images: string[];
  processed_images: string[];
  color_palette: string[];
  image_status: 'pending' | 'processing' | 'done' | 'failed';
  status: 'draft' | 'ready' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  theme?: Product['theme'];
  images: string[];
}
