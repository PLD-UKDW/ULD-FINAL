"use client";

export default function VisiMisiPage() {
  return (
    <section className="relative min-h-screen bg-white py-24 px-6 md:px-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#3e4095]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-[#02a502]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-[#3e4095]/5 rounded-full blur-3xl"></div>
      </div>

      <div
        className="relative z-10 max-w-6xl mx-auto text-center mb-16 
        opacity-0 translate-y-8 motion-safe:animate-[fadeInUp_0.8s_ease-out_forwards]"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-[#3e4095]">
          Visi & Misi ULD
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Landasan dan arah ULD dalam menciptakan kampus yang inklusif
        </p>
      </div>

      <div
        className="relative z-10 max-w-4xl mx-auto mb-16 p-8 rounded-2xl shadow-lg bg-white/70 
        backdrop-blur-sm border border-gray-100
        opacity-0 translate-y-8 motion-safe:animate-[fadeInUp_1s_ease-out_forwards]"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#02a502] text-center">
          Visi
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Mewujudkan civitas akademika UKDW yang humanis-berbudaya melalui
          layanan pendidikan yang berempati, inklusif, aksesibel, dan ramah
          disabilitas untuk mendukung pengembangan potensi dan kemandirian
          penyandang disabilitas secara optimal.
        </p>
      </div>

      <div
        className="relative z-10 max-w-4xl mx-auto mb-16 p-8 rounded-2xl shadow-lg bg-white/70 
        backdrop-blur-sm border border-gray-100
        opacity-0 translate-y-8 motion-safe:animate-[fadeInUp_1.2s_ease-out_forwards]"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-[#02a502] text-center">
          Misi
        </h2>
        <ul className="list-disc list-inside text-lg text-gray-700 space-y-4 leading-relaxed">
          <li>
            Mengembangkan program pendidikan partisipatoris yang menghargai
            perbedaan dan kebutuhan unik setiap penyandang disabilitas.
          </li>
          <li>
            Mendorong penyediaan fasilitas dan teknologi yang aksesibel untuk
            optimasi layanan pendidikan disabilitas.
          </li>
          <li>
            Meningkatkan kompetensi civitas akademika dalam layanan disabilitas.
          </li>
          <li>
            Menciptakan lingkungan dengan budaya ramah disabilitas.
          </li>
        </ul>
      </div>

      {/* ====== MOTO ====== */}
      {/* <div
        className="relative z-10 max-w-4xl mx-auto text-center p-8 rounded-2xl shadow-lg bg-white/70 
        backdrop-blur-sm border border-gray-100
        opacity-0 translate-y-8 motion-safe:animate-[fadeInUp_1.4s_ease-out_forwards]"
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#02a502]">
          Moto
        </h2>
        <p className="text-xl italic text-gray-700">
          “Menyemai inklusi demi masa depan berkeadilan!”
        </p>
      </div> */}

      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
