import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const PRODUCTS_FILE = path.join(process.cwd(), 'tmp', 'products.json');

function readLocalProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

function writeLocalProducts(products: any[]): void {
  fs.mkdirSync(path.dirname(PRODUCTS_FILE), { recursive: true });
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    const products = readLocalProducts();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ready';
    const filtered = products.filter(p => p.status === status)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json({ data: filtered });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'ready';
  const theme = searchParams.get('theme');
  const sort = searchParams.get('sort') || 'created_at';

  let query = supabaseAdmin
    .from('products')
    .select('*')
    .eq('status', status)
    .order(sort, { ascending: false });

  if (theme) {
    query = query.eq('theme', theme);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, theme, images } = body;

    if (!title) {
      return NextResponse.json({ error: 'title required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      const products = readLocalProducts();
      const product = {
        id: crypto.randomUUID(),
        title,
        description: description || '',
        theme: theme || 'aesthetic',
        images: images || [],
        processed_images: [],
        color_palette: [],
        image_status: 'pending',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      products.push(product);
      writeLocalProducts(products);
      return NextResponse.json({ data: product }, { status: 201 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        title,
        description: description || '',
        theme: theme || 'aesthetic',
        images: images || [],
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
