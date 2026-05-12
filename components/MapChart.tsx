"use client";
import { Feature, Geometry } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';

interface Student {
  id: number;
  nama: string;
  provinsi: string;
  lat: number;
  lng: number;
  fakultas: string;
  ragamDisabilitas: string;
  angkatan: string;
  jalurMasuk: string;
  status: string;
  jenjang: string;
  jenisKelamin: string;
  jenisAsalSekolah: string;
  ipk: number;
}

interface GeoJSONFeatureProperties {
  NAMA_PROV?: string;
  Propinsi?: string;
  PROPINSI?: string;
  Provinsi?: string;
  PROVINSI?: string;
  provinsi?: string;
  NAME_1?: string;
  name?: string;
}

interface GeoJSONData {
  type: "FeatureCollection";
  features: Feature<Geometry, GeoJSONFeatureProperties>[];
}

interface MapChartProps {
  data: Student[];
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

function normalizeProvince(name: string): string {
  const n = (name || '').trim().toLowerCase();
  const map: Record<string, string> = {
    'nanggroe aceh darussalam': 'aceh',
    'di. aceh': 'aceh',
    'ntb': 'nusa tenggara barat',
    'nusa tenggara barat': 'nusa tenggara barat',
    'nusatenggara barat': 'nusa tenggara barat',
    'ntt': 'nusa tenggara timur',
    'nusa tenggara timur': 'nusa tenggara timur',
    'nusatenggara timur': 'nusa tenggara timur',
    'di yogyakarta': 'di yogyakarta',
    'd.i yogyakarta': 'di yogyakarta',
    'daerah istimewa yogyakarta': 'di yogyakarta',
    'diy': 'di yogyakarta',
    'dki jakarta': 'dki jakarta',
    'jakarta': 'dki jakarta',
    'probanten': 'probanten',
    'banten': 'probanten',
    'bangka belitung': 'bangka belitung',
    'kep. bangka belitung': 'bangka belitung',
    'kepulauan bangka belitung': 'bangka belitung',
    'kepulauan riau': 'riau',
    'riau': 'riau',
    'kalimantan utara': 'kalimantan utara',
    'kalimatan utara': 'kalimantan utara',
    'kalimantan barat': 'kalimantan barat',
    'kalimantan tengah': 'kalimantan tengah',
    'kalimantan selatan': 'kalimantan selatan',
    'kalimantan timur': 'kalimantan timur',
    'irian jaya timur': 'papua barat',
    'irian jaya tengah': 'papua tengah',
    'irian jaya barat': 'papua barat',
    'papua barat': 'papua barat',
    'papua barat daya': 'papua barat daya',
    'papua selatan': 'papua selatan',
    'papua tengah': 'papua tengah',
    'papua pegunungan': 'papua pegunungan',
  };
  return map[n] ?? n;
}

function getProvinceName(feature: Feature<Geometry, GeoJSONFeatureProperties>): string {
  const p = feature.properties || {};
  const rawName = p.NAMA_PROV || p.Propinsi || p.PROPINSI || p.Provinsi || p.PROVINSI || p.provinsi || p.NAME_1 || p.name || '';
  return typeof rawName === 'string' ? rawName : '';
}

function getColor(count: number): string {
  if (count === 0) return '#008000';
  return '#ffd400';
}
  
const MapChart: React.FC<MapChartProps> = ({ data, ariaLabelledBy, ariaDescribedBy }) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONData | null>(null);
  const internalDescriptionId = 'mapchart-sr-description';

  const mapSummary = useMemo(() => {
    const provinceMap = new Map<string, number>();
    data.forEach((student) => {
      const prov = (student.provinsi || 'Tidak diketahui').trim() || 'Tidak diketahui';
      provinceMap.set(prov, (provinceMap.get(prov) || 0) + 1);
    });

    if (provinceMap.size === 0) {
      return 'Peta sebaran mahasiswa disabilitas belum memiliki data untuk filter saat ini.';
    }

    const top3 = Array.from(provinceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([province, count]) => `${province} ${count} mahasiswa`)
      .join(', ');

    return `Peta sebaran mahasiswa disabilitas menampilkan ${data.length} mahasiswa. Sebaran terbanyak: ${top3}. Tekan Enter atau Spasi untuk membacakan ringkasan peta.`;
  }, [data]);

