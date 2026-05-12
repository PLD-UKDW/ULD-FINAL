"use client";
import api, { API_BASE } from "@/lib/api";
import { getAuthToken } from "@/lib/auth.client";
import { useCallback, useEffect, useState } from "react";

type JenisOption = { id: number; jenis: string };
type KategoriItem = {
    id: number;
    kategori: string;
    jenis_disabilitas_id: number | null;
    jenisDisabilitas?: { id: number; jenis: string } | null;
};

export default function KategoriDisabilitasPage() {
    const [token, setToken] = useState<string | null>(null);
    const [jenisOptions, setJenisOptions] = useState<JenisOption[]>([]);
    const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);
    const [newKategori, setNewKategori] = useState<{ kategori: string; jenisId: number | "" }>({ kategori: "", jenisId: "" });
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editKategori, setEditKategori] = useState("");
    const [editJenisId, setEditJenisId] = useState<number | "">("");
    const [updating, setUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    useEffect(() => {
        setToken(getAuthToken());
    }, []);

    const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchJenis = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api.get("/mahasiswa/jenis-disabilitas", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setJenisOptions(res.data || []);
        } catch {
            addToast("Gagal memuat jenis disabilitas", "error");
        }
    }, [token]);

    const fetchKategori = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api.get("/mahasiswa/kategori-disabilitas", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setKategoriList(res.data || []);
        } catch {
            addToast("Gagal memuat kategori", "error");
        }
    }, [token]);

    useEffect(() => {
        fetchJenis();
        fetchKategori();
    }, [fetchJenis, fetchKategori]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            addToast("Token tidak ada / belum login", "error");
            return;
        }
        if (!newKategori.kategori || !newKategori.jenisId) {
            addToast("Isi nama kategori dan pilih jenis", "error");
            return;
        }
        setSaving(true);
        try {
                const res = await fetch(`${API_BASE}/api/mahasiswa/kategori-disabilitas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    kategori: newKategori.kategori,
                    jenis_id: newKategori.jenisId,
                }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                addToast(body?.message || "Gagal menambah kategori", "error");
                return;
            }
            addToast(body?.message || "Kategori ditambahkan", "success");
            setNewKategori({ kategori: "", jenisId: "" });
            fetchKategori();
        } catch {
            addToast("Error saat menambah kategori", "error");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (item: KategoriItem) => {
        setEditingId(item.id);
        setEditKategori(item.kategori);
        setEditJenisId(item.jenis_disabilitas_id || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditKategori("");
        setEditJenisId("");
    };

    const handleUpdate = async (id: number) => {
        if (!token) {
            addToast("Token tidak ada / belum login", "error");
            return;
        }
        if (!editKategori.trim() || !editJenisId) {
            addToast("Nama kategori dan jenis wajib diisi", "error");
            return;
        }

        setUpdating(true);
        try {
                const res = await fetch(`${API_BASE}/api/mahasiswa/kategori-disabilitas/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ kategori: editKategori.trim(), jenis_id: editJenisId }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                addToast(body?.message || "Gagal update kategori", "error");
                return;
            }

            addToast(body?.message || "Kategori berhasil diupdate", "success");
            cancelEdit();
            fetchKategori();
        } catch {
            addToast("Error saat update kategori", "error");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!token) {
            addToast("Token tidak ada / belum login", "error");
            return;
        }

        const yes = window.confirm("Yakin ingin menghapus kategori ini?");
        if (!yes) return;

        setDeletingId(id);
        try {
            const res = await fetch(`${API_BASE}/api/mahasiswa/kategori-disabilitas/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                addToast(body?.message || "Gagal menghapus kategori", "error");
                return;
            }

            addToast(body?.message || "Kategori berhasil dihapus", "success");
            if (editingId === id) {
                cancelEdit();
            }
            fetchKategori();
        } catch {
            addToast("Error saat menghapus kategori", "error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto text-black">
            <h1 className="text-2xl font-bold mb-4">Kategori Disabilitas</h1>

            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-3">Tambah Kategori Baru</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                        <label className="block text-sm font-medium">Nama Kategori</label>
                        <input
                            value={newKategori.kategori}
                            onChange={(e) => setNewKategori({ ...newKategori, kategori: e.target.value })}
                            className="mt-1 block w-full border rounded p-2"
                            placeholder="contoh: Tuli"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Jenis Disabilitas</label>
                        <select
                            value={newKategori.jenisId}
                            onChange={(e) => setNewKategori({ ...newKategori, jenisId: e.target.value ? Number(e.target.value) : "" })}
                            className="mt-1 block w-full border rounded p-2"
                        >
                            <option value="">-- pilih jenis --</option>
                            {jenisOptions.map((j) => (
                                <option key={j.id} value={j.id}>{j.jenis}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded shadow"
                        >
                            {saving ? "Menyimpan..." : "Tambah"}
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Kategori baru otomatis bisa dipilih di form mahasiswa.</p>
            </form>

            <div className="bg-white p-5 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-3">Daftar Kategori</h2>
                {kategoriList.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada kategori.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="px-3 py-2">Kategori</th>
                                    <th className="px-3 py-2">Jenis</th>
                                    <th className="px-3 py-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kategoriList.map((item) => {
                                    const isEditing = editingId === item.id;
                                    return (
                                        <tr key={item.id} className="border-t">
                                            <td className="px-3 py-2">
                                                {isEditing ? (
                                                    <input
                                                        value={editKategori}
                                                        onChange={(e) => setEditKategori(e.target.value)}
                                                        className="w-full border rounded p-2"
                                                    />
                                                ) : (
                                                    item.kategori
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                {isEditing ? (
                                                    <select
                                                        value={editJenisId}
                                                        onChange={(e) => setEditJenisId(e.target.value ? Number(e.target.value) : "")}
                                                        className="w-full border rounded p-2"
                                                    >
                                                        <option value="">-- pilih jenis --</option>
                                                        {jenisOptions.map((j) => (
                                                            <option key={j.id} value={j.id}>{j.jenis}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    item.jenisDisabilitas?.jenis || "-"
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdate(item.id)}
                                                                disabled={updating}
                                                                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-60"
                                                            >
                                                                {updating ? "Menyimpan..." : "Simpan"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={cancelEdit}
                                                                className="rounded border px-3 py-1 hover:bg-gray-100"
                                                            >
                                                                Batal
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => startEdit(item)}
                                                                className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                                            >
                                                                Update
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(item.id)}
                                                                disabled={deletingId === item.id}
                                                                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-60"
                                                            >
                                                                {deletingId === item.id ? "Menghapus..." : "Delete"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {toast && (
                <div
                    className={`fixed right-4 bottom-4 px-4 py-2 rounded shadow text-white ${
                        toast.type === "error" ? "bg-red-500" : toast.type === "success" ? "bg-green-600" : "bg-gray-700"
                    }`}
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
}
