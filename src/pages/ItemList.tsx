import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';

export default function ItemList() {
  const items = useAppStore((state) => state.items);
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            {t('itemlist.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{t('itemlist.subtitle')}</p>
        </div>
        <Link to="/edit-item" className="flex items-center px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-1">
          <PlusCircle className="mr-2 w-5 h-5" /> {t('itemlist.btnItem')}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">{t('itemlist.emptyTitle')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t('itemlist.emptySub')}</p>
          <Link to="/edit-item" className="inline-flex items-center px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-full transition-colors">{t('itemlist.btnItem')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link key={item.id} to={`/edit-item/${item.id}`} className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden flex flex-col aspect-[3/4] border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:-translate-y-1">
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-slate-100/50 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Image Section */}
              <div className="aspect-square w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-center">
                {item.image?.startsWith('data:image') ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-slate-400 dark:text-slate-600" />
                )}
              </div>

              {/* Bottom Info Overlay */}
              <div className="flex-1 px-4 py-4 flex flex-col justify-center text-center">
                <h3 className="text-lg font-bold line-clamp-1 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors text-slate-800 dark:text-slate-100">{item.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed font-medium">{item.description || 'A mysterious artifact.'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
