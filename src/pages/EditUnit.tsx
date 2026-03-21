import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n';
import type { AminoUnit, CardStats, AttackType } from '../types';
import { Save, Trash2, ArrowLeft, Hexagon, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import HexGrid from '../components/HexGrid';
import { useRef } from 'react';

const defaultStats: CardStats = {
  turretName: 'New Amino',
  deploymentCost: 10,
  totalWeight: 10,
  maxHealth: 100,
  attackDamage: 10,
  healAmount: 0,
  defense: 5,
  maxPenetration: 1,
  knockbackForce: 10,
  attackType: 'Direct',
  projectilePrefab: 'none',
  range: 50,
  critChance: 0.1,
  critMultiplier: 1.5,
  projectileSpeed: 50,
  flightTime: 2,
  magazineSize: 10,
  burstCount: 1,
  reloadTime: 1.5,
  hasSplash: false,
  splashRadius: 0,
  hasAreaEffect: false,
  slowAmount: 0,
  effectTypeId: 'None',
  damagePerTick: 0,
  areaAttackDelay: 0,
  areaRadius: 0,
  areaDuration: 0,
  atpDropBonusRate: 0,
};

export default function EditUnit() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { units, addUnit, updateUnit, deleteUnit } = useAppStore();
  const { t } = useTranslation();
  
  const existingUnit = id ? units.find(u => u.id === id) : null;
  
  const [formData, setFormData] = useState<AminoUnit>({
    id: `unit-${Date.now()}`,
    name: '',
    description: '',
    image: '',
    images: [],
    baseStats: { ...defaultStats },
    buffPattern: [],
    innateBuffs: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'basic' | 'combat' | 'attack' | 'special' | 'buffs'>('basic');

  useEffect(() => {
    if (existingUnit) {
      const normalized = { ...existingUnit };
      if (!normalized.images) {
        normalized.images = normalized.image ? [normalized.image] : [];
      }
      setFormData(normalized);
    }
  }, [existingUnit]);

  const handleStatChange = (stat: keyof CardStats, value: any) => {
    setFormData(prev => ({ ...prev, baseStats: { ...prev.baseStats, [stat]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingUnit) updateUnit(existingUnit.id, formData);
    else addUnit(formData);
    navigate('/');
  };

  const handleDelete = () => {
    if (existingUnit && window.confirm(t('editu.confirmDel'))) {
      deleteUnit(existingUnit.id);
      navigate('/');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const updatedImages = [...(prev.images || []), reader.result as string];
          return { ...prev, images: updatedImages, image: updatedImages[0] };
        });
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      if (index + direction < 0 || index + direction >= newImages.length) return prev;
      
      const temp = newImages[index];
      newImages[index] = newImages[index + direction];
      newImages[index + direction] = temp;
      
      return { ...prev, images: newImages, image: newImages[0] };
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages, image: newImages[0] || '' };
    });
  };

  const TabButton = ({ id, label, icon: Icon }: { id: any, label: string, icon?: any }) => {
    const isActive = activeTab === id;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${
          isActive 
            ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 border border-transparent' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-transparent'
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </button>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {existingUnit ? t('editu.titleEdit') : t('editu.titleAdd')}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Profile Card */}
        <div className="bg-white dark:bg-[#1f2937] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Images</span>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar items-center pb-2 max-w-full md:max-w-xs lg:max-w-sm">
              {(formData.images || []).map((imgUrl, idx) => (
                <div key={idx} className="relative w-24 h-24 shrink-0 rounded-[1rem] border-2 border-slate-200 dark:border-slate-700 overflow-hidden group">
                  <img src={imgUrl} alt={`Unit-${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => removeImage(idx)} className="self-end p-1 hover:bg-red-500 rounded-full text-white transition-colors bg-black/40">
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex gap-2 mb-1">
                      {idx > 0 && (
                        <button type="button" onClick={() => moveImage(idx, -1)} className="p-1 hover:bg-blue-500 rounded-full text-white transition-colors bg-black/40">
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      )}
                      {idx < (formData.images?.length || 0) - 1 && (
                        <button type="button" onClick={() => moveImage(idx, 1)} className="p-1 hover:bg-blue-500 rounded-full text-white transition-colors bg-black/40">
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {idx === 0 && <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-br-lg shadow">Main</div>}
                </div>
              ))}
              <div 
                className="w-24 h-24 shrink-0 rounded-[1rem] bg-slate-50 dark:bg-[#111827] border-2 border-dashed border-blue-400/30 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-6 h-6 mb-1 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-bold group-hover:text-blue-500 text-slate-400">Add Photo</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Display Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                placeholder="e.g. L-Leucine"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow h-24 resize-none" 
                placeholder="A brief description of this amino acid..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Details & Stats Card */}
        <div className="bg-white dark:bg-[#1f2937] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          
          {/* Blue Archive Style Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-4 border-b border-slate-200 dark:border-slate-700 hide-scrollbar">
            <TabButton id="basic" label={t('editu.tabBasic')} />
            <TabButton id="combat" label={t('editu.tabCombat')} />
            <TabButton id="attack" label={t('editu.tabAttack')} />
            <TabButton id="special" label={t('editu.tabSpecial')} />
            <TabButton id="buffs" label={t('editu.tabBuffs')} icon={Hexagon} />
          </div>

          <div className="min-h-[250px]">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Turret Name (ID)" value={formData.baseStats.turretName} type="text" onChange={(v) => handleStatChange('turretName', v)} />
                <FormInput label="Deployment Cost" value={formData.baseStats.deploymentCost} onChange={(v) => handleStatChange('deploymentCost', v)} />
                <FormInput label="Total Weight" value={formData.baseStats.totalWeight} onChange={(v) => handleStatChange('totalWeight', v)} />
                <FormInput label="ATP Drop Bonus Rate" value={formData.baseStats.atpDropBonusRate} onChange={(v) => handleStatChange('atpDropBonusRate', v)} />
              </div>
            )}

            {activeTab === 'combat' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Max Health" value={formData.baseStats.maxHealth} onChange={(v) => handleStatChange('maxHealth', v)} />
                <FormInput label="Attack Damage" value={formData.baseStats.attackDamage} onChange={(v) => handleStatChange('attackDamage', v)} />
                <FormInput label="Heal Amount" value={formData.baseStats.healAmount} onChange={(v) => handleStatChange('healAmount', v)} />
                <FormInput label="Defense" value={formData.baseStats.defense} onChange={(v) => handleStatChange('defense', v)} />
                <FormInput label="Max Penetration" value={formData.baseStats.maxPenetration} onChange={(v) => handleStatChange('maxPenetration', v)} />
                <FormInput label="Knockback Force" value={formData.baseStats.knockbackForce} onChange={(v) => handleStatChange('knockbackForce', v)} />
              </div>
            )}

            {activeTab === 'attack' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Attack Type</label>
                  <select 
                    className="px-3 py-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none cursor-pointer" 
                    value={formData.baseStats.attackType} 
                    onChange={(e) => handleStatChange('attackType', e.target.value as AttackType)}
                  >
                    <option value="Direct">Direct</option>
                    <option value="Shotgun">Shotgun</option>
                    <option value="Mortar">Mortar</option>
                  </select>
                </div>
                <FormInput label="Range" value={formData.baseStats.range} onChange={(v) => handleStatChange('range', v)} />
                <FormInput label="Projectile Prefab" value={formData.baseStats.projectilePrefab} type="text" onChange={(v) => handleStatChange('projectilePrefab', v)} />
                <FormInput label="Projectile Speed" value={formData.baseStats.projectileSpeed} onChange={(v) => handleStatChange('projectileSpeed', v)} />
                <FormInput label="Flight Time" value={formData.baseStats.flightTime} onChange={(v) => handleStatChange('flightTime', v)} />
                
                <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Critical & Magazine</h4>
                </div>
                
                <FormInput label="Crit Chance (0-1)" value={formData.baseStats.critChance} onChange={(v) => handleStatChange('critChance', v)} step="0.01" />
                <FormInput label="Crit Multiplier" value={formData.baseStats.critMultiplier} onChange={(v) => handleStatChange('critMultiplier', v)} />
                <FormInput label="Magazine Size" value={formData.baseStats.magazineSize} onChange={(v) => handleStatChange('magazineSize', v)} />
                <FormInput label="Burst Count" value={formData.baseStats.burstCount} onChange={(v) => handleStatChange('burstCount', v)} />
                <FormInput label="Reload Time" value={formData.baseStats.reloadTime} onChange={(v) => handleStatChange('reloadTime', v)} />
              </div>
            )}

            {activeTab === 'special' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer select-none mb-4 group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-blue-600 bg-white border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer" 
                      checked={formData.baseStats.hasSplash} 
                      onChange={(e) => handleStatChange('hasSplash', e.target.checked)} 
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Has Splash Damage</span>
                  </label>
                  {formData.baseStats.hasSplash && (
                    <FormInput label="Splash Radius" value={formData.baseStats.splashRadius} onChange={(v) => handleStatChange('splashRadius', v)} />
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer select-none mb-4 group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-blue-600 bg-white border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer" 
                      checked={formData.baseStats.hasAreaEffect} 
                      onChange={(e) => handleStatChange('hasAreaEffect', e.target.checked)} 
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Has Area Effect (Aura)</span>
                  </label>
                  {formData.baseStats.hasAreaEffect && (
                    <div className="space-y-4">
                      <FormInput label="Effect Type ID" type="text" value={formData.baseStats.effectTypeId} onChange={(v) => handleStatChange('effectTypeId', v)} />
                      <FormInput label="Damage Per Tick" value={formData.baseStats.damagePerTick} onChange={(v) => handleStatChange('damagePerTick', v)} />
                      <FormInput label="Area Attack Delay" value={formData.baseStats.areaAttackDelay} onChange={(v) => handleStatChange('areaAttackDelay', v)} />
                      <FormInput label="Area Radius" value={formData.baseStats.areaRadius} onChange={(v) => handleStatChange('areaRadius', v)} />
                      <FormInput label="Area Duration" value={formData.baseStats.areaDuration} onChange={(v) => handleStatChange('areaDuration', v)} />
                      <FormInput label="Slow Amount (0-1)" value={formData.baseStats.slowAmount} onChange={(v) => handleStatChange('slowAmount', v)} step="0.01" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'buffs' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                  <Hexagon className="text-purple-500 w-5 h-5" /> 
                  <h3>Buff Pattern Target Area</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                  Click the hexes around the center to define where this Amino-chan will transmit its buffs relative to its position on the board.
                </p>
                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex justify-center mt-2">
                  <HexGrid 
                    pattern={formData.buffPattern} 
                    onChange={(newPattern) => setFormData(prev => ({...prev, buffPattern: newPattern}))} 
                  />
                </div>
                <div className="mt-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-3 rounded-xl break-words border border-slate-200 dark:border-slate-700">
                  Pattern: {JSON.stringify(formData.buffPattern)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {existingUnit && (
             <button type="button" onClick={handleDelete} className="px-6 py-2.5 bg-white dark:bg-[#1f2937] border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-full transition-colors flex items-center shadow-sm">
               <Trash2 className="w-4 h-4 mr-2" /> {t('editu.btnDelete')}
             </button>
          )}
          <button type="submit" className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors flex items-center shadow-lg shadow-blue-500/30">
            <Save className="w-5 h-5 mr-2" /> {existingUnit ? t('editu.btnUpdate') : t('editu.btnSave')}
          </button>
        </div>
      </form>
    </div>
  );
}

// Small helper component
function FormInput({ label, value, onChange, type = "number", step = "any" }: { label: string, value: any, onChange: (val: any) => void, type?: string, step?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>
      <input 
        type={type} 
        step={type === 'number' ? step : undefined}
        className="px-3 py-2 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow w-full" 
        value={value}
        onChange={(e) => onChange(type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
      />
    </div>
  );
}
