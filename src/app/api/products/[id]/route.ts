import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    const products = readLocalProducts();
    const product = products.find(p => p.id === id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ data: product });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (!supabaseAdmin) {
    const products = readLocalProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    products[idx] = { ...products[idx], ...body, updated_at: new Date().toISOString() };
    writeLocalProducts(products);
    return NextResponse.json({ data: products[idx] });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    const products = readLocalProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    products[idx] = { ...products[idx], status: 'archived', updated_at: new Date().toISOString() };
    writeLocalProducts(products);
    return NextResponse.json({ success: true });
  }

  const { error } = await supabaseAdmin
    .from('products')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
