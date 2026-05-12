"use client";

import { ArrowRight, Calendar, ChevronLeft, ChevronRight, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Berita = {
  id: number;
  title: string;
  desc: string;
  image: string;
  images: string[];
  date: string;
  author: string;
  category: string;
  content: string;
};

type BeritaCategory = {
  id: number;
  name: string;
};

function normalizeContent(html?: string) {
  if (!html) return "";
  let decoded = html;
  if (typeof window !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }
  decoded = decoded.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  decoded = decoded.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  decoded = decoded.replace(/<\s*br\s*\/?>(?=\s*\n?)/gi, "\n");
  decoded = decoded.replace(/<\/(p|div|section|article)>/gi, "\n");
  decoded = decoded.replace(/<[^>]+>/g, "");
  return decoded.replace(/\s+/g, " ").replace(/(\s*\n\s*)+/g, "\n").trim();
}

function formatIDDate(input?: string | Date | null) {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function buildImageUrl(content_images?: string) {
  if (!content_images) return "/berita/1.jpeg";
  const first = content_images.split(",").map((s) => s.trim()).filter(Boolean)[0];
  if (!first) return "/berita/1.jpeg";
  return `/uploads/berita/${first}`;
}

function buildImages(content_images?: string) {
  if (!content_images) return [] as string[];
  return content_images
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((file) => `/uploads/berita/${file}`);
}

function mapApiToBerita(item: unknown, categoryMap: Map<number, string>): Berita {
  const i = item as { id: number; title?: string; content?: string; content_images?: string; categoryId?: number | null; category?: { name?: string }; tanggal?: string; createdAt?: string };
  const categoryName = i?.category?.name ?? (i?.categoryId ? categoryMap.get(Number(i.categoryId)) : undefined) ?? "Umum";
  const tanggal = i?.tanggal ?? i?.createdAt;
  const images = buildImages(i?.content_images);
  const imageUrl = images[0] || buildImageUrl(i?.content_images);
  const content: string = i?.content ?? "";
  const normalized = normalizeContent(content);
  const desc = normalized.slice(0, 160) + (normalized.length > 160 ? "…" : "");
  return {
    id: Number(i?.id),
    title: String(i?.title ?? ""),
    desc,
    image: imageUrl,
    images,
    date: formatIDDate(tanggal),
    author: "Admin",
    category: categoryName,
    content,
  } as Berita;
}

function BeritaCarousel({ items, onSelectBerita }: { items: Berita[]; onSelectBerita: (berita: Berita) => void }) {
  const [current, setCurrent] = useState(0);
  const totalSlides = Math.max(1, Math.ceil(items.length / 3));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);

  const beritaSlice = items.slice(current * 3, current * 3 + 3);

  return (
    <div className="relative max-w-6xl mx-auto mb-12">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-0">
          {beritaSlice.map((berita) => (
            <article key={berita.id} className="flex flex-col h-full rounded-xl overflow-hidden bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105">
              <Image src={berita.image} alt={berita.title} width={800} height={480} className="w-full h-48 object-cover" />
              <div className="p-6 flex flex-col flex-1">
                <span className="bg-[#02a502] text-white px-2 py-1 rounded-full text-xs font-medium mb-2 w-fit">{berita.category}</span>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  {berita.date}
                </div>
                <h2 className="text-lg font-bold text-[#3e4095] mb-2 line-clamp-2">{berita.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3 flex-1">{berita.desc}</p>
                <button onClick={() => onSelectBerita(berita)} className="mt-auto bg-[#02a502] text-white py-2 px-4 rounded-lg hover:bg-[#008000] transition-colors flex items-center justify-center gap-2">
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
          {beritaSlice.length < 3 && Array.from({ length: 3 - beritaSlice.length }).map((_, idx) => <div key={idx} className="hidden md:block" />)}
        </div>
      </div>
      <button onClick={prevSlide} className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white shadow-lg w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10" aria-label="Berita sebelumnya">
        <ChevronLeft className="w-6 h-6 text-[#0e284d]" />
      </button>
      <button onClick={nextSlide} className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white shadow-lg w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10" aria-label="Berita berikutnya">
        <ChevronRight className="w-6 h-6 text-[#0e284d]" />
      </button>
      <div className="flex justify-center gap-2 mt-3">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button key={idx} onClick={() => setCurrent(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === current ? "bg-[#02a502] scale-100" : "bg-gray-300 hover:bg-gray-400"}`} aria-label={`Lihat berita ${idx + 1}`} />
        ))}
      </div>
    </div>
  );
}

function BeritaDetail({ berita, onBack }: { berita: Berita; onBack: () => void }) {
  const normalized = normalizeContent(berita.content);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-[#3E7B27] hover:text-[#356a21] font-medium transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Kembali ke Beranda
        </button>
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {berita.images && berita.images.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {berita.images.map((img, idx) => {
                const isThree = berita.images.length === 3;
                const thirdLayout = isThree && idx === 2;
                const baseWrap = "overflow-hidden rounded-xl bg-gray-50";
                const wrapClass = thirdLayout ? `${baseWrap} sm:row-start-1 sm:row-span-2 sm:col-start-2` : isThree ? `${baseWrap} ${idx === 0 ? "sm:row-start-1 sm:col-start-1" : "sm:row-start-2 sm:col-start-1"}` : baseWrap;
                const imgClass = thirdLayout ? "w-full h-full min-h-[320px] object-cover" : "w-full h-56 object-cover";
                return (
                  <div key={img + idx} className={wrapClass}>
                    <Image src={img} alt={`${berita.title} - ${idx + 1}`} width={1200} height={720} className={imgClass} />
                  </div>
                );
              })}
            </div>
          ) : (
            <Image src={berita.image} alt={berita.title} width={1200} height={640} className="w-full h-80 object-cover" />
          )}
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              <span className="bg-[#02a502] text-white px-3 py-1 rounded-full text-xs font-medium">{berita.category}</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {berita.date}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {berita.author}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3e4095] mb-4">{berita.title}</h1>
            <div className="prose prose-lg max-w-none">
              {normalized.split("\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-6">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function BeritaSection() {
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);
  const [items, setItems] = useState<Berita[]>([]);
  const [categories, setCategories] = useState<BeritaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [beritaRes, categoriesRes] = await Promise.all([
          fetch(`/api/berita-public`, { cache: "no-store" }),
          fetch(`/api/berita/berita-categories`, { cache: "no-store" }),
        ]);
        if (!beritaRes.ok) {
          throw new Error(`Gagal memuat berita (${beritaRes.status})`);
        }
        if (!categoriesRes.ok) {
          throw new Error(`Gagal memuat kategori berita (${categoriesRes.status})`);
        }
        const json = await beritaRes.json();
        const categoryJson = await categoriesRes.json();
        const data = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        const categoryData = Array.isArray(categoryJson?.data) ? categoryJson.data : Array.isArray(categoryJson) ? categoryJson : [];
        const categoryMap = new Map<number, string>(categoryData.map((item: BeritaCategory) => [Number(item.id), String(item.name)]));
        const mapped: Berita[] = data.map((item: unknown) => mapApiToBerita(item, categoryMap));
        if (active) {
          setItems(mapped);
          setCategories(categoryData);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Terjadi kesalahan memuat berita";
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSelectBerita = (berita: Berita) => setSelectedBerita(berita);
  const handleBackToHome = () => setSelectedBerita(null);

  if (selectedBerita) {
    return <BeritaDetail berita={selectedBerita} onBack={handleBackToHome} />;
  }

  return (
    <section className="relative bg-linear-to-br from-blue-50 via-white to-gray-50 py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-base md:text-2xl lg:text-3xl font-extrabold text-[#3e4095] mb-2">
            Berita & Kegiatan <span className="text-[#02a502]">Kami</span>
          </h2>
          <p className="text-base md:text-lg lg:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">Ikuti perkembangan terbaru kegiatan, prestasi, dan program inklusi di kampus kami</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-80 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600 font-medium">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Belum ada berita yang dipublikasikan</p>
            <p className="text-gray-400 text-sm">Silakan tunggu update terbaru dari kami</p>
          </div>
        ) : (
          <BeritaCarousel items={items} onSelectBerita={handleSelectBerita} />
        )}
        <div className="text-center -mt-8">
          <Link href="/berita-umum" className="bg-white text-[#02a502] border-2 border-[#008000] px-4 py-2 rounded-xl text-lg font-semibold hover:bg-[#02a502] hover:text-white transition-all duration-300 flex items-center gap-2 mx-auto w-fit">
            Lihat Semua Berita
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
