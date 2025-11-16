// app/page.js
'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk form (tanpa 'file')
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- Fungsi untuk mengambil data produk ---
  const fetchData = async () => {
    setLoading(true);
    setError(null); // Reset error setiap kali fetch
    try {
      const res = await fetch('/api/products'); 
      if (!res.ok) {
        throw new Error('Gagal mengambil data produk');
      }
      const result = await res.json();
      setProducts(result.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Fungsi untuk submit form (mengirim JSON) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setError('Nama dan harga wajib diisi');
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Kirim sebagai JSON
        },
        body: JSON.stringify({ name, price }), // Kirim data JSON
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan produk');
      }

      // Berhasil, reset form dan muat ulang data
      setName('');
      setPrice('');
      await fetchData(); // Muat ulang data
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Project Fullstack Products
      </h1>

      {/* --- Form Input --- */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4">Tambah Produk Baru</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Nama Produk
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
            Harga
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Input file dihapus dari sini */}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-300 disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </form>

      {/* --- Tampilan Data Produk --- */}
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Daftar Produk</h2>
        {loading && <p>Loading data...</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                {/* Kolom Gambar dihapus */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                  {/* Kolom Link Gambar dihapus */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && products.length === 0 && (
          <p className="text-center text-gray-500 mt-4">Belum ada produk.</p>
        )}
      </div>
    </main>
  );
}