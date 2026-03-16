import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { Sparkles } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#1f2937] text-slate-800 dark:text-slate-200 font-sans overflow-x-hidden transition-colors duration-200">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white dark:bg-[#111827] rounded-xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200 min-h-[70vh]">
          <Outlet />
        </div>
      </main>

      <footer className="py-6 text-center text-slate-500 dark:text-slate-400 text-sm mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111827]/50">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 font-bold select-none">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>Peptide Unitgen</span>
          </div>
          <p>Made with love for Amino-chan 💖</p>
        </div>
      </footer>
    </div>
  );
}
