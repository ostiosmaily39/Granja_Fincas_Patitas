'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, X, Users } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/utils/supabase/client';

interface GenealogySectionProps {
  speciesId: string;
  sex: 'macho' | 'hembra';
  origin: 'nacido_en_finca' | 'adquirido_externo';
  onSelectMother: (id: string | null) => void;
  onSelectFather: (id: string | null, external?: string | null) => void;
  selectedMotherId?: string | null;
  selectedFatherId?: string | null;
  fatherExternal?: string | null;
}

// ✅ Tipo simplificado para animales en genealogía
interface AnimalOption {
  id: string;
  code: string;
  name: string | null;
  sex: string;
  species_id: string;
}

export default function GenealogySection({
  speciesId,
  sex,
  origin,
  onSelectMother,
  onSelectFather,
  selectedMotherId,
  selectedFatherId,
  fatherExternal,
}: GenealogySectionProps) {
  const supabase = createClient();
  
  const [mothers, setMothers] = useState<AnimalOption[]>([]);
  const [fathers, setFathers] = useState<AnimalOption[]>([]);
  const [searchMother, setSearchMother] = useState('');
  const [searchFather, setSearchFather] = useState('');
  const [showMotherResults, setShowMotherResults] = useState(false);
  const [showFatherResults, setShowFatherResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fatherExternalValue, setFatherExternalValue] = useState(fatherExternal || '');

  // ✅ Solo cargar si es "Nacido en la finca"
  const isEnabled = origin === 'nacido_en_finca';

  // Cargar padres/madres disponibles
  useEffect(() => {
    if (isEnabled && speciesId) {
      loadParents();
    }
  }, [isEnabled, speciesId]);

  const loadParents = async () => {
    try {
      setLoading(true);
      
      // Cargar madres (hembras, activas, misma especie)
      const { data: mothersData, error: mothersError } = await supabase
        .from('animals')
        .select('id, code, name, sex, species_id')
        .eq('species_id', speciesId)
        .eq('sex', 'hembra')
        .eq('status', 'activo')
        .order('code');

      if (!mothersError && mothersData) {
        setMothers(mothersData as AnimalOption[]);
      }

      // Cargar padres (machos, activos, misma especie)
      const { data: fathersData, error: fathersError } = await supabase
        .from('animals')
        .select('id, code, name, sex, species_id')
        .eq('species_id', speciesId)
        .eq('sex', 'macho')
        .eq('status', 'activo')
        .order('code');

      if (!fathersError && fathersData) {
        setFathers(fathersData as AnimalOption[]);
      }
    } catch (error) {
      console.error('Error cargando padres:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMothers = mothers.filter(m => 
    m.name?.toLowerCase().includes(searchMother.toLowerCase()) ||
    m.code?.toLowerCase().includes(searchMother.toLowerCase())
  );

  const filteredFathers = fathers.filter(f => 
    f.name?.toLowerCase().includes(searchFather.toLowerCase()) ||
    f.code?.toLowerCase().includes(searchFather.toLowerCase())
  );

  const handleSelectMother = (motherId: string) => {
    onSelectMother(motherId);
    setShowMotherResults(false);
    setSearchMother('');
  };

  const handleSelectFather = (fatherId: string) => {
    onSelectFather(fatherId, null);
    setShowFatherResults(false);
    setSearchFather('');
  };

  const handleExternalFatherChange = (value: string) => {
    setFatherExternalValue(value);
    onSelectFather(null, value || null);
  };

  const clearMother = () => {
    onSelectMother(null);
  };

  const clearFather = () => {
    onSelectFather(null, null);
    setFatherExternalValue('');
  };

  if (!isEnabled) {
    return (
      <div className="bg-gray-50 p-6 rounded-2xl border border-black/5">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-gray-400" />
          <div>
            <h4 className="text-sm font-bold text-gray-600">Genealogía (Deshabilitada)</h4>
            <p className="text-xs text-gray-400 mt-1">
              La genealogía solo está disponible para animales <span className="font-bold">"Nacidos en la finca"</span>.
              Para animales adquiridos no se registra información genealógica.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-[var(--brand)]" />
        <h4 className="text-sm font-bold text-gray-800">Genealogía</h4>
        <Badge variant="neutral" className="text-[10px]">Opcional</Badge>
      </div>

      {/* 🔹 MADRE */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-black/5">
        <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
          🐄 Madre (Opcional)
          <span className="ml-2 text-[10px] font-normal text-gray-400">
            {mothers.length} hembras disponibles
          </span>
        </label>

        {selectedMotherId ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[var(--brand)]/20">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-[var(--brand)]" />
              <div>
                <p className="font-bold text-gray-800">
                  {mothers.find(m => m.id === selectedMotherId)?.name || 'Seleccionada'}
                </p>
                <p className="text-xs text-gray-400">
                  {mothers.find(m => m.id === selectedMotherId)?.code}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearMother}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchMother}
                onChange={(e) => {
                  setSearchMother(e.target.value);
                  setShowMotherResults(true);
                }}
                onFocus={() => setShowMotherResults(true)}
                placeholder="Buscar madre por código o nombre..."
                className="w-full bg-white border border-black/5 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
              />
            </div>

            {showMotherResults && filteredMothers.length > 0 && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-black/5 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredMothers.map(mother => (
                  <button
                    key={mother.id}
                    type="button"
                    onClick={() => handleSelectMother(mother.id)}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-black/5 last:border-0"
                  >
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{mother.name || mother.code}</p>
                      <p className="text-xs text-gray-400">{mother.code}</p>
                    </div>
                    <Badge variant="neutral" className="text-[10px]">Seleccionar</Badge>
                  </button>
                ))}
              </div>
            )}

            {showMotherResults && searchMother && filteredMothers.length === 0 && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-black/5 rounded-xl shadow-lg p-4 text-center">
                <p className="text-sm text-gray-400">No se encontraron madres con ese criterio</p>
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-2">
          💡 Solo se muestran hembras activas de la misma especie
        </p>
      </div>

      {/* 🔹 PADRE */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-black/5">
        <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
          🐂 Padre
          <span className="ml-2 text-[10px] font-normal text-gray-400">
            {fathers.length} machos disponibles
          </span>
        </label>

        {selectedFatherId ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[var(--brand)]/20">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-[var(--brand)]" />
              <div>
                <p className="font-bold text-gray-800">
                  {fathers.find(f => f.id === selectedFatherId)?.name || 'Seleccionado'}
                </p>
                <p className="text-xs text-gray-400">
                  {fathers.find(f => f.id === selectedFatherId)?.code}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFather}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Buscador de padre registrado */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchFather}
                  onChange={(e) => {
                    setSearchFather(e.target.value);
                    setShowFatherResults(true);
                  }}
                  onFocus={() => setShowFatherResults(true)}
                  placeholder="Buscar padre por código o nombre..."
                  className="w-full bg-white border border-black/5 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>

              {showFatherResults && filteredFathers.length > 0 && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-black/5 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredFathers.map(father => (
                    <button
                      key={father.id}
                      type="button"
                      onClick={() => handleSelectFather(father.id)}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-black/5 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{father.name || father.code}</p>
                        <p className="text-xs text-gray-400">{father.code}</p>
                      </div>
                      <Badge variant="neutral" className="text-[10px]">Seleccionar</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* O padre externo */}
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-gray-200" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">O registrar externo</span>
                <div className="h-[1px] flex-1 bg-gray-200" />
              </div>
              <input
                type="text"
                value={fatherExternalValue}
                onChange={(e) => handleExternalFatherChange(e.target.value)}
                placeholder="Pajilla / Toro externo (ej: TORO-ANGUS-001)"
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-2.5 mt-2 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)] transition-colors"
              />
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-2">
          💡 Solo se muestran machos activos de la misma especie. Puedes registrar un padre externo si no está en el sistema.
        </p>
      </div>

      {/* Mensaje informativo */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-700">
          La genealogía ayuda a mantener la trazabilidad genética y evitar la consanguinidad. 
          Solo se muestran animales de la especie <span className="font-bold">{speciesId ? 'seleccionada' : '(selecciona una especie primero)'}</span>.
        </p>
      </div>
    </div>
  );
}