import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n';
import type { CardStats, AminoItem } from '../types';
import { Plus, X, HeartPulse, Swords, Shield, Zap, RefreshCw, BarChart, Sparkles, Image as ImageIcon, Search } from 'lucide-react';
import HexGrid from '../components/HexGrid';

export default function LabView() {
  const { units, items } = useAppStore();
  const { t } = useTranslation();
  
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<[string | null, string | null]>([null, null]);

  // Modal State
  const [modalType, setModalType] = useState<'unit' | 'item' | null>(null);
  const [activeItemSlot, setActiveItemSlot] = useState<0 | 1>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedUnit = useMemo(() => units.find(u => u.id === selectedUnitId), [units, selectedUnitId]);
  const selectedItems = useMemo(() => [
    items.find(i => i.id === selectedItemIds[0]),
    items.find(i => i.id === selectedItemIds[1])
  ].filter(Boolean) as AminoItem[], [items, selectedItemIds]);

  const finalStats = useMemo(() => {
    if (!selectedUnit) return null;
    let stats: any = { ...selectedUnit.baseStats };

    selectedItems.forEach(item => {
      Object.keys(item.statModifiers).forEach(key => {
        const k = key as keyof CardStats;
        if (item.statModifiers[k] !== undefined) {
          stats[k] = (stats[k] || 0) + (item.statModifiers[k] as number);
        }
      });
    });

    const allBuffs = [...selectedUnit.innateBuffs, ...selectedItems.flatMap(i => i.buffs)];
    const statBuffs = allBuffs.filter(b => b.type === 'STAT_MODIFIER' && b.statTarget);

    statBuffs.forEach(buff => {
      if (buff.isMultiplier && buff.statTarget) stats[buff.statTarget] = (stats[buff.statTarget] as number) * (1 + buff.value / 100);
    });

    statBuffs.forEach(buff => {
      if (!buff.isMultiplier && buff.statTarget) stats[buff.statTarget] = (stats[buff.statTarget] as number) + buff.value;
    });

    return stats as CardStats;
  }, [selectedUnit, selectedItems]);

  const activeEffects = useMemo(() => {
    if (!selectedUnit) return [];
    return [...selectedUnit.innateBuffs, ...selectedItems.flatMap(i => i.buffs)].filter(b => b.type === 'UNIQUE_EFFECT');
  }, [selectedUnit, selectedItems]);

  const combinedBuffPattern = useMemo(() => {
    if (!selectedUnit) return [];
    // Currently items don't have their own buff patterns in types, but if they did we'd merge them here.
    // For now, it just visualizes the unit's innate pattern.
    return selectedUnit.buffPattern;
  }, [selectedUnit]);

  // Modal Handlers
  const openUnitModal = () => { setModalType('unit'); setSearchQuery(''); };
  const openItemModal = (slot: 0 | 1) => { setModalType('item'); setActiveItemSlot(slot); setSearchQuery(''); };
  const closeModal = () => setModalType(null);

  const selectUnit = (id: string) => { setSelectedUnitId(id); closeModal(); };
  const selectItem = (id: string) => { 
    const newItems = [...selectedItemIds] as [string | null, string | null];
    newItems[activeItemSlot] = id;
    setSelectedItemIds(newItems);
    closeModal();
  };
  const removeItem = (slot: 0 | 1, e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = [...selectedItemIds] as [string | null, string | null];
    newItems[slot] = null;
    setSelectedItemIds(newItems);
  };

  const filteredUnits = units.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderSlotImage = (imageStr: string | undefined, _sizeClass: string = 'w-16 h-16', fallbackIconClass: string = 'w-6 h-6') => {
    if (imageStr?.startsWith('data:image')) return <img src={imageStr} alt="" className="w-full h-full object-cover" />;
    return <ImageIcon className={`${fallbackIconClass} text-slate-400`} />;
  };

  const renderStatComp = (statKey: keyof CardStats, label: string, icon: React.ReactNode) => {
    if (!selectedUnit || !finalStats) return null;
    const baseVal = selectedUnit.baseStats[statKey];
    const finalVal = finalStats[statKey];
    if (typeof baseVal !== 'number' || typeof finalVal !== 'number') return null;

    const base = baseVal as number;
    const final = finalVal as number;
    const diff = final - base;

    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1f2937] rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-300">
          {icon} <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {diff !== 0 && <span className="text-slate-400 line-through text-xs font-medium">{base.toFixed(1)}</span>}
          <span className="font-bold text-slate-900 dark:text-white">{final.toFixed(1)}</span>
          {diff !== 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${diff > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {diff > 0 ? '+' : ''}{diff.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 flex justify-center items-center gap-3">
          <BarChart className="w-8 h-8 text-blue-500" /> {t('lab.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">{t('lab.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Selection Area (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-6">
            
            {/* Subject Slot */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="text-lg">🧪</span> {t('lab.subject')}
              </h2>
              <button 
                onClick={openUnitModal}
                className="w-full flex items-center p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-[#1f2937] transition-all group"
              >
                <div className="w-16 h-16 rounded-[1rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner">
                  {selectedUnit ? renderSlotImage(selectedUnit.image) : <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />}
                </div>
                <div className="ml-4 text-left">
                  <div className={`font-bold text-lg ${selectedUnit ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {selectedUnit ? selectedUnit.name : t('lab.selectStudent')}
                  </div>
                  {selectedUnit && <div className="text-xs text-slate-500 font-medium">Lv. Max</div>}
                </div>
              </button>
            </div>

            {/* Item Slots */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="text-lg">📦</span> {t('lab.equip')}
              </h2>
              <div className="flex flex-col gap-3">
                {[0, 1].map((slot) => {
                  const itemId = selectedItemIds[slot as 0 | 1];
                  const item = items.find(i => i.id === itemId);
                  return (
                    <div key={slot} className="relative">
                      <button 
                        onClick={() => openItemModal(slot as 0 | 1)}
                        className={`w-full flex items-center p-3 rounded-2xl border-2 transition-all group ${item ? 'border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10' : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-[#1f2937]'}`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner">
                          {item ? renderSlotImage(item.image, 'w-12 h-12', 'w-5 h-5') : <Plus className="w-5 h-5 text-slate-400 group-hover:text-purple-500" />}
                        </div>
                        <div className="ml-4 text-left flex-1">
                          <div className={`font-bold text-sm ${item ? 'text-purple-700 dark:text-purple-300' : 'text-slate-400'}`}>
                            {item ? item.name : t('lab.equipItem')}
                          </div>
                          {item && <div className="text-xs text-purple-600/70 dark:text-purple-400/70 font-medium">{item.buffs.length} Buff(s)</div>}
                        </div>
                      </button>
                      {item && (
                        <button 
                          onClick={(e) => removeItem(slot as 0 | 1, e)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Results Area (Right) */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full flex flex-col">
            
            {!selectedUnit ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 p-12 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <BarChart className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">{t('lab.noSubject')}</h3>
                  <p className="text-sm font-medium max-w-sm">{t('lab.noSubjectSub')}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1f2937]">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[1.5rem] bg-white dark:bg-slate-800 flex items-center justify-center text-4xl shadow-md border-2 border-blue-500/30 overflow-hidden shrink-0">
                      {renderSlotImage(selectedUnit.image, 'w-24 h-24', 'w-10 h-10')}
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {selectedUnit.name}
                      </h2>
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-md line-clamp-2">
                        {selectedUnit.description || "A mysterious lifeform ready for battle."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left Column: Stats */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> {t('lab.projStats')}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {renderStatComp('maxHealth', 'Max HP', <HeartPulse className="w-4 h-4 text-rose-500" />)}
                      {renderStatComp('attackDamage', 'Damage', <Swords className="w-4 h-4 text-orange-500" />)}
                      {renderStatComp('defense', 'Defense', <Shield className="w-4 h-4 text-sky-500" />)}
                      {renderStatComp('critChance', 'Crit Chance', <Zap className="w-4 h-4 text-yellow-500" />)}
                      {renderStatComp('critMultiplier', 'Crit Mult', <Zap className="w-4 h-4 text-yellow-600" />)}
                      {renderStatComp('healAmount', 'Heal Amount', <HeartPulse className="w-4 h-4 text-rose-400" />)}
                      {renderStatComp('maxPenetration', 'Penetration', <Swords className="w-4 h-4 text-purple-500" />)}
                      {renderStatComp('projectileSpeed', 'Proj Speed', <Zap className="w-4 h-4 text-indigo-400" />)}
                      {renderStatComp('reloadTime', 'Reload Base', <RefreshCw className="w-4 h-4 text-sky-400" />)}
                    </div>

                    {activeEffects.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" /> {t('lab.passive')}
                        </h3>
                        <div className="flex flex-col gap-3">
                           {activeEffects.map((effect, idx) => (
                             <div key={idx} className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-2xl p-4">
                                <div className="font-bold text-purple-700 dark:text-purple-400 text-sm mb-1">{effect.name}</div>
                                {effect.description && <div className="text-xs text-purple-600/80 dark:text-purple-300/80 font-medium leading-relaxed">{effect.description}</div>}
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Buff Pattern */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BarChart className="w-4 h-4" /> {t('lab.buffRange')}
                    </h3>
                    <div className="p-4 bg-slate-50 dark:bg-[#1f2937] rounded-3xl border border-slate-200 dark:border-slate-700">
                       <HexGrid pattern={combinedBuffPattern} readOnly={true} />
                       <p className="text-center text-xs font-bold text-slate-400 mt-4">
                         {t('lab.hexLegend')}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Modal Backdrop */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1f2937] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {modalType === 'unit' ? t('lab.modalSub') : t('lab.modalEq')}
              </h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#111827]">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={modalType === 'unit' ? t('lab.searchChar') : t('lab.searchItem')}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#111827]">
              {modalType === 'unit' ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {filteredUnits.length > 0 ? filteredUnits.map(unit => (
                     <button 
                       key={unit.id}
                       onClick={() => selectUnit(unit.id)}
                       className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-blue-500 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                     >
                       <div className="w-16 h-16 rounded-[1rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0">
                          {renderSlotImage(unit.image)}
                       </div>
                       <div>
                         <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{unit.name}</div>
                         <div className="text-xs text-slate-500 font-medium">ATK: {unit.baseStats.attackDamage}</div>
                       </div>
                     </button>
                   )) : (
                     <div className="col-span-full text-center py-12 text-slate-400 font-medium">No characters found.</div>
                   )}
                 </div>
              ) : (
                 <div className="flex flex-col gap-3">
                   {filteredItems.length > 0 ? filteredItems.map(item => (
                     <button
                       key={item.id}
                       onClick={() => selectItem(item.id)}
                       className={`flex items-center gap-4 p-4 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-purple-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 text-left ${selectedItemIds.includes(item.id) ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}
                       disabled={selectedItemIds.includes(item.id)}
                     >
                       <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0">
                          {renderSlotImage(item.image, 'w-14 h-14', 'w-6 h-6')}
                       </div>
                       <div className="flex-1">
                         <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           {item.name}
                           {selectedItemIds.includes(item.id) && <span className="text-[10px] uppercase font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">Equipped</span>}
                         </div>
                         <div className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">{item.description}</div>
                       </div>
                       <div className="text-purple-600 dark:text-purple-400 font-bold text-sm flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full shrink-0">
                         {item.buffs.length} Buffs
                       </div>
                     </button>
                   )) : (
                     <div className="text-center py-12 text-slate-400 font-medium">No items found.</div>
                   )}
                 </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
