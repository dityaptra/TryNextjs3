// app/api/products/route.js
import { NextResponse } from 'next/server';
import { sheets } from '@/lib/google'; // Kita hanya perlu 'sheets'
import { v4 as uuidv4 } from 'uuid';

// --- Fungsi GET: Untuk mengambil semua produk (A:D) ---
export async function GET(request) {
  try {
    // Ganti range menjadi A:D (id, name, price, createdAt)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'products!A:D', 
    });

    const values = response.data.values;
    if (!values || values.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Ubah array menjadi objek
    const products = values.slice(1).map((row) => ({ // slice(1) untuk skip header
      id: row[0],
      name: row[1],
      price: row[2],
      createdAt: row[3],
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching sheet data:', error.message);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// --- Fungsi POST: Untuk menambah produk (tanpa gambar) ---
export async function POST(request) {
  try {
    // 1. Baca data sebagai JSON, bukan FormData
    const body = await request.json();
    const { name, price } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 2. Siapkan data baru untuk Google Sheet
    const newId = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Hanya 4 kolom
    const newRow = [newId, name, price, createdAt];

    // 3. Simpan data baru ke Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'products!A:D', // Sesuaikan range menjadi A:D
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow],
      },
    });

    return NextResponse.json({ success: true, newProduct: newRow });
  } catch (error) {
    console.error('Error in POST /api/products:', error.message);
    return NextResponse.json({ error: 'Gagal memproses permintaan' }, { status: 500 });
  }
}