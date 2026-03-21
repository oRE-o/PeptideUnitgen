import { Link, useLocation } from 'react-router-dom';
import { Home, PackageOpen, FlaskConical, PlusCircle, Settings, Download, Upload } from 'lucide-react';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n';
import { useEffect, useRef } from 'react';
import { exportPresetToZip, importPresetFromZip } from '../utils/zipUtils';

export default function Navigation() {
  const location = useLocation();
  const { loadPreset, units, items, setLanguage } = useAppStore();
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleExport = async () => {
    try {
      const preset = { version: '1.0', units, items };
      const blob = await exportPresetToZip(preset);
      const url = URL.createObjectURL(blob);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", url);
      downloadAnchorNode.setAttribute("download", "peptide_preset.zip");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Export failed.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.json')) {
         // Legacy JSON import
         const reader = new FileReader();
         reader.onload = (event) => {
           try {
             const preset = JSON.parse(event.target?.result as string);
             if (preset && preset.version) {
               loadPreset(preset);
               alert(t('nav.successLoad'));
             }
           } catch (e) {}
         };
         reader.readAsText(file);
      } else if (file.name.endsWith('.zip')) {
         const preset = await importPresetFromZip(file);
         if (preset && preset.version) {
           loadPreset(preset);
           alert(t('nav.successLoad'));
         } else {
           alert(t('nav.failLoad'));
         }
      }
    } catch (err) {
      console.error(err);
      alert(t('nav.errorLoad'));
    }
    
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const navLinks = [
    { name: t('nav.characters'), path: '/', icon: Home },
    { name: t('nav.items'), path: '/items', icon: PackageOpen },
    { name: t('nav.lab'), path: '/lab', icon: FlaskConical },
  ];

  return (
    <div className="sticky top-0 z-50 pt-4 pb-2 px-4 flex justify-center pointer-events-none w-full">
      <nav className="pointer-events-auto w-full max-w-7xl bg-white/90 dark:bg-[#1f2937]/90 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-700 shadow-sm px-6 py-3 flex items-center justify-between transition-colors duration-200">
        
        {/* Logo Left */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-extrabold flex items-center gap-2 select-none group">
            <span className="text-blue-600 dark:text-blue-400">PeptideUnigen</span>
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Mobile Menu Dropdown (Simplified) */}
          <div className="md:hidden relative group">
            <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-2 overflow-hidden">
               {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${location.pathname === link.path ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <link.icon className="w-4 h-4" /> {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Language Dropdown */}
          <div className="relative group/lang">
            <button className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/50 flex items-center gap-1 font-bold">
              <span className="text-lg">🌐</span>
              <span className="text-xs uppercase">{language}</span>
            </button>
            <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg opacity-0 invisible group-focus-within/lang:opacity-100 group-focus-within/lang:visible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-200 z-50 flex flex-col py-2 overflow-hidden transform origin-top-right">
              <button onClick={() => setLanguage('en')} className={`w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${language === 'en' ? 'text-blue-500' : 'text-slate-700 dark:text-slate-300'}`}>
                🇺🇸 English
              </button>
              <button onClick={() => setLanguage('ko')} className={`w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${language === 'ko' ? 'text-blue-500' : 'text-slate-700 dark:text-slate-300'}`}>
                🇰🇷 한국어
              </button>
              <button onClick={() => setLanguage('ja')} className={`w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${language === 'ja' ? 'text-blue-500' : 'text-slate-700 dark:text-slate-300'}`}>
                🇯🇵 日本語
              </button>
            </div>
          </div>

          <button 
            onClick={() => {
              const html = document.documentElement;
              html.classList.toggle('dark');
            }} 
            className="group relative inline-flex h-7 w-12 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#1f2937] hover:bg-slate-300 dark:hover:bg-slate-600"
            role="switch"
            aria-label="Toggle Dark Mode"
          >
            <span className="inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 transition-transform translate-x-1 dark:translate-x-6 shadow-sm border border-slate-300 dark:border-slate-600 flex items-center justify-center">
              <span className="text-[10px] hidden dark:block text-slate-300">🌙</span>
              <span className="text-[10px] block dark:hidden text-amber-500">☀️</span>
            </span>
          </button>

          {/* Create Dropdown */}
          <div className="relative group/create">
            <button className="p-2 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <PlusCircle className="w-5 h-5" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg opacity-0 invisible group-focus-within/create:opacity-100 group-focus-within/create:visible group-hover/create:opacity-100 group-hover/create:visible transition-all duration-200 z-50 flex flex-col py-2 overflow-hidden transform origin-top-right">
              <Link to="/edit-unit" className="px-4 py-2.5 text-sm font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Home className="w-4 h-4" /> {t('nav.addUnit')}
              </Link>
              <Link to="/edit-item" className="px-4 py-2.5 text-sm font-semibold flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <PackageOpen className="w-4 h-4" /> {t('nav.addItem')}
              </Link>
            </div>
          </div>

          {/* Settings Dropdown */}
          <div className="relative group/settings">
            <button className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/50">
              <Settings className="w-5 h-5" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg opacity-0 invisible group-focus-within/settings:opacity-100 group-focus-within/settings:visible group-hover/settings:opacity-100 group-hover/settings:visible transition-all duration-200 z-50 flex flex-col py-2 overflow-hidden transform origin-top-right">
              <button onClick={handleExport} className="w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Download className="w-4 h-4" /> {t('nav.export')}
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full z-[51] text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative cursor-pointer">
                <Upload className="w-4 h-4 pointer-events-none" /> 
                <span className="pointer-events-none">{t('nav.import')}</span>
                <input 
                  type="file" 
                  accept=".json,.zip" 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                  ref={fileInputRef} 
                  onChange={handleImport} 
                />
              </button>
            </div>
          </div>
          
        </div>
      </nav>
    </div>
  );
}
