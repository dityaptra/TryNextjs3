// app/api/sheet/route.js
import { NextResponse } from 'next/server';
import { sheets } from '@/lib/google'; // Menggunakan import alias default @/

// Fungsi untuk membaca data dari Sheet
export async function GET(request) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:B', // Sesuaikan dengan range data Anda
    });

    const values = response.data.values;
    return NextResponse.json({ values });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// Fungsi untuk menambah data ke Sheet
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'Missing name or message' }, { status: 400 });
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:B', // Sesuaikan range
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[name, message]], // Data baru sebagai array di dalam array
      },
    });

    return NextResponse.json({ success: true, response: response.data });
  } catch (error) {
    console.error('Error appending data:', error);
    return NextResponse.json({ error: 'Failed to append data' }, { status: 500 });
  }
}