  useEffect(() => {
    console.log('[DEBUG] MapChart received data:', data);
    if (data.length > 0) {
      console.log('[DEBUG] Sample student:', data[0]);
      console.log('[DEBUG] All provinces in data:', data.map(d => d.provinsi));
    }
  }, [data]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json')
      .then(response => response.json())
      .then((data: GeoJSONData) => {
        console.log('[DEBUG] GeoJSON loaded, features count:', data.features?.length);
        if (data.features && data.features.length > 0) {
          const allProvinces = data.features.map(f => f.properties?.NAMA_PROV).filter(Boolean);
          console.log('[DEBUG] All GeoJSON provinces:', allProvinces);
        }
        setGeoJsonData(data);
      });
  }, []);

  const getFeatureStyle = (count: number) => {
    const isHighContrast = typeof document !== 'undefined' && 
      document.documentElement.getAttribute('data-a11y-contrast') === 'high';
    return {
      fillColor: getColor(count),
      weight: isHighContrast ? 3 : 2,
      opacity: 1,
      color: isHighContrast ? '#000000' : 'white',
      dashArray: isHighContrast ? '' : '3',
      fillOpacity: count === 0 ? 0.4 : 0.7,
    };
  };

  const getCountsForFeature = (feature: Feature<Geometry, GeoJSONFeatureProperties>) => {
    const provinceName = getProvinceName(feature);
    const provNorm = normalizeProvince(provinceName);
    const kaltimCount = data.filter(student => normalizeProvince(student.provinsi) === 'kalimantan timur').length;
    const kaltaraCount = data.filter(student => normalizeProvince(student.provinsi) === 'kalimantan utara').length;
    const matchingStudents = data.filter(student => normalizeProvince(student.provinsi) === provNorm);
    const isKaltimArea = provNorm === 'kalimantan timur';
    const studentCount = isKaltimArea ? (kaltimCount + kaltaraCount) : matchingStudents.length;
    const content = isKaltimArea
      ? `<b>${provinceName || 'Tidak diketahui'}</b><br/>Kalimantan Timur: ${kaltimCount}<br/>Kalimantan Utara: ${kaltaraCount}`
      : `<b>${provinceName || 'Tidak diketahui'}</b><br/>Jumlah Mahasiswa Disabilitas: ${studentCount}`;
    const ttsMessage = isKaltimArea
      ? `Provinsi Kalimantan Timur, jumlah mahasiswa disabilitas ${kaltimCount}, Provinsi Kalimantan Utara jumlah mahasiswa disabilitas ${kaltaraCount}`
      : `Provinsi ${provinceName || 'Tidak diketahui'}, jumlah mahasiswa disabilitas ${studentCount}`;
    return {
      provinceName,
      provNorm,
      matchingStudents,
      studentCount,
      content,
      ttsMessage,
    };
  };

  const featureStyle = (feature?: Feature<Geometry, GeoJSONFeatureProperties>) => {
    if (!feature) {
      return getFeatureStyle(0);
    }
    const { studentCount } = getCountsForFeature(feature);
    return getFeatureStyle(studentCount);
  };

  const onEachFeature = (feature: Feature<Geometry, GeoJSONFeatureProperties>, layer: L.Layer) => {
    const { provinceName, matchingStudents } = getCountsForFeature(feature);

    if (provinceName.toLowerCase().includes('nusa') || provinceName.toLowerCase().includes('papa')) {
      const { provNorm, studentCount } = getCountsForFeature(feature);
      console.log(`[DEBUG] Province: ${provinceName} → Normalized: ${provNorm} → Count: ${studentCount}`);
      if (matchingStudents.length > 0) {
        console.log(`  Found ${studentCount} students:`, matchingStudents.map(s => ({ nama: s.nama, provinsi: s.provinsi, normalized: normalizeProvince(s.provinsi) })));
      }
    }

    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        const { studentCount, content } = getCountsForFeature(feature);
        const target = e.target as L.Path;
        const originalStyle = featureStyle(feature);
        target.setStyle({
          ...originalStyle,
          weight: 2.5,
          color: 'black',
          dashArray: '',
          fillOpacity: studentCount === 0 ? 0.5 : 0.8
        });
        layer.bindPopup(content);
        (layer as any).openPopup(e.latlng);
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        const originalStyle = featureStyle(feature);
        target.setStyle(originalStyle);
        layer.closePopup();
      },
      click: (e: L.LeafletMouseEvent) => {
        const { content, ttsMessage } = getCountsForFeature(feature);
        layer.bindPopup(content);
        (layer as any).openPopup(e.latlng);
        try {
          window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: ttsMessage } }));
        } catch {}
      }
    });

    const label = provinceName || '';
    if (label) {
      layer.bindTooltip(label, { permanent: true, direction: 'center', className: 'province-label' });
    }
  };

  return (
    <>
      <style>{`
        .province-label {
          background: transparent;
          border: none;
          box-shadow: none;
          font-weight: normal; /* Set font back to normal weight */
          color: black;
          font-size: 12px; /* Set font size back to 12px */
          text-align: center;
          pointer-events: none;
          z-index: 1000; /* Ensure labels are on top */
          text-shadow: 1px 1px 2px rgba(255,255,255,0.7); /* Keep text shadow for contrast */
        }
        .map-legend {
          background: white;
          border: 2px solid #ccc;
          border-radius: 8px;
          padding: 12px;
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 999;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          gap: 10px;
        }
        .legend-item:last-child {
          margin-bottom: 0;
        }
        .legend-color {
          width: 24px;
          height: 24px;
          border: 1px solid #999;
          border-radius: 3px;
        }
        .legend-text {
          font-weight: 500;
          color: #333;
        }
      `}</style>
      <div
        data-tts-ignore="true"
        role="region"
        tabIndex={0}
        aria-label={!ariaLabelledBy ? 'Peta sebaran mahasiswa disabilitas' : undefined}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy || internalDescriptionId}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            try {
              window.dispatchEvent(new CustomEvent('tts-say', { detail: { text: mapSummary } }));
            } catch {}
          }
        }}
        style={{ height: '100%', width: '100%', position: 'relative' }}
      >
        {!ariaDescribedBy && <p id={internalDescriptionId} className="sr-only">{mapSummary}</p>}
        <MapContainer center={[-2.548926, 118.0148634]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {geoJsonData && (
            <GeoJSON
              key={JSON.stringify(data.map(d => d.id).sort())}
              data={geoJsonData}
              style={featureStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#008000', opacity: 0.4 }}></div>
            <span className="legend-text">Tidak ada mahasiswa</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ffd400', opacity: 0.7 }}></div>
            <span className="legend-text">Ada mahasiswa</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapChart;

