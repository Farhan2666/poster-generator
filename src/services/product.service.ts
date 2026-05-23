import { Product, CreateProductInput } from '@/types/product';

const BASE = '/api/products';

export class ProductService {
  async list(params?: { status?: string; theme?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.theme) query.set('theme', params.theme);

    const res = await fetch(`${BASE}?${query}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.data;
  }

  async getById(id: string): Promise<Product> {
    const res = await fetch(`${BASE}/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.data;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.data;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.data;
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error);
    }
  }
}

export const productService = new ProductService();
