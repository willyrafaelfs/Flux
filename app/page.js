'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CATEGORIES = ["Makanan/Minuman", "Belanja Bulanan", "Transportasi", "Hiburan", "Kesehatan", "Tagihan", "Pendidikan", "Lainnya"];
const INITIAL_FORM = { nama_toko: "", keperluan: "", kategori: "Lainnya", total_harga: "", tanggal: new Date().toISOString().split('T')[0], catatan: "" };

const ICONS = {
  eye: <><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  chart: <path d="M12 20V10M18 20V4M6 20v-4" />,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
  cpu: <><path d="M4 4h16v16H4zm5 5h6v6H9zM9 1v3m6-3v3m-6 16v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3" /></>,
  lock: <><path d="M7 11V7a5 5 0 0 1 10 0v4M3 11h18v11H3z" /></>,
  agreement: <><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></>,
  smartphone: <><path d="M5 2h14v20H5zM12 18h.01" /></>,
  alert: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  fileText: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  receipt: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="16" y2="11" /><line x1="8" y1="15" x2="13" y2="15" /></>,
  folder: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>,
  sparkles: <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></>,
  trendingUp: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
  wallet: <><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></>,
};

const Icon = ({ name, className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.75" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {ICONS[name] || null}
  </svg>
);

export default function Home() {
  const { data: session, status } = useSession();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [budgetLimit, setBudgetLimit] = useState(5000000); 
  const [showBudgetPrompt, setShowBudgetPrompt] = useState(false);
  const [activeInsightTab, setActiveInsightTab] = useState('daily'); // 'daily', 'monthly', 'categories'
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'warning' }
  const [activeModal, setActiveModal] = useState(null); // null, 'privacy', 'terms'
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  
  const fileInputRef = useRef(null);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    dataList.forEach(item => {
      const d = new Date(item.tanggal);
      if (!isNaN(d.getFullYear())) years.add(d.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [dataList]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
      const savedBudget = localStorage.getItem('flux_budget');
      if (savedBudget) setBudgetLimit(parseInt(savedBudget));
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance');
      const json = await res.json();
      if (json.data) setDataList(json.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredData = useMemo(() => {
    return dataList.filter(item => {
      const matchSearch = (item.nama_toko?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (item.keperluan?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === "Semua" || item.kategori === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [dataList, searchTerm, filterCategory]);

  const stats = useMemo(() => {
    let totalThisMonth = 0;
    const catTotals = {};
    const dayTotals = {};
    const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthTotals = Array(12).fill(0);

    dataList.forEach(item => {
      const d = new Date(item.tanggal);
      const val = parseInt(item.total_harga?.toString().replace(/[\.,]/g, '') || "0");
      
      if (d.getFullYear() === viewYear) {
        monthTotals[d.getMonth()] += val;
      }

      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        totalThisMonth += val;
        dayTotals[d.getDate()] = (dayTotals[d.getDate()] || 0) + val;
        catTotals[item.kategori] = (catTotals[item.kategori] || 0) + val;
      }
    });

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const chartData = Array.from({ length: daysInMonth }, (_, i) => ({ name: (i + 1).toString(), total: dayTotals[i+1] || 0 }));
    const barChartData = shortMonthNames.map((name, i) => ({ name, total: monthTotals[i] }));
    const pieChartData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));
    
    const insights = [];
    const sorted = Object.entries(catTotals).sort((a,b) => b[1] - a[1]);
    const budgetPct = Math.min((totalThisMonth / budgetLimit) * 100, 100);
    
    if (dataList.length === 0) {
      insights.push("Belum ada data. Mulai jalankan scan AI struk pertama Anda hari ini.");
    } else {
      if (budgetPct >= 100) insights.push("Batas anggaran bulanan yang ditentukan telah terlampaui.");
      else if (budgetPct >= 80) insights.push("Sisa anggaran bulan ini tersisa kurang dari 20%.");
      else insights.push("Pengeluaran Anda berada dalam batas anggaran yang terkontrol.");

      if (sorted[0] && totalThisMonth > 0) {
        const topPct = Math.round((sorted[0][1] / totalThisMonth) * 100);
        if (topPct > 50) insights.push(`${topPct}% total pengeluaran bulan ini dialokasikan untuk kategori ${sorted[0][0]}.`);
        else insights.push(`Kategori pengeluaran terbesar Anda saat ini adalah ${sorted[0][0]}.`);
      }
    }

    return { 
      totalThisMonth, 
      sortedCats: sorted, 
      totalAll: Object.values(catTotals).reduce((a,b) => a+b, 0) || 1, 
      budgetPercent: budgetPct, 
      chartData, 
      barChartData: barChartData.filter(d => d.total > 0 || shortMonthNames.indexOf(d.name) <= (viewYear < new Date().getFullYear() ? 11 : new Date().getMonth())),
      pieChartData,
      insights 
    };
  }, [dataList, budgetLimit, viewMonth, viewYear]);

  const CHART_COLORS = ['#059669', '#10b981', '#0f172a', '#334155', '#64748b', '#0284c7', '#f59e0b', '#ef4444'];

  const exportToCSV = () => {
    const headers = ["ID", "Nama Toko", "Kategori", "Keperluan", "Total", "Tanggal", "Link Struk"];
    const rows = dataList.map(item => [item.id, item.nama_toko, item.kategori, item.keperluan, item.total_harga, item.tanggal, item.imageUrl || ""]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Flux_Records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const compressImageForAI = (imageFile) => {
    return new Promise((resolve) => {
      const img = new Image(); 
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = document.createElement('canvas'); 
        const ctx = canvas.getContext('2d');
        let w = img.width; 
        let h = img.height; 
        if (w > 1024) { h = h * (1024/w); w = 1024; }
        if (h > 1024) { w = w * (1024/h); h = 1024; }
        canvas.width = w; 
        canvas.height = h; 
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(b => resolve(b), 'image/jpeg', 0.6);
      };
    });
  };

  const handleScan = async () => {
    if (!file) return; 
    setScanning(true);
    try {
      const compressedBlob = await compressImageForAI(file);
      const payload = new FormData();
      payload.append("file", compressedBlob, "receipt.jpg");

      const res = await fetch('/api/gemini', {
        method: 'POST',
        body: payload,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghubungi Gemini AI");

      if (json.data) {
        setFormData(prev => ({ ...prev, ...json.data }));
        showToast("AI berhasil mengekstrak rincian struk!", "success");
      }
    } catch (e) { 
      showToast(e.message, "error");
    } finally { 
      setScanning(false); 
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("data", JSON.stringify(formData));
      if (file) payload.append("file", file);

      const res = await fetch('/api/finance', {
        method: editId ? 'PUT' : 'POST',
        body: editId ? JSON.stringify({ id: editId, ...formData }) : payload,
      });

      if (res.ok) { 
        setFormData(INITIAL_FORM); 
        setFile(null); 
        setPreview(null); 
        setEditId(null); 
        fetchData(); 
        showToast("Transaksi tersimpan dan tersinkron ke Drive!", "success");
      }
    } catch (e) { 
      showToast(e.message, "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi ini?")) return; 
    setLoading(true);
    try { 
      const res = await fetch(`/api/finance?id=${id}`, { method: 'DELETE' }); 
      if (res.ok) { 
        fetchData(); 
        showToast("Transaksi telah dihapus.", "warning"); 
      } 
    } catch (e) { 
      showToast(e.message, "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const formatCurrency = (val) => {
    const num = parseInt(val?.toString().replace(/[\.,]/g, '') || "0");
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Clean Light Mode Legal Modal
  const LegalModal = () => {
    if (!activeModal) return null;
    const isPrivacy = activeModal === 'privacy';
    const email = "willy.rafaelfs@gmail.com";
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6 animate-fadeIn" onClick={() => setActiveModal(null)}>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-popup animate-modal" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Icon name={isPrivacy ? "shield" : "fileText"} className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{isPrivacy ? "Kebijakan Privasi" : "Persyaratan Layanan"}</h3>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">✕</button>
          </div>
          
          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200/60">
              Pembaruan Terakhir: 18 April 2026
            </span>
            
            {isPrivacy ? (
              <div className="space-y-6">
                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                    <Icon name="download" className="w-4 h-4 text-emerald-600" />
                    1. Informasi yang Dikumpulkan
                  </h4>
                  <p>Aplikasi <strong>Flux</strong> beroperasi dengan prinsip minimisasi data. Kami hanya memproses data yang diperlukan:</p>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
                    <li><strong>Akun Google:</strong> Email dan identitas dasar untuk autentikasi aman.</li>
                    <li><strong>Google Drive:</strong> Izin terbatas untuk menyimpan dan membaca data struk di folder Drive pribadi Anda.</li>
                    <li><strong>Gambar Struk:</strong> Diproses secara instan oleh AI tanpa disimpan permanen di database publik.</li>
                  </ul>
                </section>
                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                    <Icon name="cpu" className="w-4 h-4 text-emerald-600" />
                    2. Pemrosesan AI Multimodal
                  </h4>
                  <p>Data struk dikirim ke Google Gemini API secara terenkripsi untuk diekstrak teks dan nominalnya. Tidak ada model yang dilatih menggunakan data pribadi keuangan Anda.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                    <Icon name="lock" className="w-4 h-4 text-emerald-600" />
                    3. Keamanan Data Pribadi
                  </h4>
                  <p>Seluruh komunikasi dienkripsi menggunakan protokol HTTPS/TLS modern. Salinan data struk sepenuhnya berada di bawah kendali akun Google Drive pengguna.</p>
                </section>
              </div>
            ) : (
              <div className="space-y-6">
                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-base">1. Penerimaan Ketentuan</h4>
                  <p>Dengan menggunakan Flux, Anda menyetujui ketentuan pemanfaatan layanan pengelolaan keuangan ini. Pastikan Anda memiliki wewenang sah atas akun Google yang dihubungkan.</p>
                </section>
                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-base">2. Batasan Tanggung Jawab</h4>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 italic">
                    "Flux disediakan sebagai alat bantu produktivitas keuangan. Hasil ekstraksi AI disarankan untuk diverifikasi kembali sebelum digunakan untuk pelaporan formal perpajakan."
                  </p>
                </section>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-semibold text-slate-800 text-xs">Punya pertanyaan mengenai data Anda?</p>
                <p className="text-xs text-slate-500">Hubungi pengembang untuk transparansi teknis.</p>
              </div>
              <a href={`mailto:${email}`} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all">
                Hubungi Pengembang
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Toast UI in Light Mode
  const renderToast = () => {
    if (!toast) return null;
    const isError = toast.type === 'error';
    const isWarning = toast.type === 'warning';
    return (
      <div className="fixed bottom-6 right-6 z-[300] animate-toast">
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-card border text-xs font-medium ${
          isError 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : isWarning 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-white border-slate-200/90 text-slate-800 shadow-elevated'
        }`}>
          <span className="text-base">{isError ? '⚠️' : isWarning ? '⚡' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      </div>
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Memuat Flux...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // --- LANDING PAGE: 100% CLEAN LIGHT MODE ---
  // ==========================================
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col font-sans relative">
        <div className="mesh-gradient-light"></div>
        
        {/* Modern Clean Navbar */}
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/70">
          <div className="container max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <a href="#" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg group-hover:bg-emerald-600 transition-colors shadow-subtle">
                  F
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Flux<span className="text-emerald-600">.</span>
                </span>
              </a>

              <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
                <a href="#fitur" className="hover:text-slate-900 transition-colors">Fitur Utama</a>
                <a href="#mockup" className="hover:text-slate-900 transition-colors">Tinjauan Dasbor</a>
                <a href="#keamanan" className="hover:text-slate-900 transition-colors">Keamanan Drive</a>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => signIn('google')} 
                className="btn-flux btn-flux-secondary !py-2 !px-4 text-xs font-semibold"
              >
                Masuk Akun
              </button>
              <button 
                onClick={() => signIn('google')} 
                className="btn-flux btn-flux-primary !py-2 !px-5 text-xs font-semibold flex items-center gap-2"
              >
                <span>Mulai Sekarang</span>
                <Icon name="arrowRight" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container max-w-7xl mx-auto px-6 pt-12 pb-20 lg:pt-16 lg:pb-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            
            {/* Soft Pastel Micro Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/70 rounded-full text-emerald-800 text-xs font-semibold mb-6 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Powered by Gemini 2.5</span>
              <span className="text-emerald-300">•</span>
              <span>Google Drive Sync</span>
            </div>

            {/* Clear, Human & Grounded Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Kelola Alur Keuangan & Arsip Struk Lebih Tenang lewat <span className="text-emerald-600">AI Vision.</span>
            </h1>

            {/* Legible, Charcoal Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
              Flux mengekstrak struk belanja, mencatat transaksi otomatis, dan menyinkronkan seluruh catatan langsung ke Google Drive pribadi Anda tanpa perantara database eksternal.
            </p>

            {/* Solid CTAs (Deep Slate & Secondary) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => signIn('google')} 
                className="btn-flux btn-flux-primary !px-7 !py-3.5 text-sm w-full sm:w-auto flex items-center justify-center gap-2.5 shadow-card hover:shadow-elevated"
              >
                <span>Mulai Sekarang — Gratis</span>
                <Icon name="arrowRight" className="w-4 h-4" />
              </button>
              
              <a 
                href="#mockup" 
                className="btn-flux btn-flux-secondary !px-6 !py-3.5 text-sm w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Icon name="eye" className="w-4 h-4 text-slate-500" />
                <span>Lihat Preview Dasbor</span>
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Icon name="check" className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                100% Data di Google Drive Anda
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check" className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                Ekstraksi Struk dalam 0.8 Detik
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="check" className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                Bebas Iklan & Tanpa Database Pihak Ketiga
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* HERO ASSET: REAL APPLICATION UI MOCKUP (DASHBOARD NYATA) */}
          {/* ======================================================== */}
          <div id="mockup" className="max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-elevated">
              
              {/* Mockup Window Header Bar */}
              <div className="bg-slate-50/90 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-300/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-300/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-300/80 inline-block"></span>
                  <span className="text-xs font-semibold text-slate-500 ml-3 hidden sm:inline">Flux Financial Center</span>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200/80 text-[11px] text-slate-500 font-medium shadow-subtle">
                  <Icon name="lock" className="w-3 h-3 text-emerald-600" />
                  <span>app.flux.finance/workspace</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Drive Aktif
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content Area */}
              <div className="p-6 sm:p-8 bg-[#FBFCFD] space-y-6">
                
                {/* 1. Summary Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Saldo Aktif */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-slate-500">Total Saldo Kas</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-md">
                        +12.4%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">Rp 24.850.000</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Icon name="check" className="w-3 h-3 text-emerald-600" />
                      Tersinkronisasi 2 menit lalu
                    </div>
                  </div>

                  {/* Pengeluaran Bulan Ini */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-slate-500">Pengeluaran April</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-md">
                        73% Kuota
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">Rp 3.650.000</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full w-[73%]"></div>
                    </div>
                  </div>

                  {/* Sisa Anggaran */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-slate-500">Sisa Anggaran Sehat</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-md">
                        Terkendali
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 tracking-tight">Rp 1.350.000</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Limit bulanan: Rp 5.000.000
                    </div>
                  </div>
                </div>

                {/* 2. Line Chart & Live Intelligence Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Fine-line Expense Trend Chart */}
                  <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Tren Pengeluaran 7 Hari Terakhir</h4>
                        <p className="text-[11px] text-slate-500">Rata-rata harian: Rp 520.000/hari</p>
                      </div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        Pola Stabil
                      </span>
                    </div>

                    {/* SVG Line Chart with Clean Gridlines */}
                    <div className="w-full h-44 relative">
                      <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal Gridlines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                        
                        {/* Area Under Curve */}
                        <path 
                          d="M 20 120 Q 80 90, 140 105 T 260 60 T 360 85 T 460 35 L 460 145 L 20 145 Z" 
                          fill="url(#chartEmeraldGrad)" 
                        />

                        {/* Thin Fine Line */}
                        <path 
                          d="M 20 120 Q 80 90, 140 105 T 260 60 T 360 85 T 460 35" 
                          fill="none" 
                          stroke="#059669" 
                          strokeWidth="2.25" 
                          strokeLinecap="round" 
                        />

                        {/* Data Points */}
                        <circle cx="20" cy="120" r="3.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
                        <circle cx="100" cy="98" r="3.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
                        <circle cx="180" cy="100" r="3.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
                        <circle cx="260" cy="60" r="3.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
                        <circle cx="340" cy="78" r="3.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
                        <circle cx="410" cy="65" r="3.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
                        <circle cx="460" cy="35" r="4.5" fill="#059669" stroke="#FFFFFF" strokeWidth="2.5" />
                        
                        {/* Tooltip callout at latest point */}
                        <g transform="translate(370, 0)">
                          <rect width="110" height="26" rx="6" fill="#0F172A" />
                          <text x="55" y="16" fill="#FFFFFF" fontSize="10" fontWeight="600" textAnchor="middle">
                            Sabtu: Rp 348.500
                          </text>
                        </g>
                      </svg>
                      
                      {/* Day Labels */}
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium pt-2 px-2">
                        <span>Sen</span>
                        <span>Sel</span>
                        <span>Rab</span>
                        <span>Kam</span>
                        <span>Jum</span>
                        <span>Sab</span>
                        <span>Min</span>
                      </div>
                    </div>
                  </div>

                  {/* Concrete Recent Transactions List */}
                  <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-slate-900">Transaksi Terkini</h4>
                        <span className="text-[11px] font-semibold text-slate-500">Real-time</span>
                      </div>

                      <div className="space-y-3">
                        {/* Transaksi 1 */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                              SP
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">Superindo Swalayan</p>
                              <p className="text-[10px] text-slate-500">Belanja Mingguan • Hari ini, 14:20</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-900">-Rp 348.500</div>
                            <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[9px] rounded">
                              Tervalidasi AI
                            </span>
                          </div>
                        </div>

                        {/* Transaksi 2 */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                              KP
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">Kopi Kenangan</p>
                              <p className="text-[10px] text-slate-500">Makanan/Minuman • Kemarin, 10:15</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-900">-Rp 45.000</div>
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 font-semibold text-[9px] rounded">
                              Lunas
                            </span>
                          </div>
                        </div>

                        {/* Transaksi 3 */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                              TF
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">Pembayaran Klien</p>
                              <p className="text-[10px] text-slate-500">Pemasukan • 18 Apr, 09:00</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-emerald-700">+Rp 4.500.000</div>
                            <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[9px] rounded">
                              Masuk
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Micro Processing Tag */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <Icon name="sparkles" className="w-3.5 h-3.5" />
                        AI Vision Auto-Categorized
                      </span>
                      <span className="font-semibold text-slate-700">32 Entri Bulan Ini</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* FITUR "CERDAS & AMAN" - BENTO GRID INTERAKTIF MODERN */}
        {/* ======================================================== */}
        <section id="fitur" className="container max-w-7xl mx-auto px-6 py-20 border-t border-slate-200">
          
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700 text-xs font-semibold mb-4">
              <Icon name="shield" className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arsitektur Cerdas & Aman</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Dirancang Cerdas, Terlindungi Sepenuhnya.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Menggabungkan kecerdasan multimodal Google Gemini dengan privasi penuh penyimpanan Google Drive pribadi Anda.
            </p>
          </div>

          {/* Bento Grid 4-Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento 1: AI Vision Receipt OCR (Span 7) */}
            <div className="md:col-span-7 bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Icon name="receipt" className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200/60">
                    Powered by Gemini 2.5
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Ekstraksi Struk Presisi Tinggi Tanpa Input Manual
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Cukup foto struk belanja, invoice PDF, atau bon kasir. AI Vision membaca nama toko, rincian tanggal, kategori pengeluaran, hingga nominal rupiah dengan presisi tinggi.
                </p>
              </div>

              {/* Visual Demo Pill Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    Hasil Ekstraksi Gemini 2.5
                  </span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    Kecepatan: 0.8s
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-subtle">
                    <span className="text-[10px] text-slate-500 block">Nama Toko</span>
                    <span className="font-bold text-slate-900">Gramedia</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-subtle">
                    <span className="text-[10px] text-slate-500 block">Kategori</span>
                    <span className="font-bold text-slate-900">Pendidikan</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-subtle">
                    <span className="text-[10px] text-slate-500 block">Nominal</span>
                    <span className="font-bold text-emerald-700">Rp 185.000</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-subtle">
                    <span className="text-[10px] text-slate-500 block">Status</span>
                    <span className="font-bold text-slate-900">Tervalidasi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento 2: Google Drive Sovereign Storage (Span 5) */}
            <div id="keamanan" className="md:col-span-5 bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                    <Icon name="folder" className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                    Google Drive Sync
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Kedaulatan Data 100% di Akun Anda
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Flux tidak menyimpan riwayat keuangan di basis data pihak ketiga. Seluruh gambar struk dan rekap kas disimpan di Google Drive pribadi Anda dengan izin terisolasi.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Icon name="lock" className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Enkripsi Berstandar Google</p>
                  <p className="text-[11px] text-emerald-700">Hanya akun Google Anda yang memiliki kunci akses arsip.</p>
                </div>
              </div>
            </div>

            {/* Bento 3: Visual Analytics (Span 5) */}
            <div className="md:col-span-5 bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                    <Icon name="chart" className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200/60">
                    Visual Intelligence
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Insight Pengeluaran Otomatis
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Visualisasi grafik garis harian, ringkasan bulanan, dan proporsi pengeluaran per kategori yang diperbarui secara langsung.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
                  <span>Makanan & Kebutuhan</span>
                  <span className="font-bold text-slate-900">54% (Dominan)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full w-[54%]"></div>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">Flux memberi tahu saat pos tertentu melebihi kebiasaan wajar.</p>
              </div>
            </div>

            {/* Bento 4: Budget Alerts & Instant CSV Export (Span 7) */}
            <div className="md:col-span-7 bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Icon name="download" className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200/60">
                    Alert & Export Ready
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Sistem Peringatan Anggaran & Ekspor Satu Klik
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Tentukan batas kuota bulanan dengan sistem peringatan otomatis saat mencapai 80% dan 100%. Unduh buku besar dalam format CSV standar akuntansi kapan saja tanpa terkunci vendor.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    ⚠️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Sistem Peringatan Dini</p>
                    <p className="text-[11px] text-slate-500">Notifikasi saat kuota menipis</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                    📊
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Buku Besar CSV</p>
                    <p className="text-[11px] text-slate-500">Kompatibel Excel & Sheets</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Clean Pre-Footer CTA */}
        <section className="container max-w-7xl mx-auto px-6 py-12">
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden shadow-card">
            <div className="max-w-2xl mx-auto relative z-10">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full mb-4">
                Siap Dalam 30 Detik
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
                Mulai Catat Keuangan Anda Tanpa Ribet
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
                Cukup hubungkan akun Google Anda dan nikmati pencatatan pengeluaran otomatis bertenaga AI dengan kedaulatan data penuh.
              </p>
              <button 
                onClick={() => signIn('google')} 
                className="btn-flux btn-flux-emerald !px-8 !py-3.5 text-sm font-semibold mx-auto"
              >
                <span>Mulai Sekarang dengan Akun Google</span>
                <Icon name="arrowRight" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Modern Clean Footer */}
        <footer className="container max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-base">Flux<span className="text-emerald-600">.</span></span>
            <span>•</span>
            <span>© 2026 Flux Finance. Hak cipta dilindungi.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-900 transition-colors font-medium">Kebijakan Privasi</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-slate-900 transition-colors font-medium">Syarat Layanan</button>
            <a href="mailto:willy.rafaelfs@gmail.com" className="hover:text-slate-900 transition-colors font-medium">Bantuan</a>
          </div>
        </footer>

        <LegalModal />
        {renderToast()}
      </div>
    );
  }

  // ==========================================
  // --- AUTHENTICATED DASHBOARD (LIGHT MODE) ---
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Budget Alert Warning */}
      {stats.budgetPercent >= 80 && (
        <div className={`w-full py-2 px-6 text-center text-xs font-semibold transition-all border-b ${
          stats.budgetPercent >= 100 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {stats.budgetPercent >= 100 
            ? '🚨 Perhatian: Anda telah melampaui batas anggaran bulanan yang ditentukan!' 
            : '⚠️ Peringatan: Sisa anggaran Anda bulan ini sudah menipis (<20%).'}
        </div>
      )}

      {/* App Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-subtle">
        <div className="max-w-[1720px] w-full mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center text-sm">
                F
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                FLUX<span className="text-emerald-600">.</span>
              </h1>
            </div>
            <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>
            <span className="text-xs font-semibold text-slate-500 hidden sm:block">Dasbor Finansial & Struk</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={exportToCSV} 
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Ekspor CSV"
            >
              <Icon name="download" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            <div className="w-px h-5 bg-slate-200"></div>

            <div className="flex items-center gap-2.5">
              <img src={session.user.image} className="w-7 h-7 rounded-full border border-slate-200" alt="Avatar" />
              <span className="font-semibold text-xs text-slate-700 hidden md:block">{session.user.name}</span>
            </div>

            <button 
              onClick={() => signOut()} 
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors ml-1"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1720px] w-full mx-auto p-6 flex-1 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* LEFT SIDEBAR: ACTION ZONE */}
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            
            {/* Gemini Scanner Card */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="sparkles" className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Pindai Struk AI</h3>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                  Gemini 2.5
                </span>
              </div>

              <div 
                onClick={() => fileInputRef.current.click()} 
                className="relative border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-emerald-500 hover:bg-slate-50/50 transition-all overflow-hidden"
              >
                {preview ? (
                  <img src={preview} className="max-h-36 mx-auto rounded-lg shadow-sm object-contain" alt="Struk Preview" />
                ) : (
                  <div className="py-3">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Icon name="upload" className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Unggah Foto Struk</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG atau screenshot</p>
                  </div>
                )}

                {scanning && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center">
                    <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs font-bold text-emerald-700">Menganalisis Struk...</p>
                  </div>
                )}
              </div>

              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={e => { 
                  const f = e.target.files[0]; 
                  if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }} 
              />

              {file && !scanning && (
                <button 
                  onClick={handleScan} 
                  className="btn-flux btn-flux-emerald !py-2.5 w-full text-xs font-semibold"
                >
                  Jalankan Ekstraksi AI
                </button>
              )}
            </section>

            {/* Manual / AI-populated Transaction Form */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {editId ? 'Edit Transaksi' : 'Catat Transaksi'}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Nama Merchant/Toko</label>
                  <input 
                    className="form-input" 
                    value={formData.nama_toko} 
                    onChange={e => setFormData({...formData, nama_toko: e.target.value})} 
                    placeholder="Contoh: Alfamart / SPBU" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Kategori</label>
                    <select 
                      className="form-input" 
                      value={formData.kategori} 
                      onChange={e => setFormData({...formData, kategori: e.target.value})}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Keterangan</label>
                    <input 
                      className="form-input" 
                      value={formData.keperluan} 
                      onChange={e => setFormData({...formData, keperluan: e.target.value})} 
                      placeholder="Contoh: Belanja dapur" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Total (Rp)</label>
                    <input 
                      className="form-input" 
                      value={formData.total_harga} 
                      onChange={e => setFormData({...formData, total_harga: e.target.value})} 
                      placeholder="50000" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Tanggal</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.tanggal} 
                      onChange={e => setFormData({...formData, tanggal: e.target.value})} 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSave} 
                  disabled={loading} 
                  className="btn-flux btn-flux-primary !py-3 w-full text-xs font-semibold mt-2"
                >
                  {loading ? 'Menyimpan ke Drive...' : (editId ? 'Simpan Perubahan' : 'Simpan & Arsip ke Drive')}
                </button>

                {editId && (
                  <button 
                    onClick={() => { setEditId(null); setFormData(INITIAL_FORM); }} 
                    className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium text-center"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </section>

            {/* Smart Insights Card */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="chart" className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Insight Cerdas</h3>
              </div>

              <div className="space-y-2">
                {stats.insights.map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
                    {insight}
                  </div>
                ))}
              </div>
            </section>

          </aside>

          {/* MAIN MONITORING ZONE */}
          <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
            
            {/* Period Selector Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Icon name="calendar" className="w-4 h-4 text-emerald-600" />
                <span>Periode Laporan</span>
              </div>

              <div className="flex gap-2">
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 transition-colors"
                  value={viewMonth}
                  onChange={e => setViewMonth(parseInt(e.target.value))}
                >
                  {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 transition-colors"
                  value={viewYear}
                  onChange={e => setViewYear(parseInt(e.target.value))}
                >
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Pengeluaran: {monthNames[viewMonth]} {viewYear}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {formatCurrency(stats.totalThisMonth)}
                </h3>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Total Transaksi Terarsip
                </p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {dataList.length} <span className="text-xs font-semibold text-slate-500">struk</span>
                </h3>
              </div>

              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle cursor-pointer hover:border-slate-300 transition-all"
                onClick={() => setShowBudgetPrompt(true)}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-slate-500">Realisasi Anggaran</p>
                  <span className="text-[11px] font-semibold text-emerald-600 hover:underline">Ubah Limit</span>
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {Math.round(stats.budgetPercent)}%
                  </h3>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        stats.budgetPercent > 90 ? 'bg-rose-500' : (stats.budgetPercent > 70 ? 'bg-amber-500' : 'bg-emerald-600')
                      }`} 
                      style={{ width: `${stats.budgetPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Charts Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Visualisasi Arus Kas
                </h3>
                
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  {[
                    { id: 'daily', label: 'Tren Harian' },
                    { id: 'monthly', label: 'Ringkasan Bulanan' },
                    { id: 'categories', label: 'Proporsi Kategori' }
                  ].map(tab => (
                    <button 
                      key={tab.id} 
                      onClick={() => setActiveInsightTab(tab.id)} 
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        activeInsightTab === tab.id 
                          ? 'bg-white text-slate-900 shadow-subtle' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {activeInsightTab === 'daily' ? (
                    <LineChart data={stats.chartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                        formatter={(val) => [formatCurrency(val), 'Pengeluaran']}
                      />
                      <Line type="monotone" dataKey="total" stroke="#059669" strokeWidth={2.5} dot={{ r: 2, fill: '#059669' }} activeDot={{ r: 5, fill: '#059669' }} />
                    </LineChart>
                  ) : activeInsightTab === 'monthly' ? (
                    <BarChart data={stats.barChartData.slice(-6)} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)} 
                        contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                      />
                      <Bar dataKey="total" fill="#059669" radius={[6, 6, 0, 0]} barSize={36} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie 
                        data={stats.pieChartData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={55} 
                        outerRadius={85} 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        {stats.pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => {
                          const percentage = ((value / stats.totalAll) * 100).toFixed(1);
                          return [`${formatCurrency(value)} (${percentage}%)`];
                        }} 
                        contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                      />
                      <Legend 
                        verticalAlign="middle" 
                        align="right" 
                        layout="vertical" 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '11px', fontWeight: '500', paddingLeft: '20px' }} 
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Ledger Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Buku Besar Transaksi
                  </h3>
                </div>

                <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative flex-1 sm:w-60">
                    <input 
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-600" 
                      placeholder="Cari transaksi..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                    />
                    <div className="absolute left-2.5 top-2 text-slate-400">
                      <Icon name="search" className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none"
                    value={filterCategory} 
                    onChange={e => setFilterCategory(e.target.value)}
                  >
                    <option value="Semua">Semua Kategori</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-6">Merchant & Keterangan</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...filteredData].reverse().map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{item.nama_toko || "Merchant"}</div>
                          <div className="text-[11px] text-slate-500">{item.keperluan || "-"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded text-[11px]">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{item.tanggal}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{formatCurrency(item.total_harga)}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {item.imageUrl && (
                              <a 
                                href={item.imageUrl} 
                                target="_blank" 
                                className="p-1 text-slate-400 hover:text-slate-800 transition-colors" 
                                title="Lihat Struk Drive"
                              >
                                📎
                              </a>
                            )}
                            <button 
                              onClick={() => { setEditId(item.id); setFormData(item); }} 
                              className="p-1 text-slate-400 hover:text-slate-800 transition-colors" 
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors" 
                              title="Hapus"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Budget Goal Modal Prompt */}
      {showBudgetPrompt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-popup">
            <h3 className="text-base font-bold text-slate-900 mb-1">Target Anggaran Bulanan</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Flux akan memberikan peringatan dini ketika pengeluaran Anda mencapai 80% dan 100% dari batas ini.
            </p>
            <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Batas Maksimal (Rp)</label>
            <input 
              type="number" 
              className="form-input mb-4 font-bold text-base" 
              value={budgetLimit} 
              onChange={e => setBudgetLimit(parseInt(e.target.value))} 
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowBudgetPrompt(false)} 
                className="btn-flux btn-flux-secondary !py-2 flex-1 text-xs"
              >
                Batal
              </button>
              <button 
                onClick={() => { 
                  localStorage.setItem('flux_budget', budgetLimit); 
                  setShowBudgetPrompt(false); 
                  showToast("Target Anggaran berhasil diperbarui!"); 
                }} 
                className="btn-flux btn-flux-primary !py-2 flex-1 text-xs"
              >
                Simpan Target
              </button>
            </div>
          </div>
        </div>
      )}

      <LegalModal />
      {renderToast()}
    </div>
  );
}
