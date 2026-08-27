import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';

interface ExportDataButtonProps {
  variant?: 'primary' | 'secondary' | 'compact';
  label?: string;
}

export const ExportDataButton: React.FC<ExportDataButtonProps> = ({
  variant = 'primary',
  label = 'Export',
}) => {
  const { currentRole, profile } = useAuth();
  const { activeBranch } = useBranch();
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);

  const generateReportData = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString();

    return {
      dateStr,
      timeStr,
      meta: [
        `FABRIQ AI ENTERPRISE ERP REPORT`,
        `Role: ${currentRole.toUpperCase()} - ${profile?.name}`,
        `Branch: ${activeBranch.name} (${activeBranch.city})`,
        `Generated: ${dateStr} ${timeStr}`,
      ],
      rows: [
        ['Store Code', 'Branch Name', 'City', 'Monthly Revenue', 'Orders', 'Margin %', 'Status'],
        ['HYD-JUB-101', 'Jubilee Hills Atelier', 'Hyderabad', '₹19,50,000', '1650', '35.5%', 'Top Performer'],
        ['HYD-BAN-102', 'Banjara Hills Lounge', 'Hyderabad', '₹14,20,000', '980', '32.1%', 'High Margin'],
        ['HYD-GAC-103', 'Gachibowli Hub', 'Hyderabad', '₹12,80,000', '850', '29.8%', 'Steady'],
        ['BLR-IND-201', 'Indiranagar 100ft Studio', 'Bangalore', '₹16,40,000', '1120', '33.4%', 'Fast Growth'],
        ['LON-MAY-301', 'Mayfair Flagship AI Lab', 'London', '₹22,10,000', '1890', '36.0%', 'Global Flagship'],
      ],
    };
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    setActiveFormat('CSV');
    setTimeout(() => {
      const data = generateReportData();
      const csvLines = [
        data.meta.join(' | '),
        '',
        ...data.rows.map((row) => row.join(',')),
      ];
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FabriQ_AI_${currentRole}_Report_${data.dateStr}.csv`;
      link.click();
      setIsExporting(false);
      setShowMenu(false);
      alert(`✅ Report exported as CSV for ${profile?.name || currentRole}`);
    }, 400);
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    setActiveFormat('Excel');
    setTimeout(() => {
      const data = generateReportData();
      let xmlContent = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="FabriQ AI ERP">
<Table>`;
      data.rows.forEach((row) => {
        xmlContent += '<Row>';
        row.forEach((cell) => {
          xmlContent += `<Cell><Data ss:Type="String">${cell}</Data></Cell>`;
        });
        xmlContent += '</Row>';
      });
      xmlContent += '</Table></Worksheet></Workbook>';

      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FabriQ_AI_${currentRole}_Report_${data.dateStr}.xls`;
      link.click();
      setIsExporting(false);
      setShowMenu(false);
      alert(`✅ Report exported as Excel (.xls/.xlsx) spreadsheet!`);
    }, 400);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setActiveFormat('PDF');
    setTimeout(() => {
      const data = generateReportData();
      const pdfWindow = window.open('', '_blank');
      if (pdfWindow) {
        pdfWindow.document.write(`
          <html>
            <head>
              <title>FabriQ AI Enterprise PDF Report - ${data.dateStr}</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #0f172a; }
                h1 { color: #d97706; margin-bottom: 5px; }
                .meta { background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; }
                th { background: #0f172a; color: #fbbf24; text-align: left; padding: 10px; }
                td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <h1>FabriQ AI Enterprise Report</h1>
              <div class="meta">${data.meta.join('<br>')}</div>
              <table>
                <thead>
                  <tr>${data.rows[0].map((h) => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${data.rows
                    .slice(1)
                    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
                    .join('')}
                </tbody>
              </table>
              <script>window.onload = function() { window.print(); }</script>
            </body>
          </html>
        `);
      }
      setIsExporting(false);
      setShowMenu(false);
    }, 400);
  };

  const handlePrint = () => {
    setShowMenu(false);
    window.print();
  };

  const handleEmailReport = () => {
    setIsExporting(true);
    setActiveFormat('Email');
    setTimeout(() => {
      setIsExporting(false);
      setShowMenu(false);
      alert(`✉️ Executive report dispatched to: ${profile?.email || 'executive@fabriq.ai'}`);
    }, 500);
  };

  return (
    <div className="relative inline-block text-left">
      {variant === 'compact' ? (
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isExporting}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer fabriq-emboss"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span>{isExporting ? `Exporting (${activeFormat})...` : label}</span>
          <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
        </button>
      ) : (
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isExporting}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-300/40 fabriq-glow"
        >
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>{isExporting ? `Generating ${activeFormat}...` : `${label} Report`}</span>
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </button>
      )}

      {/* DROPDOWN MENU */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-amber-400/50 shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-in fade-in">
          <div className="px-3.5 py-2.5 bg-slate-950">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              EXPORT REPORT FORMAT
            </span>
            <span className="text-[11px] text-slate-400 truncate block">
              {profile?.name || currentRole}
            </span>
          </div>

          <div className="p-1 space-y-0.5">
            <button
              onClick={handleExportExcel}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-2 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">table_chart</span>
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-2 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[16px] text-sky-400">csv</span>
              <span>CSV Spreadsheet</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-2 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[16px] text-rose-400">picture_as_pdf</span>
              <span>PDF Document</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-2 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[16px] text-purple-400">print</span>
              <span>Print Dashboard</span>
            </button>

            <button
              onClick={handleEmailReport}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-2 cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">mail</span>
              <span>Email Executive PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
