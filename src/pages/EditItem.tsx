import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n';
import type { AminoItem, CardStats, Buff } from '../types';
import { Save, Trash2, ArrowLeft, Plus, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';

export default function EditItem() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem } = useAppStore();
  const { t } = useTranslation();
  
  const existingItem = id ? items.find(i => i.id === id) : null;
  
  const [formData, setFormData] = useState<AminoItem>({
    id: `item-${Date.now()}`,
    name: '',
    description: '',
    image: '',
    weight: 0,
    statModifiers: {},
    buffs: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingItem) {
      setFormData(existingItem);
    }
  }, [existingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingItem) {
      updateItem(existingItem.id, formData);
    } else {
      addItem(formData);
    }
    navigate('/items');
  };

  const handleDelete = () => {
    if (existingItem && window.confirm(t('editi.confirmDel'))) {
      deleteItem(existingItem.id);
      navigate('/items');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBuff = () => {
    const newBuff: Buff = {
      id: `buff-${Date.now()}`,
      name: t('editi.newBuff'),
      description: '',
      type: 'STAT_MODIFIER',
      duration: 0,
      value: 10,
      statTarget: 'maxHealth',
      isMultiplier: false,
    };
    setFormData(prev => ({ ...prev, buffs: [...prev.buffs, newBuff] }));
  };

  const handleUpdateBuff = (index: number, buff: Buff) => {
    setFormData(prev => {
      const newBuffs = [...prev.buffs];
      newBuffs[index] = buff;
      return { ...prev, buffs: newBuffs };
    });
  };

  const handleRemoveBuff = (index: number) => {
    setFormData(prev => ({ ...prev, buffs: prev.buffs.filter((_, i) => i !== index) }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {existingItem ? t('editi.titleEdit') : t('editi.titleAdd')}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Profile Card */}
        <div className="bg-white dark:bg-[#1f2937] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <div 
              className="w-32 h-32 rounded-[1.5rem] bg-slate-50 dark:bg-[#111827] border-2 border-dashed border-purple-400/30 flex items-center justify-center text-5xl shadow-inner cursor-pointer hover:border-purple-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all overflow-hidden relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.image?.startsWith('data:image') ? (
                <img src={formData.image} alt="Item" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold shadow-sm">{t('editu.upload')}</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Item Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" 
                placeholder="e.g. Glowing Catalyst"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow h-24 resize-none" 
                placeholder="What does this item do...?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Buff Patterns Section */}
        <div className="bg-white dark:bg-[#1f2937] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-xl text-lg">✨</span> 
              {t('editi.buffs')}
            </h2>
            <button 
              type="button" 
              onClick={handleAddBuff} 
              className="flex items-center px-4 py-2 text-sm font-bold bg-white dark:bg-[#1f2937] border-2 border-purple-200 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> {t('editi.btnAddBuff')}
            </button>
          </div>

          {formData.buffs.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-[#111827] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('editi.noBuffs')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.buffs.map((buff, idx) => (
                <div key={idx} className="p-5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl relative group">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveBuff(idx)} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Buff Name</label>
                      <input 
                        type="text" 
                        className="px-3 py-1.5 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" 
                        value={buff.name} 
                        onChange={(e) => handleUpdateBuff(idx, {...buff, name: e.target.value})} 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Type</label>
                      <select 
                        className="px-3 py-1.5 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow appearance-none cursor-pointer" 
                        value={buff.type} 
                        onChange={(e) => handleUpdateBuff(idx, {...buff, type: e.target.value as 'STAT_MODIFIER' | 'UNIQUE_EFFECT'})}
                      >
                        <option value="STAT_MODIFIER">Stat Modifier</option>
                        <option value="UNIQUE_EFFECT">Unique Effect</option>
                      </select>
                    </div>
                    
                    {buff.type === 'STAT_MODIFIER' && (
                      <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Stat</label>
                       <select 
                          className="px-3 py-1.5 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow appearance-none cursor-pointer" 
                          value={buff.statTarget || 'maxHealth'} 
                          onChange={(e) => handleUpdateBuff(idx, {...buff, statTarget: e.target.value as keyof CardStats})}
                        >
                         {[
                            'maxHealth', 'attackDamage', 'healAmount', 'defense', 'maxPenetration', 'knockbackForce',
                            'range', 'critChance', 'critMultiplier', 'projectileSpeed', 'flightTime', 'magazineSize',
                            'burstCount', 'reloadTime', 'splashRadius', 'slowAmount', 'damagePerTick', 'areaAttackDelay',
                            'areaRadius', 'areaDuration', 'atpDropBonusRate'
                          ].map(s => (
                           <option key={s} value={s}>{s}</option>
                         ))}
                       </select>
                      </div>
                    )}
                    
                    <div className="flex flex-row gap-3">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Value</label>
                        <input 
                          type="number" 
                          step="any" 
                          className="px-3 py-1.5 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow w-full" 
                          value={buff.value} 
                          onChange={(e) => handleUpdateBuff(idx, {...buff, value: parseFloat(e.target.value) || 0})} 
                        />
                      </div>
                      {buff.type === 'STAT_MODIFIER' && (
                        <div className="flex items-end pb-0.5">
                           <label className="flex items-center gap-2 bg-white dark:bg-[#1f2937] px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                             <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-purple-600 bg-slate-100 border-slate-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-slate-900 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer" 
                                checked={buff.isMultiplier} 
                                onChange={(e) => handleUpdateBuff(idx, {...buff, isMultiplier: e.target.checked})} 
                              />
                             <span className="font-bold text-xs text-slate-700 dark:text-slate-300 select-none">%</span>
                           </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {existingItem && (
             <button type="button" onClick={handleDelete} className="px-6 py-2.5 bg-white dark:bg-[#1f2937] border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-full transition-colors flex items-center shadow-sm">
               <Trash2 className="w-4 h-4 mr-2" /> {t('editu.btnDelete')}
             </button>
          )}
          <button type="submit" className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors flex items-center shadow-lg shadow-purple-500/30">
            <Save className="w-5 h-5 mr-2" /> {existingItem ? t('editu.btnUpdate') : t('editi.btnSave')}
          </button>
        </div>
      </form>
    </div>
  );
}
