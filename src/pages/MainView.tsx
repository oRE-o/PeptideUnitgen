import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n';
import { PlusCircle, Image as ImageIcon, Search, ArrowDownAZ, Shuffle, LayoutGrid, Grid2X2, Grid3X3 } from 'lucide-react';

export default function MainView() {
  const units = useAppStore((state) => state.units);
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'name' | 'random'>('name');
  const [randomSeed, setRandomSeed] = useState(0);
  const [tileSize, setTileSize] = useState<'large' | 'medium' | 'small'>('medium');

  const handleRandomize = () => {
    setSortMode('random');
    setRandomSeed(Math.random());
  };

  const randomizedUnits = useMemo(() => {
    return [...units].sort(() => Math.random() - 0.5);
  }, [units, randomSeed]);

  const baseUnits = sortMode === 'name' ? [...units].sort((a,b) => a.name.localeCompare(b.name)) : randomizedUnits;
  const displayUnits = baseUnits.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getGridClasses = () => {
    switch (tileSize) {
       case 'large': return 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6';
       case 'medium': return 'grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4';
       case 'small': return 'grid-cols-4 lg:grid-cols-7 xl:grid-cols-10 gap-2 md:gap-3';
       default: return 'grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4';
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            {t('roster.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{t('roster.subtitle')}</p>
        </div>
        <Link to="/edit-unit" className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1">
          <PlusCircle className="mr-2 w-5 h-5" /> {t('roster.btnUnit')}
        </Link>
      </div>

      {/* Options Control Bar */}
      <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-3xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search characters by name..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-600 rounded-full text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
           <div className="flex bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-full p-1">
             <button 
               onClick={() => setSortMode('name')} 
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${sortMode === 'name' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
             >
               <ArrowDownAZ className="w-4 h-4" /> Name
             </button>
             <button 
               onClick={handleRandomize} 
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${sortMode === 'random' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
             >
               <Shuffle className="w-4 h-4" /> Random
             </button>
           </div>
           
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

           <div className="flex bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-full p-1">
             <button onClick={() => setTileSize('large')} title="Large Tiles" className={`p-1.5 rounded-full transition-colors ${tileSize === 'large' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
               <LayoutGrid className="w-4 h-4" />
             </button>
             <button onClick={() => setTileSize('medium')} title="Medium Tiles" className={`p-1.5 rounded-full transition-colors ${tileSize === 'medium' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
               <Grid2X2 className="w-4 h-4" />
             </button>
             <button onClick={() => setTileSize('small')} title="Small Tiles" className={`p-1.5 rounded-full transition-colors ${tileSize === 'small' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
               <Grid3X3 className="w-4 h-4" />
             </button>
           </div>
        </div>
      </div>

      {displayUnits.length === 0 ? (
        <div className="text-center py-20 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <div className="text-6xl mb-4">🥺</div>
          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">No characters found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or add a new character!</p>
          <Link to="/edit-unit" className="inline-flex items-center px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-full transition-colors">{t('roster.btnUnit')}</Link>
        </div>
      ) : (
        <div className={`grid ${getGridClasses()}`}>
          {displayUnits.map((unit) => (
            <Link key={unit.id} to={`/unit/${unit.id}`} className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col aspect-[3/4] border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:-translate-y-1">
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-slate-100/50 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Image Section */}
              <div className="aspect-square w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-center">
                {(unit.images?.[0] || unit.image)?.startsWith('data:image') ? (
                  <img src={unit.images?.[0] || unit.image} alt={unit.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-slate-400 dark:text-slate-600" />
                )}
              </div>

              {/* Bottom Info Overlay */}
              <div className={`flex-1 flex flex-col justify-center text-center ${tileSize === 'small' ? 'px-1.5 py-1.5 md:py-2' : 'px-4 py-4'}`}>
                <h3 className={`font-bold line-clamp-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors text-slate-800 dark:text-slate-100 ${tileSize === 'small' ? 'text-xs md:text-sm' : 'text-sm md:text-lg'}`}>{unit.name}</h3>
                {tileSize !== 'small' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed font-medium">{unit.description || 'A mysterious new lifeform.'}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
