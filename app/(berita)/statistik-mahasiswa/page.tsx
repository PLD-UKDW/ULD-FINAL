"use client";
import { API_BASE } from '@/lib/api';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import Map from './map';

const PROVINSI_OPTIONS = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Banten',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Maluku',
  'Maluku Utara',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
];

const ipkData = [
  { value: 'all', label: 'Semua IPK' },
  { value: '4', label: '\u2265 3.5' },
  { value: '3', label: '3.0 - 3.49' },
  { value: '2', label: '2.5 - 2.99' },
  { value: '1', label: '< 2.5' },
];

const COLORS_DISABILITY = ['#993300', '#0057A3', '#005C4B', '#755000', '#8800D1'];
const COLORS_STATUS = ['#4945C4', '#275D3C', '#754E00'];
const COLORS_GENDER = ['#000BA3', '#A30000'];
const COLORS_JENJANG = ['#704B00', '#A30088', '#110094', '#006125'];
const COLORS_ASAL_SEKOLAH = ['#0057A3', '#00614F', '#6B4900', '#00498A', '#9E0000'];
const COLORS_IPK = ['#004F94', '#005747', '#755000', '#8F0000'];
const JENIS_ASAL_SEKOLAH_OPTIONS = ['Homeschooling', 'NonSLB', 'Paket C', 'Sarjana', 'SLB'];

type StudentRecord = {
  id?: number;
  provinsi?: string;
  angkatan?: number;
  jalur_masuk?: string;
  status?: string;
  jenjang?: string;
  gender?: string;
  asal_sekolah?: string;
  ipk?: number | string;
  fakultas?: string;
  prodi?: string;
  jenisDisabilitas?: string;
  kategoriDisabilitas?: string[];
};

