"use client";

export default function SOPPendampingan() {
  return (
    <section className="relative bg-gradient-to-br from-blue-100 via-white to-green-100 py-24 px-6 md:px-16 overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 w-80 h-80 -translate-x-1/2 bg-green-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-[#3e4095] to-[#5a62e6] bg-clip-text text-transparent">
            SOP Pendampingan Layanan Disabilitas
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mt-3 max-w-2xl mx-auto">
          Panduan standar operasional layanan pendampingan mahasiswa disabilitas
        </p>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          Dokumen ini berisi pedoman dan prosedur standar dalam memberikan layanan 
          pendampingan kepada mahasiswa penyandang disabilitas. SOP ini mencakup 
          mekanisme pengajuan, jenis-jenis pendampingan, serta hak dan kewajiban 
          pendamping dalam mendukung proses akademik mahasiswa disabilitas.
        </p>

        <a
          href="https://drive.google.com/file/d/1nWrrG5gTW6LdXlftFMmGG8F1neRF_xGl/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3 bg-[#02a502] text-white rounded-lg shadow-md hover:bg-[#028d02] hover:shadow-lg transition-all font-semibold"
        >
          Lihat SOP Pendampingan Selengkapnya
        </a>
      </div>

    </section>
  );
}
