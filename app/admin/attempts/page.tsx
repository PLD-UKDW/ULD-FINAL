"use client";

import { API_BASE } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

type Attempt = {
	id: number;
	user?: { id: number; name: string };
	test?: { id: number; title: string };
	score?: number | null;
};

export default function Attempts() {
	const [attempts, setAttempts] = useState<Attempt[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			try {
				const res = await fetch(`${API_BASE}/api/admin/attempts`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				setAttempts(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error("load attempts error:", err);
			} finally {
				setLoading(false);
			}
		}

		load();
	}, []);

	if (loading) return <div className="p-6">Loading attempts...</div>;

	return (
		<div className="p-6">
			<h1 className="mb-4 text-xl font-bold">Daftar Attempts</h1>
			{attempts.length === 0 && <p className="text-gray-500">Belum ada attempt.</p>}
			<div className="space-y-2">
				{attempts.map((attempt) => (
					<Link key={attempt.id} href={`/admin/attempts/${attempt.id}`} className="block rounded border p-4 hover:bg-gray-50">
						<p className="font-bold">{attempt.user?.name}</p>
						<p className="text-sm">{attempt.test?.title}</p>
						<p className="text-sm text-gray-600">Score: {attempt.score ?? "Belum dinilai"}</p>
					</Link>
				))}
			</div>
		</div>
	);
}