"use client";
import Image from "next/image";
import { BookOpen} from "lucide-react";

export default function SejarahPage() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mt-10">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#3e4095] tracking-tight leading-tight mb-4">Sejarah ULD UKDW</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">Perjalanan kami dalam mewujudkan pendidikan inklusif di UKDW</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-20">
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="relative group">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform group-hover:shadow-3xl transition-all duration-500">
                  <div className="aspect-[4/5] relative">
                    <Image src="/sejarah.jpg" alt="Fasilitas ULD UKDW yang mendukung aksesibilitas mahasiswa berkebutuhan khusus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3e4095]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="font-bold text-xl mb-2">Fasilitas Inklusif</p>
                    <p className="text-sm opacity-90">Lingkungan yang ramah untuk semua mahasiswa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3e4095] leading-tight">Perjalanan Menuju Kampus Inklusif</h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-[#3e4095] to-purple-500 rounded-full"></div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg  hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-[#3e4095]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-[#3e4095]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#3e4095] mb-2">Sejarah Unit Layanan Disabilitas</h3>
                  <div className="h-1 w-16 bg-[#3e4095]/30 rounded-full mb-3"></div>
                </div>
              </div>

              <div className="space-y-6 text-base md:text-lg leading-relaxed text-gray-700 text-justify">
                <p>
                  Universitas Kristen Duta Wacana (UKDW) memiliki komitmen kuat untuk membuka akses pendidikan tinggi seluas-luasnya bagi seluruh masyarakat, termasuk penyandang disabilitas. Dalam satu dekade terakhir, jumlah mahasiswa
                  penyandang disabilitas meningkat dan hadir di berbagai program studi, sehingga mendorong kebutuhan akan sistem pembelajaran yang lebih inklusif. Kondisi ini menuntut para dosen untuk berinovasi dalam materi dan metode
                  pengajaran, meskipun sebagian dari mereka tidak memiliki latar belakang pedagogi khusus untuk mahasiswa berkebutuhan khusus.
                </p>

                <p>
                  Selain itu, UKDW juga memberikan ruang bagi dosen penyandang disabilitas untuk mengajar dan menduduki jabatan struktural, serta melibatkan alumni yang memiliki kepedulian pada isu disabilitas untuk berbagi pengalaman.
                  Kehadiran mahasiswa, dosen, dan alumni tersebut memperkuat identitas UKDW sebagai kampus yang menjunjung nilai <span className="font-semibold text-[#3e4095]">Service to the World</span>, yaitu memberi kesempatan yang
                  setara bagi semua individu. Upaya ini sekaligus memperkaya lingkungan akademik yang multikultural dan mendukung keberagaman sebagai bagian dari kehidupan kampus sehari-hari.
                </p>

                <p>
                  Sebagai bentuk nyata dari komitmen tersebut, UKDW meluncurkan <span className="font-semibold text-[#3e4095]">Unit Layanan Disabilitas (ULD) pada 11 November 2024</span> oleh Rektor Dr.-Ing. Wiyatiningsih, S.T., M.T.
                  Seiring dengan status akreditasi institusi peringkat A, UKDW menyadari perlunya pendekatan yang lebih sistematis dan terukur dalam menyediakan layanan bagi penyandang disabilitas. Di samping memenuhi nilai-nilai institusi,
                  langkah ini juga menjadi bentuk pelaksanaan <span className="font-semibold text-[#3e4095]">Undang-Undang No. 8 Tahun 2016</span> tentang Penyandang Disabilitas yang menjamin hak pendidikan bagi seluruh warganya. Dari
                  sinilah Unit Layanan Disabilitas (ULD) UKDW resmi dibentuk, sebagai wujud komitmen universitas untuk menghadirkan dukungan akademik dan non-akademik yang inklusif, memberdayakan, dan memungkinkan setiap individu berkembang
                  secara mandiri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
