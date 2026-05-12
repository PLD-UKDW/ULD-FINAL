"use client";
import Image from "next/image";

export default function StrukturOrganisasiGambar() {
  return (
    <section className="relative w-full py-30 px-6 md:px-16 text-[#02a502] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-32 w-56 h-56 bg-lime-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Struktur <span className="text-[#02a502]">Organisasi</span>
        </h1>
        <p className="text-lg text-gray-700 mt-4 max-w-2xl mx-auto">
          Berikut adalah struktur organisasi dalam bentuk bagan visual untuk memudahkan pemahaman.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto bg-white/60 backdrop-blur-md shadow-xl rounded-3xl p-6 md:p-10 border border-white/30">
        <div className="w-full h-auto relative overflow-hidden rounded-2xl border-2 border-[#3e4095]/20 shadow-md">
          <Image
            src="/struktur.png"
            alt="Struktur Organisasi"
            width={1600}
            height={900}
            className="object-contain w-full h-auto"
          />
        </div>

        <p className="text-center mt-6 text-sm md:text-base text-[#3e4095] italic">
          Diagram struktur organisasi Unit Layanan Disabilitas
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-100/20 to-transparent pointer-events-none"></div>
    </section>
  );
}
