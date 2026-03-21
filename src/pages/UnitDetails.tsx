import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import type { CardStats } from '../types';
import { HeartPulse, Swords, Shield, Zap, RefreshCw, Sparkles, Image as ImageIcon, ArrowLeft, Edit, ChevronLeft, ChevronRight, X } from 'lucide-react';
import HexGrid from '../components/HexGrid';

export default function UnitDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { units } = useAppStore();

  const unit = units.find(u => u.id === id);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const images = unit?.images?.length ? unit.images : (unit?.image ? [unit.image] : []);
  const activeImage = images.length > 0 ? images[activeImageIdx] : null;

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveImageIdx(prev => (prev < images.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIdx(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, images.length]);

  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <h2 className="text-3xl font-bold mb-4">Unit not found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-500 text-white rounded-full">Go Back</button>
      </div>
    );
  }

  const renderStatComp = (statKey: keyof CardStats, label: string, icon: React.ReactNode) => {
    const val = unit.baseStats[statKey];
    if (typeof val !== 'number') return null;

    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1f2937] rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-300">
          {icon} <span>{label}</span>
        </div>
        <div className="font-extrabold text-slate-900 dark:text-white">
          {val.toFixed(1)}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Link to={`/edit-unit/${unit.id}`} className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-lg shadow-blue-500/30">
          <Edit className="w-4 h-4 mr-2" /> Edit Unit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Images */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <button 
              type="button" 
              onClick={() => { if(activeImage) setIsModalOpen(true); }}
              className="w-full aspect-square bg-slate-50 dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex items-center justify-center cursor-pointer group hover:border-blue-500/50 transition-colors relative"
            >
              {activeImage ? (
                <>
                  <img src={activeImage} alt={unit.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </>
              ) : (
                <ImageIcon className="w-24 h-24 text-slate-300 dark:text-slate-700" />
              )}
            </button>
            <p className="mt-3 text-sm font-bold text-slate-400 dark:text-slate-500 select-none">
              👆 사진을 눌러 자세히 볼 수 있습니다
            </p>
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                    idx === activeImageIdx ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Info & Stats */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <div className="bg-white dark:bg-[#1f2937] p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">{unit.name}</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
              {unit.description || "A mysterious lifeform ready for battle."}
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Stats */}
            <div className="bg-white dark:bg-[#1f2937] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" /> Base Stats
              </h3>
              <div className="flex flex-col gap-3">
                {renderStatComp('maxHealth', 'Max HP', <HeartPulse className="w-5 h-5 text-rose-500" />)}
                {renderStatComp('attackDamage', 'Damage', <Swords className="w-5 h-5 text-orange-500" />)}
                {renderStatComp('defense', 'Defense', <Shield className="w-5 h-5 text-sky-500" />)}
                {renderStatComp('critChance', 'Crit Chance', <Zap className="w-5 h-5 text-yellow-500" />)}
                {renderStatComp('critMultiplier', 'Crit Mult', <Zap className="w-5 h-5 text-yellow-600" />)}
                {renderStatComp('healAmount', 'Heal Amount', <HeartPulse className="w-5 h-5 text-rose-400" />)}
                {renderStatComp('maxPenetration', 'Penetration', <Swords className="w-5 h-5 text-purple-500" />)}
                {renderStatComp('projectileSpeed', 'Proj Speed', <Zap className="w-5 h-5 text-indigo-400" />)}
                {renderStatComp('reloadTime', 'Reload Base', <RefreshCw className="w-5 h-5 text-sky-400" />)}
              </div>
            </div>

            {/* Pattern & Effects */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-[#1f2937] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" /> Action Pattern
                </h3>
                <div className="bg-slate-50 dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex justify-center">
                  <HexGrid pattern={unit.buffPattern} readOnly={true} />
                </div>
              </div>

              {unit.innateBuffs.length > 0 && (
                <div className="bg-white dark:bg-[#1f2937] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" /> Innate Abilities
                  </h3>
                  <div className="flex flex-col gap-3">
                    {unit.innateBuffs.map((buff, idx) => (
                      <div key={idx} className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl p-4">
                        <div className="font-bold text-indigo-700 dark:text-indigo-400 mb-1">{buff.name}</div>
                        {buff.description && <div className="text-sm text-indigo-600/80 dark:text-indigo-300/80 font-medium">{buff.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isModalOpen && activeImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <button 
            type="button" 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[61]"
          >
            <X className="w-8 h-8" />
          </button>
          
          {images.length > 1 && activeImageIdx > 0 && (
             <button 
               type="button"
               onClick={() => setActiveImageIdx(prev => prev - 1)}
               className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[61]"
             >
               <ChevronLeft className="w-12 h-12" />
             </button>
          )}

          <img 
            src={activeImage} 
            alt="Fullscreen Detail" 
            className="w-full h-full max-w-7xl object-contain p-4 md:p-12 animate-in zoom-in-95 duration-300" 
          />

          {images.length > 1 && activeImageIdx < images.length - 1 && (
             <button 
               type="button"
               onClick={() => setActiveImageIdx(prev => prev + 1)}
               className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[61]"
             >
               <ChevronRight className="w-12 h-12" />
             </button>
          )}
        </div>
      )}
    </div>
  );
}
