"use client";

const programKerjaLengkap = [
  "Penerimaan Mahasiswa Staff",
  "Penerimaan Mahasiswa Student Buddy",
  "Pelatihan Bahasa Isyarat untuk Staff dan Student Buddy + software/aplikasi bantu untuk mahasiswa disabilitas",
  "Pelatihan Layanan Autism untuk Staff dan Student Buddy",
  "Pembuatan Peer Support Service dan Sistem Counseling Service",
  "Perawatan Fasilitas",
  "Penerimaan Maba 2025/2026",
  "Asesmen Kondisi Disabilitas Mahasiswa Selama Perkuliahan",
  "Pembuatan Web ULD",
  "Maintenance Web ULD",
  "Koordinasi Rutin",
  "Penyesuaian Metode Pembelajaran",
];

export default function ProgramKerjaPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-6 md:px-16 overflow-hidden pt-30">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16 -mt-25">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3e4095] mb-1 leading-tight tracking-tight mt-10">Program Kerja</h1>
        </div>
        <div className="bg-green-400/20 backdrop-blur-sm rounded-lg p-8 mb-12">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Program kerja utama Unit Layanan Disabilitas Universitas Kristen Duta Wacana mencakup berbagai kegiatan untuk mendukung layanan inklusi bagi mahasiswa, dosen, dan tenaga kependidikan.
          </p>

          <p className="text-gray-700 text-lg leading-relaxed">Berikut adalah daftar lengkap program kerja ULD UKDW sepanjang periode berjalan:</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 mb-12">
          <div className="space-y-4">
            {programKerjaLengkap.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm -mt-1">{index + 1}</div>
                <p className="text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-8 border border-green-400/30">
          <p className="text-gray-700 text-lg leading-relaxed text-center">ULD UKDW terus mengembangkan kegiatan dan layanan untuk mendukung terciptanya lingkungan kampus yang inklusif, humanis, dan ramah bagi penyandang disabilitas.</p>
        </div>
      </div>
    </div>
  );
}