export default function StatistikMahasiswaPage() {
  const MapChart = useMemo(() => dynamic(() => import('@/components/MapChart'), { ssr: false }), []);
  const [rawData, setRawData] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedDisability, setSelectedDisability] = useState('all');
  const [selectedIpk, setSelectedIpk] = useState('all');
  const [selectedProvinsi, setSelectedProvinsi] = useState('all');
  const [selectedAngkatan, setSelectedAngkatan] = useState('all');
  const [selectedJalurMasuk, setSelectedJalurMasuk] = useState('all');
  const [selectedJenjang, setSelectedJenjang] = useState('all');
  const [selectedJenisKelamin, setSelectedJenisKelamin] = useState('all');
  const [selectedJenisAsalSekolah, setSelectedJenisAsalSekolah] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [angkatanPage, setAngkatanPage] = useState(0);
  const [focusedFilterId, setFocusedFilterId] = useState<string | null>(null);
  const [showShortcutsGuide, setShowShortcutsGuide] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const lastHelpAnnouncementRef = useRef(0);
  const lastEscPressRef = useRef(0);
  const lastCtrlPressRef = useRef(0);
  const lastShiftPressRef = useRef(0);
  const isPausedRef = useRef(false);
  const isTtsActiveRef = useRef(false);
  
  const handleKeyboardClick = useCallback((e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'f' || e.key === 'F' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }, []);
  
  const announceNavigationHelp = useCallback(() => {
    const now = Date.now();
    if (now - lastHelpAnnouncementRef.current < 1200) return;
    lastHelpAnnouncementRef.current = now;
    const helpText = "Halaman Statistik Mahasiswa Disabilitas. Jika ingin langsung mengetahui jumlah mahasiswa disabilitas tanpa memilih filter, tekan Control dua kali. Tekan Tab untuk berpindah ke filter, lalu gunakan panah bawah atau atas untuk memilih opsi. Tekan F5 untuk membaca ulang panduan awal ini. Tekan escape dua kali untuk mendengar panduan shortcut filter. Tekan shift dua kali untuk mendengar panduan shortcut aksesibilitas.";
    window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: helpText } }));
  }, []);

  const announceShortcutsSummary = useCallback(() => {
    const shortcutsText = `Panduan Shortcut Filter. Shortcut Filter: Tekan antara Control 1 sampai Control 0 untuk pindah ke bagian filter atau Tekan Tab untuk pindah ke filter sebelah. Tekan Control dua kali untuk konfirmasi filter dan baca total mahasiswa. Control Z untuk reset semua filter. Shortcut Peta dan Statistik: Control A untuk baca asal provinsi mahasiswa. Control S untuk statistik angkatan. Control D untuk statistik fakultas. Control F untuk statistik disabilitas. Control G untuk statistik status. Control H untuk statistik jenis kelamin. Control J untuk statistik jenjang. Control K untuk statistik jenis asal sekolah. Control L untuk statistik IPK. Shortcut Kontrol TTS: Tekan Spasi untuk pause, lalu tekan Spasi lagi untuk melanjutkan pembacaan TTS. Tekan escape dua kali untuk membaca ulang panduan ini. Tekan shift dua kali untuk mendengar panduan shortcut aksesibilitas.`;
    window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: shortcutsText } }));
  }, []);

  const resetAllFilters = useCallback(() => {
    setSelectedFaculty('all');
    setSelectedDisability('all');
    setSelectedIpk('all');
    setSelectedProvinsi('all');
    setSelectedAngkatan('all');
    setSelectedJalurMasuk('all');
    setSelectedJenjang('all');
    setSelectedJenisKelamin('all');
    setSelectedJenisAsalSekolah('all');
    setSelectedStatus('all');
    
    setTimeout(() => {
      const facultyFilter = document.querySelector('[aria-label*="Fakultas"]') as HTMLSelectElement;
      if (facultyFilter) {
        facultyFilter.focus();
        window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Semua filter dan fitur aksesibilitas telah direset. Filter Fakultas dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
      } else {
        window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Semua filter dan fitur aksesibilitas telah direset.' } }));
      }
    }, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      announceNavigationHelp();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [announceNavigationHelp]);

  useEffect(() => {
    const handleLiveAnnouncement = (evt: Event) => {
      const event = evt as CustomEvent<{ text?: string }>;
      const text = (event.detail?.text || '').trim();
      if (!text) return;
      setLiveAnnouncement((prev) => (prev === text ? `${text}\u00A0` : text));
    };

    window.addEventListener('tts-say', handleLiveAnnouncement as EventListener);
    return () => window.removeEventListener('tts-say', handleLiveAnnouncement as EventListener);
  }, []);
  
  const getFilterLabel = useCallback((filterId: string): string => {
    const filterMap: Record<string, string> = {
      'faculty-filter': 'Fakultas',
      'disability-filter': 'Ragam Disabilitas',
      'ipk-filter': 'IPK',
      'provinsi-filter': 'Provinsi',
      'angkatan-filter': 'Angkatan',
      'jalurMasuk-filter': 'Jalur Masuk',
      'jenjang-filter': 'Jenjang',
      'jenisKelamin-filter': 'Jenis Kelamin',
      'jenisAsalSekolah-filter': 'Jenis Asal Sekolah',
      'status-filter': 'Status',
    };
    return filterMap[filterId] || filterId;
  }, []);
  
  const FILTER_ORDER = [
    'faculty-filter',
    'disability-filter',
    'ipk-filter',
    'provinsi-filter',
    'angkatan-filter',
    'jalurMasuk-filter',
    'jenjang-filter',
    'jenisKelamin-filter',
    'jenisAsalSekolah-filter',
    'status-filter'
  ];
  
  const getFilterPosition = useCallback((filterId: string): number => {
    return FILTER_ORDER.indexOf(filterId);
  }, []);
  
  const readMapDistribution = useCallback(() => {
    window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Loading...' } }));
  }, []);
  
  const handleFilterKeyDown = useCallback((e: React.KeyboardEvent<HTMLSelectElement>, filterId: string) => {
    const select = e.currentTarget as HTMLSelectElement;
    const filterLabel = getFilterLabel(filterId);
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      setTimeout(() => {
        const currentOption = select.options[select.selectedIndex];
        const optionText = currentOption?.textContent || 'Tidak diketahui';
        const arrowType = e.key === 'ArrowDown' ? 'bawah' : 'atas';
        const announcementText = `${filterLabel}: ${optionText}`;
        window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: announcementText } }));
      }, 50);
    } else if (e.key === 'Enter') {
      const confirmText = `Gunakan Control dua kali untuk konfirmasi filter dan baca total mahasiswa.`;
      window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: confirmText } }));
    }
  }, [getFilterLabel]);

  const formatKeyForTTS = useCallback((e: KeyboardEvent): string => {
    const keyMap: Record<string, string> = {
      ' ': 'spasi',
      'Enter': 'enter',
      'Tab': 'tab',
      'Backspace': 'backspace',
      'Delete': 'delete',
      'Escape': 'escape',
      'ArrowUp': 'panah atas',
      'ArrowDown': 'panah bawah',
      'ArrowLeft': 'panah kiri',
      'ArrowRight': 'panah kanan',
      'Home': 'home',
      'End': 'end',
      'PageUp': 'page up',
      'PageDown': 'page down',
    };

    const base = keyMap[e.key] || (e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase());
    const parts: string[] = [];
    if (e.ctrlKey) parts.push('control');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey && e.key !== 'Shift') parts.push('shift');
    if (e.metaKey) parts.push('meta');
    parts.push(base);

    return parts.join(' ');
  }, []);
  
  const normalizeStatus = useCallback((s?: string) => (s ?? '').trim().toLowerCase(), []);
  const prettyStatus = useCallback((s?: string) => {
    const t = normalizeStatus(s);
    switch (t) {
      case 'aktif': return 'Aktif';
      case 'lulus': return 'Lulus';
      case 'cuti': return 'Cuti';
      case 'undur diri': return 'Undur Diri';
      case 'do': return 'DO';
      default: return (s ?? '').trim();
    }
  }, [normalizeStatus]);

  const handleFilterFocus = useCallback((filterId: string, currentValue: string) => {
    setFocusedFilterId(filterId);
    const filterLabel = getFilterLabel(filterId);
    const readableValue = currentValue === 'all' ? `Semua ${filterLabel}` : currentValue;
    const position = getFilterPosition(filterId);
    const isFirstFilter = position === 0;
    const isLastFilter = position === FILTER_ORDER.length - 1;
    
    let focusText = `filter ${filterLabel}. Nilai saat ini: ${readableValue}. Tekan panah bawah atau atas untuk memilih opsi lainnya.`;
    
    if (!isFirstFilter) {
      focusText += ` Tekan Shift Tab untuk ke filter sebelumnya.`;
    }
    
    window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: focusText } }));
  }, [getFilterLabel, getFilterPosition]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/statistik-mahasiswa`);
        const json = await res.json();
        const data = Array.isArray(json?.data) ? (json.data as unknown[]) : [];
        setRawData(data as StudentRecord[]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Gagal memuat data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const facultyOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.fakultas) set.add(d.fakultas); });
    return [{ value: 'all', label: 'Semua Fakultas' }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const provinsiOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Provinsi' },
      ...PROVINSI_OPTIONS.map(p => ({ value: p, label: p }))
    ];
  }, []);

  const angkatanOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.angkatan !== undefined && d.angkatan !== null) set.add(String(d.angkatan)); });
    const sorted = Array.from(set).sort();
    return [{ value: 'all', label: 'Semua Angkatan' }, ...sorted.map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const jalurMasukOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.jalur_masuk) set.add(d.jalur_masuk); });
    return [{ value: 'all', label: 'Semua Jalur Masuk' }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const jenjangOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.jenjang) set.add(d.jenjang); });
    return [{ value: 'all', label: 'Semua Jenjang' }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const jenisKelaminOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.gender) set.add(d.gender); });
    const nice = (g: string) => g === 'L' ? 'Laki-laki' : g === 'P' ? 'Perempuan' : g;
    return [{ value: 'all', label: 'Semua Jenis Kelamin' }, ...Array.from(set).sort().map(v => ({ value: v, label: nice(v) }))];
  }, [rawData]);

  const jenisAsalSekolahOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Jenis Asal Sekolah' },
      ...JENIS_ASAL_SEKOLAH_OPTIONS.map(v => ({ value: v, label: v }))
    ];
  }, [rawData]);

  const disabilityOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.jenisDisabilitas) set.add(d.jenisDisabilitas); });
    return Array.from(set).sort();
  }, [rawData]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.status) set.add(normalizeStatus(d.status)); });
    const values = Array.from(set).sort();
    return values.map(v => ({ value: v, label: prettyStatus(v) }));
  }, [rawData, prettyStatus]);

  const parseIpk = (ipk: number | string | undefined): number | null => {
    if (ipk === undefined || ipk === null) return null;
    if (typeof ipk === 'number') return Number.isNaN(ipk) ? null : ipk;
    const s = ipk.trim().replace(',', '.');
    const v = parseFloat(s);
    return Number.isNaN(v) ? null : v;
  };
  const computeIpkCategoryCode = (ipk: number | string | undefined): '4' | '3' | '2' | '1' | null => {
    const v = parseIpk(ipk);
    if (v === null) return null;
    return v >= 3.5 ? '4' : v >= 3.0 ? '3' : v >= 2.5 ? '2' : '1';
  };
  const computeIpkBucket = (ipk: number | string | undefined): string | null => {
    const v = parseIpk(ipk);
    if (v === null) return null;
    return v >= 3.5 ? '\u2265 3.5' : v >= 3.0 ? '3.0 - 3.49' : v >= 2.5 ? '2.5 - 2.99' : '< 2.5';
  };

  const normalizeAsalSekolah = useCallback((value?: string) => {
    const v = (value ?? '').trim().toLowerCase();
    if (!v) return null;
    const map: Record<string, string> = {
      'homeschooling': 'Homeschooling',
      'home schooling': 'Homeschooling',
      'home-schooling': 'Homeschooling',
      'nonslb': 'NonSLB',
      'non slb': 'NonSLB',
      'non-slb': 'NonSLB',
      'paket c': 'Paket C',
      'paketc': 'Paket C',
      'paket-c': 'Paket C',
      'sarjana': 'Sarjana',
      'slb': 'SLB',
    };
    return map[v] ?? null;
  }, []);

  const filteredData: StudentRecord[] = rawData.filter((student: StudentRecord) => {
    const ipkCode = computeIpkCategoryCode(student.ipk);
    const asalSekolah = normalizeAsalSekolah(student.asal_sekolah);
    const selectedAsalSekolah = normalizeAsalSekolah(selectedJenisAsalSekolah) ?? selectedJenisAsalSekolah;
    return (selectedFaculty === 'all' || student.fakultas === selectedFaculty) &&
            (selectedDisability === 'all' || student.jenisDisabilitas === selectedDisability) &&
            (selectedIpk === 'all' || (ipkCode !== null && ipkCode === selectedIpk)) &&
            (selectedProvinsi === 'all' || (student.provinsi ?? '') === selectedProvinsi) &&
            (selectedAngkatan === 'all' || String(student.angkatan) === selectedAngkatan) &&
            (selectedJalurMasuk === 'all' || student.jalur_masuk === selectedJalurMasuk) &&
            (selectedJenjang === 'all' || student.jenjang === selectedJenjang) &&
            (selectedJenisKelamin === 'all' || student.gender === selectedJenisKelamin) &&
            (selectedJenisAsalSekolah === 'all' || (asalSekolah !== null && asalSekolah === selectedAsalSekolah)) &&
            (selectedStatus === 'all' || normalizeStatus(student.status) === selectedStatus);
  });

  const totalDisabledStudents = filteredData.length;

  const getActiveFiltersDescription = (): string => {
    const activeFilters: string[] = [];
    if (selectedFaculty !== 'all') activeFilters.push(`Fakultas: ${selectedFaculty}`);
    if (selectedDisability !== 'all') activeFilters.push(`Ragam Disabilitas: ${selectedDisability}`);
    if (selectedIpk !== 'all') {
      const ipkMap: Record<string, string> = { '4': '≥ 3.5', '3': '3.0 - 3.49', '2': '2.5 - 2.99', '1': '< 2.5' };
      activeFilters.push(`IPK: ${ipkMap[selectedIpk] || selectedIpk}`);
    }
    if (selectedProvinsi !== 'all') activeFilters.push(`Provinsi: ${selectedProvinsi}`);
    if (selectedAngkatan !== 'all') activeFilters.push(`Angkatan: ${selectedAngkatan}`);
    if (selectedJalurMasuk !== 'all') activeFilters.push(`Jalur Masuk: ${selectedJalurMasuk}`);
    if (selectedJenjang !== 'all') activeFilters.push(`Jenjang: ${selectedJenjang}`);
    if (selectedJenisKelamin !== 'all') {
      const genderMap: Record<string, string> = { 'L': 'Laki-laki', 'P': 'Perempuan' };
      activeFilters.push(`Jenis Kelamin: ${genderMap[selectedJenisKelamin] || selectedJenisKelamin}`);
    }
    if (selectedJenisAsalSekolah !== 'all') activeFilters.push(`Asal Sekolah: ${selectedJenisAsalSekolah}`);
    if (selectedStatus !== 'all') activeFilters.push(`Status: ${prettyStatus(selectedStatus)}`);
    
    return activeFilters.length > 0 ? activeFilters.join(', ') : 'tidak ada filter';
  };

  useEffect(() => {
    const handleFilterConfirm = (evt: Event) => {
      const event = evt as CustomEvent<{ filterLabel?: string; optionText?: string }>;
      const filterLabel = event.detail?.filterLabel || 'filter';
      const optionText = event.detail?.optionText || 'Tidak diketahui';
      const activeFiltersDesc = getActiveFiltersDescription();
      const confirmationText = `Konfirmasi ${filterLabel}: ${optionText}. Jumlah mahasiswa disabilitas dengan ${activeFiltersDesc} adalah ${totalDisabledStudents} mahasiswa.`;
      window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: confirmationText } }));
    };

    window.addEventListener('filter-confirm', handleFilterConfirm as EventListener);
    return () => window.removeEventListener('filter-confirm', handleFilterConfirm as EventListener);
  }, [getActiveFiltersDescription, totalDisabledStudents]);

  const handleFilterFocusImpl = useCallback((filterId: string, currentValue: string) => {
    setFocusedFilterId(filterId);
    const filterLabel = getFilterLabel(filterId);
    const readableValue = currentValue === 'all' ? `Semua ${filterLabel}` : currentValue;
    const position = getFilterPosition(filterId);
    const isFirstFilter = position === 0;
    const isLastFilter = position === FILTER_ORDER.length - 1;
    
    let focusText = `Anda berada di filter ${filterLabel}. Nilai saat ini: ${readableValue}. Tekan panah bawah atau atas untuk memilih opsi lainnya.`;
    
    if (!isFirstFilter) {
      focusText += ` Tekan Shift Tab untuk ke filter sebelumnya.`;
    }
    
    if (isLastFilter) {
      const activeFiltersDesc = getActiveFiltersDescription();
      focusText += ` Jumlah mahasiswa disabilitas dengan filter ${activeFiltersDesc} adalah ${filteredData.length} mahasiswa.`;
      focusText += ` Tekan Control A untuk membaca peta sebaran.`;
      focusText += ` Tekan Control S, D, F, G, H, atau J untuk membaca statistik.`;
    }
    
    window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: focusText } }));
  }, [getFilterLabel, getFilterPosition, getActiveFiltersDescription, filteredData]);

  const readMapDistributionEnhanced = useCallback(() => {
    const provinceMap = new Map<string, number>();
    
    filteredData.forEach((student: StudentRecord) => {
      const prov = student.provinsi || 'Tidak diketahui';
      provinceMap.set(prov, (provinceMap.get(prov) || 0) + 1);
    });
    
    if (provinceMap.size === 0) {
      window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Tidak ada mahasiswa dengan filter yang dipilih saat ini.' } }));
      return;
    }
    
    const provinceList: string[] = [];
    const sortedProvinces = Array.from(provinceMap.entries())
      .sort((a, b) => b[1] - a[1]);
    
    sortedProvinces.forEach(([province, count]) => {
      const countText = count === 1 ? '1 mahasiswa' : `${count} mahasiswa`;
      provinceList.push(`Provinsi ${province}: ${countText}`);
    });
    
    const mapText = `Peta sebaran mahasiswa disabilitas. ${provinceList.join('. ')}. Selesai.`;
    window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: mapText } }));
  }, [filteredData]);

  useEffect(() => {
    const handleTtsSay = (e: Event) => {
      isPausedRef.current = false;
      isTtsActiveRef.current = true;
    };
    
    const originalSpeak = window.speechSynthesis.speak;
    window.speechSynthesis.speak = function(utterance: any) {
      const originalOnEnd = utterance.onend;
      const originalOnCancel = utterance.oncancel;
      
      utterance.onend = function() {
        isPausedRef.current = false;
        isTtsActiveRef.current = false;
        if (originalOnEnd) originalOnEnd.call(utterance);
      };
      utterance.oncancel = function() {
        isPausedRef.current = false;
        isTtsActiveRef.current = false;
        if (originalOnCancel) originalOnCancel.call(utterance);
      };
      return originalSpeak.call(window.speechSynthesis, utterance);
    };
    
    window.addEventListener('tts-say', handleTtsSay);
    return () => window.removeEventListener('tts-say', handleTtsSay);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if keyboard navigation is enabled before handling custom shortcuts
      let keyboardNavEnabled = true;
      try {
        const raw = localStorage.getItem('a11y-settings');
        if (raw) {
          const settings = JSON.parse(raw);
          keyboardNavEnabled = settings.keyboardNavEnabled !== false;
        }
      } catch {}
      
      // Only allow F5, Shift, Escape, and Control double-tap for help (accessibility features)
      // All other custom shortcuts require keyboardNavEnabled to be true
      
      // F5 to replay initial navigation help (without refreshing page)
      if (e.key === 'F5') {
        e.preventDefault();
        announceNavigationHelp();
        return;
      }

      if (e.key === 'Shift' && !e.repeat) {
        const now = Date.now();
        const timeSinceLastShift = now - lastShiftPressRef.current;
        
        if (timeSinceLastShift < 500) {
          // Double Shift detected
          e.preventDefault();
          lastShiftPressRef.current = 0;
          announceShortcutsSummary();
          return;
        } else {
          lastShiftPressRef.current = now;
          return;
        }
      }

      if (e.key === 'Escape') {
        const now = Date.now();
        const timeSinceLastEsc = now - lastEscPressRef.current;
        
        if (timeSinceLastEsc < 500) {
          e.preventDefault();
          lastEscPressRef.current = 0;
          announceShortcutsSummary();
          return;
        } else {
          lastEscPressRef.current = now;
        }
      }

      if (e.key === 'Control') {
        const now = Date.now();
        const timeSinceLastCtrl = now - lastCtrlPressRef.current;
        
        if (timeSinceLastCtrl < 500) {
          e.preventDefault();
          lastCtrlPressRef.current = 0; // Reset
          const activeFiltersDesc = getActiveFiltersDescription();
          const quickTotalText = `Jumlah mahasiswa disabilitas saat ini dengan filter ${activeFiltersDesc} adalah ${totalDisabledStudents} mahasiswa.`;
          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: quickTotalText } }));
          return;
        } else {
          lastCtrlPressRef.current = now;
          return;
        }
      }

      // Skip remaining custom shortcuts if keyboard navigation is disabled
      if (!keyboardNavEnabled) return;

      let handledByShortcut = false;

      if (e.ctrlKey && !e.altKey && !e.metaKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handledByShortcut = true;
        resetAllFilters();
        window.dispatchEvent(new CustomEvent('a11y-reset'));
        return;
      }

      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        const key = e.key;
        const keyLower = key.toLowerCase();

        if ((keyLower === 'k' || keyLower === 'l') && !e.shiftKey) {
          e.preventDefault();
          handledByShortcut = true;
          const chartMap: Record<string, { id: string; name: string }> = {
            k: { id: 'asal-sekolah-chart', name: 'Jenis Asal Sekolah' },
            l: { id: 'ipk-chart', name: 'IPK' },
          };
          const chartShortcut = chartMap[keyLower];
          if (chartShortcut) {
            const element = document.getElementById(chartShortcut.id);
            if (element) {
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: `Membaca statistik ${chartShortcut.name}...` } }));
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
              setTimeout(() => {
                element.focus();
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                element.dispatchEvent(clickEvent);
              }, 300);
            }
          }
          return;
        }
        
        const isNumber = /^[0-9]$/.test(key);
        
        if (isNumber && !e.shiftKey) {
          e.preventDefault();
          handledByShortcut = true;
          const numKey = parseInt(key, 10);
          const filterMap: Record<number, () => void> = {
            1: () => {
              (document.querySelector('[aria-label*="Fakultas"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Fakultas dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            2: () => {
              (document.querySelector('[aria-label*="Ragam Disabilitas"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Ragam Disabilitas dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            3: () => {
              (document.querySelector('[aria-label*="IPK"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter IPK dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            4: () => {
              (document.querySelector('[aria-label*="Provinsi"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Provinsi dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            5: () => {
              (document.querySelector('[aria-label*="Angkatan"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Angkatan dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            6: () => {
              (document.querySelector('[aria-label*="Jalur Masuk"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Jalur Masuk dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            7: () => {
              (document.querySelector('[aria-label*="Jenjang"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Jenjang dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            8: () => {
              (document.querySelector('[aria-label*="Jenis Kelamin"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Jenis Kelamin dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            9: () => {
              (document.querySelector('[aria-label*="Jenis Asal Sekolah"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Jenis Asal Sekolah dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
            0: () => {
              (document.querySelector('[aria-label*="Status"]') as HTMLSelectElement)?.focus();
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Filter Status dipilih. Tekan panah bawah untuk memilih opsi lain.' } }));
            },
          };
          
          if (numKey in filterMap) {
            filterMap[numKey]();
          }
        } else if ((e.key === 'a' || e.key === 'A') && !e.shiftKey) {
          e.preventDefault();
          handledByShortcut = true;
          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: 'Membaca peta sebaran mahasiswa disabilitas...' } }));
          setTimeout(() => {
            readMapDistributionEnhanced();
          }, 100);
          return;
        } else {
          const chartShortcutMap: Record<string, { id: string; name: string }> = {
            s: { id: 'angkatan-chart', name: 'Angkatan' },
            d: { id: 'fakultas-chart', name: 'Fakultas' },
            f: { id: 'disabilitas-chart', name: 'Disabilitas' },
            g: { id: 'status-chart', name: 'Status' },
            h: { id: 'jenis-kelamin-chart', name: 'Jenis Kelamin' },
            j: { id: 'jenjang-chart', name: 'Jenjang' },
          };

          const chartShortcut = chartShortcutMap[keyLower];
          if (chartShortcut && !e.shiftKey) {
            e.preventDefault();
            handledByShortcut = true;
            const element = document.getElementById(chartShortcut.id);
            if (element) {
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: `Membaca statistik ${chartShortcut.name}...` } }));
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Focus immediately, then trigger click after
              element.focus();
              setTimeout(() => {
                element.focus(); // Ensure focus is retained
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                element.dispatchEvent(clickEvent);
              }, 300);
            }
            return;
          }
        }
      }

      if (e.key === ' ' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        const target = e.target as HTMLElement | null;
        const targetTag = target?.tagName;
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || target?.isContentEditable) {
          return;
        }
        
          if (typeof window !== 'undefined' && 'speechSynthesis' in window && isTtsActiveRef.current) {
          e.preventDefault();
          handledByShortcut = true;
          
          if (isPausedRef.current) {
            try {
              window.speechSynthesis.resume();
            } catch (err) {
              console.error('Resume failed:', err);
            }
              try { window.dispatchEvent(new CustomEvent('a11y-tts-control', { detail: { action: 'resume' } })); } catch {}
            isPausedRef.current = false;
          } else {
            // Pause playing audio
            try {
              window.speechSynthesis.pause();
            } catch (err) {
              console.error('Pause failed:', err);
            }
              try { window.dispatchEvent(new CustomEvent('a11y-tts-control', { detail: { action: 'pause' } })); } catch {}
            isPausedRef.current = true;
          }
          return;
        }
      }

      if (handledByShortcut) return;

      if (e.repeat) return;
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;

      const target = e.target as HTMLElement | null;
      const targetTag = target?.tagName;
      if (targetTag === 'SELECT' && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
        return;
      }
      
      const chartElement = target?.closest('div[role="button"][id*="chart"]');
      if (chartElement && (e.key === 'Enter' || e.key === 'f' || e.key === 'F')) {
        return;
      }

      const pressedKeyText = formatKeyForTTS(e);
      window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: `${pressedKeyText}` } }));
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [readMapDistributionEnhanced, getActiveFiltersDescription, totalDisabledStudents, formatKeyForTTS, announceNavigationHelp, announceShortcutsSummary, resetAllFilters]);

  const studentsPerAngkatan = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const angkatan = String(student.angkatan);
    acc[angkatan] = (acc[angkatan] || 0) + 1;
    return acc;
  }, {});
  const angkatanChartData = Object.keys(studentsPerAngkatan).sort().map(angkatan => ({
    angkatan,
    jumlah: studentsPerAngkatan[angkatan],
  }));

  const formatAsalSekolahForTts = (name: string): string => {
    if (name === 'NonSLB') return 'Non S L B';
    if (name === 'SLB') return 'S L B';
    return name;
  };

  const formatIpkForTts = (name: string): string => {
    if (name === '\u2265 3.5' || name === '≥ 3.5') return 'lebih dari sama dengan tiga koma lima';
    return name;
  };

  const studentsPerAsalSekolah = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const asal = normalizeAsalSekolah(student.asal_sekolah);
    if (!asal) return acc;
    acc[asal] = (acc[asal] || 0) + 1;
    return acc;
  }, {});
  const asalSekolahChartData = JENIS_ASAL_SEKOLAH_OPTIONS
    .map(asalSekolah => ({
      name: asalSekolah,
      value: studentsPerAsalSekolah[asalSekolah] || 0,
      label: `${asalSekolah}: ${studentsPerAsalSekolah[asalSekolah] || 0}`,
    }))
    .filter(item => item.value > 0);

  const studentsPerFakultas = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const f = student.fakultas ?? 'Tidak Diketahui';
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});
  const fakultasChartData = Object.keys(studentsPerFakultas).sort().map(fakultas => ({
    fakultas,
    jumlah: studentsPerFakultas[fakultas],
  }));

  const studentsPerJenisKelamin = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const g = student.gender ?? 'Tidak Diketahui';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const jenisKelaminChartData = Object.keys(studentsPerJenisKelamin).map(gender => ({
    name: gender === 'L' ? 'Laki-laki' : gender === 'P' ? 'Perempuan' : gender,
    value: studentsPerJenisKelamin[gender],
    label: `${gender === 'L' ? 'Laki-laki' : gender === 'P' ? 'Perempuan' : gender}: ${studentsPerJenisKelamin[gender]}`,
  }));

  const studentsPerJenjang = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const jj = student.jenjang ?? 'Tidak Diketahui';
    acc[jj] = (acc[jj] || 0) + 1;
    return acc;
  }, {});
  const jenjangChartData = Object.keys(studentsPerJenjang).map(jenjang => ({
    name: jenjang,
    value: studentsPerJenjang[jenjang],
    label: `${jenjang}: ${studentsPerJenjang[jenjang]}`,
  }));
    const studentsPerIpkCategory = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
      const bucket = computeIpkBucket(student.ipk);
      if (!bucket) return acc;
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});
    const ipkDistributionChartData = Object.keys(studentsPerIpkCategory).map(category => ({
      name: category,
      value: studentsPerIpkCategory[category],
      label: `${category}: ${studentsPerIpkCategory[category]}`,
    }));
    const studentsPerDisability = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
      const d = student.jenisDisabilitas || 'Tidak Tersedia';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const disabilityChartData = Object.keys(studentsPerDisability).map(name => ({
      name,
      value: studentsPerDisability[name],
      label: `${name}: ${studentsPerDisability[name]}`,
    }));

    const studentsPerStatus = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
      const s = normalizeStatus(student.status);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const statusChartData = Object.keys(studentsPerStatus).map(code => ({
      name: prettyStatus(code),
      value: studentsPerStatus[code],
      label: `${prettyStatus(code)}: ${studentsPerStatus[code]}`,
    }));

    const buildTtsAllMessage = (
      data: { name: string; value: number }[],
      formatter: (item: { name: string; value: number }) => string
    ) => data.map(formatter).join(', ');

    const numberToIndonesian = (num: number): string => {
      const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
      const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
      const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
      
      if (num === 0) return 'nol';
      if (num < 0) return 'minus ' + numberToIndonesian(-num);
      
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
      if (num < 1000) return ones[Math.floor(num / 100)] + ' ratus ' + (num % 100 ? numberToIndonesian(num % 100) : '').trim();
      if (num < 1000000) return (num < 2000 ? 'seribu' : numberToIndonesian(Math.floor(num / 1000)) + ' ribu') + (num % 1000 ? ' ' + numberToIndonesian(num % 1000) : '').trim();
      return num.toString();
    };

    const angkatanTtsMessage = angkatanChartData.map(item => 
      `Ada ${item.jumlah} mahasiswa disabilitas angkatan ${numberToIndonesian(Number(item.angkatan))}`
    ).join(', ');

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(angkatanChartData.length / ITEMS_PER_PAGE);
    const startIndex = angkatanPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedAngkatanData = angkatanChartData.slice(startIndex, endIndex);

    const fakultasTtsMessage = fakultasChartData.map(item => 
      `Ada ${item.jumlah} mahasiswa disabilitas di fakultas ${item.fakultas}`
    ).join(', ');

    const disabilityTtsMessage = buildTtsAllMessage(
      disabilityChartData,
      (item) => `Terdapat ${item.value} mahasiswa yang memiliki ragam disabilitas ${item.name}`
    );
    const statusTtsMessage = buildTtsAllMessage(
      statusChartData,
      (item) => `Terdapat ${item.value} mahasiswa dengan status ${item.name}`
    );
    const jenisKelaminTtsMessage = buildTtsAllMessage(
      jenisKelaminChartData,
      (item) => `Terdapat ${item.value} mahasiswa berjenis kelamin ${item.name}`
    );
    const jenjangTtsMessage = buildTtsAllMessage(
      jenjangChartData,
      (item) => `Terdapat ${item.value} mahasiswa pada jenjang ${item.name}`
    );
    const asalSekolahTtsMessage = buildTtsAllMessage(
      asalSekolahChartData,
      (item) => `Terdapat ${item.value} mahasiswa dari asal sekolah ${formatAsalSekolahForTts(item.name)}`
    );
    const ipkTtsMessage = buildTtsAllMessage(
      ipkDistributionChartData,
      (item) => `Terdapat ${item.value} mahasiswa dengan IPK ${formatIpkForTts(item.name)}`
    );

    const mapData = filteredData.map((m: any) => ({
      id: m.id || 0,
      nama: '',
      provinsi: m.provinsi || '',
      lat: 0,
      lng: 0,
      fakultas: m.fakultas || '',
      ragamDisabilitas: m.jenisDisabilitas || '',
      angkatan: String(m.angkatan ?? ''),
      jalurMasuk: m.jalur_masuk || '',
      status: m.status || '',
      jenjang: m.jenjang || '',
      jenisKelamin: m.gender || '',
      jenisAsalSekolah: m.asal_sekolah || '',
      ipk: m.ipk || 0,
    }));
    const mapTtsSummary = mapData.length > 0
      ? `Peta sebaran mahasiswa disabilitas. Total ${mapData.length} mahasiswa pada peta. Tekan Control A untuk membaca ringkasan sebaran per provinsi.`
      : 'Peta sebaran mahasiswa disabilitas belum memiliki data untuk filter saat ini.';

    return (
      <main role="main" aria-labelledby="statistik-page-title" className="relative min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-lime-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 bg-green-300/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="text-center mb-8 mt-20">
            <h1 id="statistik-page-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3e4095]">
              Statistik <span className="text-[#02a502]">Mahasiswa</span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Data terkini mengenai mahasiswa disabilitas di lingkungan universitas.
            </p>
          </header>
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {liveAnnouncement}
          </div>
          <div className="fixed bottom-20 right-4 z-40">
            <button
              onClick={() => setShowShortcutsGuide(!showShortcutsGuide)}
              className="rounded-md bg-[#0f7a0f] hover:bg-[#0c650c] text-white px-3 py-2 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0e7f0e] font-medium flex items-center gap-2"
              aria-label="Tampilkan panduan shortcut keyboard"
            >
              <span>⌨️</span>
              <span>Panduan Shortcut</span>
            </button>
          </div>
          
          {showShortcutsGuide && (
            <div role="dialog" aria-modal="true" aria-labelledby="shortcut-guide-title" className="mb-6 bg-white rounded-lg shadow-lg p-6 border-2 border-indigo-200">
              <div className="flex justify-between items-center mb-4">
                <h2 id="shortcut-guide-title" className="text-2xl font-bold text-gray-800">Panduan Shortcut Keyboard</h2>
                <button
                  onClick={() => setShowShortcutsGuide(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Tutup panduan shortcut"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-indigo-600 mb-3">Shortcut Filter</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+1</kbd> - Filter Fakultas</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+2</kbd> - Filter Ragam Disabilitas</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+3</kbd> - Filter IPK</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+4</kbd> - Filter Provinsi</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+5</kbd> - Filter Angkatan</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+6</kbd> - Filter Jalur Masuk</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+7</kbd> - Filter Jenjang</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+8</kbd> - Filter Jenis Kelamin</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+9</kbd> - Filter Jenis Asal Sekolah</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+0</kbd> - Filter Status</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl Ctrl</kbd> - Baca total mahasiswa dengan filter saat ini</p>
                    <p className="font-medium text-gray-700 mt-3 pt-3 border-t border-indigo-200"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+Z</kbd> - Reset semua filter</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-purple-600 mb-3">Shortcut Peta & Statistik</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+A</kbd> - Baca Peta Sebaran</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+S</kbd> - Baca Statistik Angkatan</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+D</kbd> - Baca Statistik Fakultas</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+F</kbd> - Baca Statistik Disabilitas</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+G</kbd> - Baca Statistik Status</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+H</kbd> - Baca Statistik Jenis Kelamin</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+J</kbd> - Baca Statistik Jenjang</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+K</kbd> - Baca Statistik Jenis Asal Sekolah</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl+L</kbd> - Baca Statistik IPK</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Alt+Shift+C</kbd> - Toggle Kontras Tinggi</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Shift+Z</kbd> - Cycle Zoom Level</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Shift+Shift</kbd> - Baca Shortcut Aksesibilitas</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">F5</kbd> - Baca ulang panduan awal halaman</p>
                    <p className="font-medium text-gray-700"><kbd className="bg-gray-100 px-2 py-1 rounded">Spasi</kbd> - Pause / Lanjutkan TTS</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>💡 Tips:</strong> Setelah memilih filter dengan shortcut, gunakan panah atas/bawah untuk memilih opsi. 
                  Tekan Ctrl dua kali (Ctrl Ctrl) untuk membaca total mahasiswa dengan filter saat ini. Gunakan Tab untuk berpindah ke filter berikutnya. 
                  Tekan <strong>Spasi</strong> untuk pause, lalu tekan <strong>Spasi</strong> lagi untuk melanjutkan TTS. Tekan Shift dua kali untuk mendengar rangkuman semua shortcut. Untuk low vision gunakan Alt+Shift+C untuk kontras dan Shift+Z untuk zoom.
                </p>
              </div>
            </div>
          )}
          {loading && (
            <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 text-blue-700 p-3 text-sm">Memuat data statistik…</div>
          )}
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div>
          )}
            <section aria-labelledby="filter-section-title" className="mb-12 bg-white shadow-md rounded-xl p-4 border border-gray-200">
              <h2 id="filter-section-title" className="text-xl font-bold text-gray-800 mb-4">Filter Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label htmlFor="faculty-filter" className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                      <select
                          id="faculty-filter"
                          aria-label="Filter by Fakultas, pilih untuk menyaring data"
                          value={selectedFaculty}
                          onChange={(e) => setSelectedFaculty(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('faculty-filter', selectedFaculty)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'faculty-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {facultyOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="disability-filter" className="block text-sm font-medium text-gray-700 mb-1">Ragam Disabilitas</label>
                      <select
                          id="disability-filter"
                          aria-label="Filter by Ragam Disabilitas, pilih untuk menyaring data"
                          value={selectedDisability}
                          onChange={(e) => setSelectedDisability(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('disability-filter', selectedDisability)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'disability-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            <option value="all">Semua Disabilitas</option>
                            {disabilityOptions.map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="ipk-filter" className="block text-sm font-medium text-gray-700 mb-1">IPK</label>
                      <select
                          id="ipk-filter"
                          aria-label="Filter by IPK, pilih untuk menyaring data"
                          value={selectedIpk}
                          onChange={(e) => setSelectedIpk(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('ipk-filter', selectedIpk)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'ipk-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {ipkData.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="provinsi-filter" className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                      <select
                          id="provinsi-filter"
                          aria-label="Filter by Provinsi, pilih untuk menyaring data"
                          value={selectedProvinsi}
                          onChange={(e) => setSelectedProvinsi(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('provinsi-filter', selectedProvinsi)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'provinsi-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {provinsiOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="angkatan-filter" className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                      <select
                          id="angkatan-filter"
                          aria-label="Filter by Angkatan, pilih untuk menyaring data"
                          value={selectedAngkatan}
                          onChange={(e) => setSelectedAngkatan(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('angkatan-filter', selectedAngkatan)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'angkatan-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {angkatanOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="jalurMasuk-filter" className="block text-sm font-medium text-gray-700 mb-1">Jalur Masuk</label>
                      <select
                          id="jalurMasuk-filter"
                          aria-label="Filter by Jalur Masuk, pilih untuk menyaring data"
                          value={selectedJalurMasuk}
                          onChange={(e) => setSelectedJalurMasuk(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('jalurMasuk-filter', selectedJalurMasuk)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'jalurMasuk-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {jalurMasukOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="jenjang-filter" className="block text-sm font-medium text-gray-700 mb-1">Jenjang</label>
                      <select
                          id="jenjang-filter"
                          aria-label="Filter by Jenjang, pilih untuk menyaring data"
                          value={selectedJenjang}
                          onChange={(e) => setSelectedJenjang(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('jenjang-filter', selectedJenjang)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'jenjang-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {jenjangOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="jenisKelamin-filter" className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                      <select
                          id="jenisKelamin-filter"
                          aria-label="Filter by Jenis Kelamin, pilih untuk menyaring data"
                          value={selectedJenisKelamin}
                          onChange={(e) => setSelectedJenisKelamin(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('jenisKelamin-filter', selectedJenisKelamin)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'jenisKelamin-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {jenisKelaminOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="jenisAsalSekolah-filter" className="block text-sm font-medium text-gray-700 mb-1">Jenis Asal Sekolah</label>
                      <select
                          id="jenisAsalSekolah-filter"
                          aria-label="Filter by Jenis Asal Sekolah, pilih untuk menyaring data"
                          value={selectedJenisAsalSekolah}
                          onChange={(e) => setSelectedJenisAsalSekolah(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('jenisAsalSekolah-filter', selectedJenisAsalSekolah)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'jenisAsalSekolah-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {jenisAsalSekolahOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                          id="status-filter"
                          aria-label="Filter by Status, pilih untuk menyaring data"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          onFocus={() => handleFilterFocusImpl('status-filter', selectedStatus)}
                          onKeyDown={(e) => handleFilterKeyDown(e, 'status-filter')}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            <option value="all">Semua Status</option>
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                      </select>
                  </div>
              </div>
              </section>
              <section aria-labelledby="ringkasan-statistik-title" className="mb-12">
            <h2 id="ringkasan-statistik-title" className="sr-only">Ringkasan Statistik</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6 text-center border border-gray-200" data-tts-text={`Terdapat ${totalDisabledStudents} mahasiswa disabilitas`}>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                Total Mahasiswa Disabilitas
                </h3>
                <h4 className="text-5xl font-extrabold text-[#3e4095]">
                {totalDisabledStudents}
                </h4>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 text-center border border-gray-200" data-tts-text={`Terdapat ${disabilityChartData.length} ragam disabilitas`}>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                Total Ragam Disabilitas
                </h3>
                <h4 className="text-5xl font-extrabold text-[#02a502]">
                {disabilityChartData.length}
                </h4>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 text-center border border-gray-200" data-tts-text={`Terdapat ${(statusChartData.find(s => s.name === 'Lulus')?.value || 0)} alumni disabilitas`}>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                Total Alumni Disabilitas
                </h3>
                <h4 className="text-5xl font-extrabold text-[#a16207]">
                {statusChartData.find(s => s.name === 'Lulus')?.value || 0}
                </h4>
              </div>
            </div>
          </section>
          <section aria-labelledby="map-section-title" className="mb-12 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 id="map-section-title" className="text-2xl font-bold text-center text-gray-800 mb-6">
                  Peta Sebaran Mahasiswa
              </h2>
              <p id="map-section-desc" className="sr-only">{mapTtsSummary}</p>
              <div className="h-96 w-full">
                  <MapChart data={mapData} ariaLabelledBy="map-section-title" ariaDescribedBy="map-section-desc" />
              </div>
          </section>
          <section aria-labelledby="charts-section-title" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <h2 id="charts-section-title" className="sr-only">Grafik Statistik Mahasiswa Disabilitas</h2>
            <div 
              id="angkatan-chart"
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              role="button"
              tabIndex={0}
              aria-keyshortcuts="Control+S"
              aria-describedby="angkatan-chart-desc"
              aria-label="Grafik jumlah mahasiswa disabilitas per angkatan, tekan F untuk mendengarkan deskripsi"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('svg') && !target.closest('.recharts-wrapper')) {
                  window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: angkatanTtsMessage } }));
                }
              }}
              onKeyDown={(e) => handleKeyboardClick(e, () => {
                window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: angkatanTtsMessage } }));
              })}
            >
              <p id="angkatan-chart-desc" className="sr-only">{angkatanTtsMessage}</p>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jumlah Mahasiswa Disabilitas per Angkatan
              </h3>
              <div className="h-96 w-full" data-tts-ignore="true">
                <ResponsiveContainer>
                  <LineChart
                    data={paginatedAngkatanData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="angkatan" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="jumlah"
                      stroke="#403CBE"
                      name="Jumlah"
                      activeDot={{
                        r: 8,
                        onClick: (e: any, payload: any) => {
                          if (payload && payload.payload) {
                            const year = payload.payload.angkatan;
                            const count = payload.payload.jumlah;
                            const yearInIndonesian = numberToIndonesian(Number(year));
                            const message = `Ada ${count} mahasiswa disabilitas angkatan ${yearInIndonesian}`;
                            window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: message } }));
                          }
                        }
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setAngkatanPage(Math.max(0, angkatanPage - 1))}
                  disabled={angkatanPage === 0}
                  className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed"
                >
                  ← Sebelumnya
                </button>
                <span className="text-sm text-gray-700 font-medium">
                  Halaman {angkatanPage + 1} dari {totalPages}
                </span>
                <button
                  onClick={() => setAngkatanPage(Math.min(totalPages - 1, angkatanPage + 1))}
                  disabled={angkatanPage === totalPages - 1}
                  className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed"
                >
                  Selanjutnya →
                </button>
              </div>
              <table className="sr-only">
                <caption>Tabel Data: Jumlah Mahasiswa Disabilitas per Angkatan</caption>
                <thead>
                  <tr>
                    <th scope="col">Angkatan</th>
                    <th scope="col">Jumlah Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  {angkatanChartData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.angkatan}</td>
                      <td>{item.jumlah}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              id="fakultas-chart"
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              role="button"
              tabIndex={0}
              aria-keyshortcuts="Control+D"
              aria-describedby="fakultas-chart-desc"
              aria-label="Grafik statistik per fakultas, tekan F untuk mendengarkan deskripsi"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('svg') && !target.closest('.recharts-wrapper')) {
                  window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: fakultasTtsMessage } }));
                }
              }}
              onKeyDown={(e) => handleKeyboardClick(e, () => {
                window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: fakultasTtsMessage } }));
              })}
            >
              <p id="fakultas-chart-desc" className="sr-only">{fakultasTtsMessage}</p>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jumlah Mahasiswa Disabilitas per Fakultas
              </h3>
              <div className="h-96 w-full relative" data-tts-ignore="true">
                <ResponsiveContainer>
                  <BarChart
                    data={fakultasChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fakultas"
                      interval={0}
                      tick={{ angle: -35, textAnchor: 'end', fontSize: 12 } as any }
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="bottom" align="right" wrapperStyle={{ position: 'absolute', bottom: 8, right: 8 }} />
                    <Bar
                      dataKey="jumlah"
                      fill="#275D3C"
                      name="Jumlah"
                      onClick={(data: any) => {
                        if (data && data.fakultas) {
                          const fakultas = data.fakultas;
                          const count = data.jumlah;
                          const message = `Ada ${count} mahasiswa disabilitas di fakultas ${fakultas}`;
                          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: message } }));
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <table className="sr-only">
                <caption>Tabel Data: Jumlah Mahasiswa Disabilitas per Fakultas</caption>
                <thead>
                  <tr>
                    <th scope="col">Fakultas</th>
                    <th scope="col">Jumlah Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  {fakultasChartData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.fakultas}</td>
                      <td>{item.jumlah}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              id="disabilitas-chart"
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-keyshortcuts="Control+F"
              aria-describedby="disabilitas-chart-desc"
              aria-label="Grafik ragam disabilitas, tekan F untuk mendengarkan deskripsi"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('[data-chart-area="pie"]')) {
                  window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: disabilityTtsMessage } }));
                }
              }}
              onKeyDown={(e) => handleKeyboardClick(e, () => {
                window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: disabilityTtsMessage } }));
              })}
            >
              <p id="disabilitas-chart-desc" className="sr-only">{disabilityTtsMessage}</p>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Ragam Disabilitas
              </h3>
              <div className="h-96 w-full" data-chart-area="pie" data-tts-ignore="true">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                    <Pie
                      data={disabilityChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={true}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data: any) => {
                        if (data && data.name !== undefined) {
                          const message = `Terdapat ${data.value} mahasiswa yang memiliki ragam disabilitas ${data.name}`;
                          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: message } }));
                        }
                      }}
                    >
                      {disabilityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_DISABILITY[index % COLORS_DISABILITY.length]} />
                      ))}
                      <LabelList dataKey="label" position="outside" style={{ fontSize: 14 }} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <table className="sr-only">
                <caption>Tabel Data: Ragam Disabilitas</caption>
                <thead>
                  <tr>
                    <th scope="col">Ragam Disabilitas</th>
                    <th scope="col">Jumlah Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  {disabilityChartData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              id="status-chart"
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-keyshortcuts="Control+G"
              aria-describedby="status-chart-desc"
              aria-label="Grafik status mahasiswa, tekan F untuk mendengarkan deskripsi"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('[data-chart-area="pie"]')) {
                  window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: statusTtsMessage } }));
                }
              }}
              onKeyDown={(e) => handleKeyboardClick(e, () => {
                window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: statusTtsMessage } }));
              })}
            >
              <p id="status-chart-desc" className="sr-only">{statusTtsMessage}</p>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Status Mahasiswa
              </h3>
              <div className="h-96 w-full" data-chart-area="pie" data-tts-ignore="true">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={true}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data: any) => {
                        if (data && data.name !== undefined) {
                          const message = `Terdapat ${data.value} mahasiswa dengan status ${data.name}`;
                          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: message } }));
                        }
                      }}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                      ))}
                      <LabelList dataKey="label" position="outside" style={{ fontSize: 14 }} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <table className="sr-only">
                <caption>Tabel Data: Status Mahasiswa</caption>
                <thead>
                  <tr>
                    <th scope="col">Status</th>
                    <th scope="col">Jumlah Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  {statusChartData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              id="jenis-kelamin-chart"
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-keyshortcuts="Control+H"
              aria-describedby="jenis-kelamin-chart-desc"
              aria-label="Grafik jenis kelamin, tekan F untuk mendengarkan deskripsi"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('[data-chart-area="pie"]')) {
                  window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: jenisKelaminTtsMessage } }));
                }
              }}
              onKeyDown={(e) => handleKeyboardClick(e, () => {
                window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: jenisKelaminTtsMessage } }));
              })}
            >
              <p id="jenis-kelamin-chart-desc" className="sr-only">{jenisKelaminTtsMessage}</p>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jenis Kelamin
              </h3>
              <div className="h-96 w-full" data-chart-area="pie" data-tts-ignore="true">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                    <Pie
                      data={jenisKelaminChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={true}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data: any) => {
                        if (data && data.name !== undefined) {
                          const message = `Terdapat ${data.value} mahasiswa berjenis kelamin ${data.name}`;
                          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: message } }));
                        }
                      }}
                    >
                      {jenisKelaminChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_GENDER[index % COLORS_GENDER.length]} />
                      ))}
                      <LabelList dataKey="label" position="outside" style={{ fontSize: 14 }} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <table className="sr-only">
                <caption>Tabel Data: Jenis Kelamin Mahasiswa</caption>
                <thead>
                  <tr>
                    <th scope="col">Jenis Kelamin</th>
                    <th scope="col">Jumlah Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  {jenisKelaminChartData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              id="jenjang-chart"
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-keyshortcuts="Control+J"
              aria-describedby="jenjang-chart-desc"
              aria-label="Grafik jenjang studi, tekan F untuk mendengarkan deskripsi"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('[data-chart-area="pie"]')) {
                  window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: jenjangTtsMessage } }));
                }
              }}
              onKeyDown={(e) => handleKeyboardClick(e, () => {
                window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: jenjangTtsMessage } }));
              })}
            >
              <p id="jenjang-chart-desc" className="sr-only">{jenjangTtsMessage}</p>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jenjang Studi
              </h3>
              <div className="h-96 w-full" data-chart-area="pie" data-tts-ignore="true">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                    <Pie
                      data={jenjangChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={true}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data: any) => {
                        if (data && data.name !== undefined) {
                          const message = `Terdapat ${data.value} mahasiswa pada jenjang ${data.name}`;
                          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: message } }));
                        }
                      }}
                    >
                      {jenjangChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_JENJANG[index % COLORS_JENJANG.length]} />
                      ))}
                      <LabelList dataKey="label" position="outside" style={{ fontSize: 14 }} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <table className="sr-only">
                <caption>Tabel Data: Jenjang Studi Mahasiswa</caption>
                <thead>
                  <tr>
                    <th scope="col">Jenjang</th>
                    <th scope="col">Jumlah Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  {jenjangChartData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              id="asal-sekolah-chart"
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-keyshortcuts="Control+K"
              aria-describedby="asal-sekolah-chart-desc"
              aria-label="Grafik jenis asal sekolah, tekan F untuk mendengarkan deskripsi"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('[data-chart-area="pie"]')) {
                  window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: asalSekolahTtsMessage } }));
                }
              }}
              onKeyDown={(e) => handleKeyboardClick(e, () => {
                window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: asalSekolahTtsMessage } }));
              })}
            >
              <p id="asal-sekolah-chart-desc" className="sr-only">{asalSekolahTtsMessage}</p>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jenis Asal Sekolah
              </h3>
              <div className="h-96 w-full" data-chart-area="pie" data-tts-ignore="true">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                    <Pie
                      data={asalSekolahChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={true}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data: any) => {
                        if (data && data.name !== undefined) {
                          const message = `Terdapat ${data.value} mahasiswa dari asal sekolah ${formatAsalSekolahForTts(data.name)}`;
                          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: message } }));
                        }
                      }}
                    >
                      {asalSekolahChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_ASAL_SEKOLAH[index % COLORS_ASAL_SEKOLAH.length]} />
                      ))}
                      <LabelList dataKey="label" position="outside" style={{ fontSize: 14 }} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <table className="sr-only">
                <caption>Tabel Data: Jenis Asal Sekolah Mahasiswa</caption>
                <thead>
                  <tr>
                    <th scope="col">Jenis Asal Sekolah</th>
                    <th scope="col">Jumlah Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  {asalSekolahChartData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              id="ipk-chart"
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="button"
              tabIndex={0}
              aria-keyshortcuts="Control+L"
              aria-describedby="ipk-chart-desc"
              aria-label="Grafik distribusi IPK, tekan F untuk mendengarkan deskripsi"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('[data-chart-area="pie"]')) {
                  window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: ipkTtsMessage } }));
                }
              }}
              onKeyDown={(e) => handleKeyboardClick(e, () => {
                window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: ipkTtsMessage } }));
              })}
            >
              <p id="ipk-chart-desc" className="sr-only">{ipkTtsMessage}</p>
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Distribusi IPK
              </h3>
              <div className="h-96 w-full" data-chart-area="pie" data-tts-ignore="true">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                    <Pie
                      data={ipkDistributionChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={true}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data: any) => {
                        if (data && data.name !== undefined) {
                          const message = `Terdapat ${data.value} mahasiswa dengan IPK ${formatIpkForTts(data.name)}`;
                          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: message } }));
                        }
                      }}
                    >
                      {ipkDistributionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_IPK[index % COLORS_IPK.length]} />
                      ))}
                      <LabelList dataKey="label" position="outside" style={{ fontSize: 14 }} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <table className="sr-only">
                <caption>Tabel Data: Distribusi IPK Mahasiswa</caption>
                <thead>
                  <tr>
                    <th scope="col">Range IPK</th>
                    <th scope="col">Jumlah Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  {ipkDistributionChartData.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    );
  }

// "use client";
// import Image from "next/image";

// export default function UnderDevelopment() {
//   return (
//     <section className="relative min-h-screen flex items-center justify-center px-6">
//       {/* Background Accent */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-20 left-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 right-20 w-60 h-60 bg-lime-400/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 bg-green-300/5 rounded-full blur-3xl"></div>
//       </div>

//       {/* Content */}
//       <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
//         <div className="mb-8">
//           <Image 
//             src="/maintenance.jpg" 
//             alt="Logo ULD" 
//             width={400} 
//             height={400} 
//             className="mx-auto" 
//           />
//         </div>
//         <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#3e4095]">
//           This <span className="text-[#02a502]">Page</span> is Under Development
//         </h1>
//       </div>
//     </section>
//   );
// }