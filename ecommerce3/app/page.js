"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price) {
      setError("Nama dan harga wajib diisi");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);

      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData, // ❗ PENTING — JANGAN pakai headers
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan produk");
      }

      // Reset form
      setName("");
      setPrice("");
      setImage(null);

      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Project Fullstack Products</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-8 shadow rounded"
      >
        <h2 className="text-2xl font-semibold mb-4">Tambah Produk Baru</h2>

        <div className="mb-4">
          <label className="block mb-1">Nama Produk</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Harga</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Gambar Produk</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full"
          />
        </div>

        <button
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {submitting ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </form>

      <div className="w-full max-w-4xl mt-8 bg-white shadow rounded p-8">
        <h2 className="text-xl font-semibold mb-4">Daftar Produk</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Harga</th>
                <th className="p-2 text-left">Gambar</th>
                <th className="p-2 text-left">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.price}</td>
                  <td className="p-2">
                    {p.img ? (
                      <img src={p.img} className="w-20 rounded" />
                    ) : (
                      "Tidak ada gambar"
                    )}
                  </td>
                  <td className="p-2">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
