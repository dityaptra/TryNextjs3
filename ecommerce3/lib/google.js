// lib/google.js
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Konfigurasi autentikasi
const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ganti kembali \\n menjadi \n
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets', // Untuk Google Sheets
    'https://www.googleapis.com/auth/drive', // Untuk Google Drive
  ],
});

// Inisialisasi klien API
export const sheets = google.sheets({ version: 'v4', auth });
export const drive = google.drive({ version: 'v3', auth });