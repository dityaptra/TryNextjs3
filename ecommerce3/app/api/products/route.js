// app/api/products/route.js
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

/* ===============================
   Cloudinary
================================ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ===============================
   Google Sheets Setup
================================ */
let credentials;

try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
} catch (err) {
  console.error("❌ GOOGLE_SERVICE_ACCOUNT_KEY invalid:", err);
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

/* ===============================
   GET Products
================================ */
export async function GET() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "products!A:E",
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return NextResponse.json({ products: [] });
    }

    const products = rows.slice(1).map(r => ({
      id: r[0] ?? "",
      name: r[1] ?? "",
      price: r[2] ?? "",
      img: r[3] ?? "",
      createdAt: r[4] ?? "",
    }));

    return NextResponse.json({ products });
  } catch (err) {
    console.error("❌ GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/* ===============================
   POST Product
================================ */
export async function POST(req) {
  try {
    const form = await req.formData();

    const name = form.get("name");
    const price = form.get("price");
    const file = form.get("image");

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name & price wajib diisi" },
        { status: 400 }
      );
    }

    /* Upload Cloudinary */
    let imageUrl = "";

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString("base64")}`,
        {
          folder: "next-products",
        }
      );

      imageUrl = uploadResult.secure_url;
    }

    /* Tambah ke Sheets */
    const newRow = [
      uuidv4(),
      name,
      price,
      imageUrl,
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "products!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRow],
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: newRow[0],
        name,
        price,
        img: imageUrl,
        createdAt: newRow[4],
      },
    });
  } catch (err) {
    console.error("❌ POST ERROR:", err);
    return NextResponse.json(
      { error: "Failed to save product", detail: err.message },
      { status: 500 }
    );
  }
}
