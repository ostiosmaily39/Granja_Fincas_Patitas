'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Activity,
  Scale,
  UserCheck,
  Heart,
  Calendar,
  Loader2,
  ClipboardList,
  Utensils,
  PlusCircle,
  History,
  Syringe,
  Edit3,
  TrendingUp,
  CheckCircle,
  CalendarDays,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository';
import { SupabaseFeedingRepository } from '@/repositories/supabase/FeedingRepository';
import { SupabaseReproductionRepository } from '@/repositories/supabase/ReproductionRepository';
import { createClient } from '@/utils/supabase/client';
import { AnimalWithRelations } from '@/types/domain/animal.schema';
import type { AnimalEvent } from '@/types/domain/health.schema';
import { animalService } from '@/services/animalService';
import { FeedingRecord } from '@/types/domain/feeding.schema';
import { ReproductiveEventWithRelations } from '@/types/domain/reproduction.schema';
import HealthEventModal from '@/components/animales/HealthEventModal';
import FeedingModal from '@/components/animales/FeedingModal';
import VaccinationModal from '@/components/animales/VaccinationModal';
import VaccinationTimeline from '@/components/animales/VaccinationTimeline';
import ServiceModal from '@/components/animales/ServiceModal';
import AnimalTimeline from '@/components/animales/AnimalTimeline';
import AnimalEditModal from '@/components/animales/AnimalEditModal';
import EgressModal from '@/components/animales/EgressModal';
import { StatusCard } from '@/components/animales/StatusCard';
import { ActionButton } from '@/components/animales/ActionButton';
import { MoreDropdown } from '@/components/animales/MoreDropdown';

type TabType = 'info' | 'health' | 'feeding' | 'production' | 'repro';
type TimelineCategory = 'all' | 'salud' | 'vacunacion' | 'alimentacion' | 'otros';

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusVariant = (value: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    sano: 'success',
    al_dia: 'success',
    activo: 'success',
    apto: 'success',
    gestante: 'success',
    lactante: 'success',
    sin_gestion_activa: 'neutral',
    en_gestion: 'warning',
    en_parto: 'warning',
    enfermo: 'danger',
    en_tratamiento: 'warning',
    cuarentena: 'warning',
    cronico: 'danger',
    fallecido: 'danger',
    pendiente: 'warning',
    vencido: 'danger',
    no_aplica: 'neutral',
    vendido: 'warning',
    muerto: 'danger',
    descartado: 'danger',
  };
  return statusMap[value] || 'neutral';
};

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { user, role } = useAuth();

  const canEditRecord = (record: any) => {
    if (role === 'ADMINISTRADOR' || role === 'ENCARGADO') return true;
    return record?.created_by === user?.id;
  };

  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [animal, setAnimal] = useState<AnimalWithRelations | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<AnimalEvent[]>([]);
  const [feedingHistory, setFeedingHistory] = useState<FeedingRecord[]>([]);
  const [reproHistory, setReproHistory] = useState<ReproductiveEventWithRelations[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [healthCategory, setHealthCategory] = useState<TimelineCategory>('all');
  const [healthFrom, setHealthFrom] = useState('');
  const [healthTo, setHealthTo] = useState('');
  const [healthSearch, setHealthSearch] = useState('');
  const [debouncedHealthSearch, setDebouncedHealthSearch] = useState('');

  const [feedingFrom, setFeedingFrom] = useState('');
  const [feedingTo, setFeedingTo] = useState('');
  const [feedingSearch, setFeedingSearch] = useState('');

  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEgressModalOpen, setIsEgressModalOpen] = useState(false);

  const [repo] = useState(() => new SupabaseAnimalRepository(createClient()));
  const [feedingRepo] = useState(() => new SupabaseFeedingRepository(createClient()));
  const [reproRepo] = useState(() => new SupabaseReproductionRepository(createClient()));

  const fetchAnimal = useCallback(async () => {
    try {
      setLoading(true);
      const data = await repo.getById(id);
      setAnimal(data);
    } catch (error) {
      console.error('Error al cargar el animal:', error);
    } finally {
      setLoading(false);
    }
  }, [id, repo]);

  const fetchHealthHistory = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingHistory(true);
      const data = await animalService.getTimeline(id, {
        category: healthCategory,
        fromDate: healthFrom.trim() || undefined,
        toDate: healthTo.trim() || undefined,
        search: debouncedHealthSearch.trim() || undefined,
      });

<<<<<<< HEAD
      // ✅ FILTRAR: Solo eventos de salud, excluir alimentación
      const healthEvents = data.filter(event =>
        event.event_type !== 'alimentacion'
      );
=======
      const healthEvents = data.filter((event) => event.event_type !== 'alimentacion');
>>>>>>> 503c2fa89500585e208404b93b94a54312e3eb62
      setTimelineEvents(healthEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }, [id, healthCategory, healthFrom, healthTo, debouncedHealthSearch]);

  const fetchFeedingHistory = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingHistory(true);
      const data = await feedingRepo.getByAnimal(id);
      setFeedingHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }, [id, feedingRepo]);

  const fetchReproHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const data = await reproRepo.listByAnimal(id);
      setReproHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }, [id, reproRepo]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedHealthSearch(healthSearch), 350);
    return () => window.clearTimeout(timer);
  }, [healthSearch]);

  useEffect(() => {
    if (id) fetchAnimal();
  }, [id, fetchAnimal]);

  useEffect(() => {
    if (activeTab === 'health') fetchHealthHistory();
    if (activeTab === 'feeding') fetchFeedingHistory();
    if (activeTab === 'repro') fetchReproHistory();
  }, [activeTab, fetchHealthHistory, fetchFeedingHistory, fetchReproHistory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
        <p className="text-gray-500 font-bold">Cargando perfil del animal...</p>
      </div>
    );
  }

  if (!animal)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-black text-gray-800">Animal no encontrado</h2>
        <button
          onClick={() => router.back()}
          className="text-[var(--brand)] font-bold underline"
        >
          Volver al listado
        </button>
      </div>
    );

  const displayName = animal.name || animal.species?.display_name || 'Animal';

  const tabs = [
    { id: 'info', label: 'General', icon: ClipboardList },
    { id: 'health', label: 'Salud', icon: Heart },
    { id: 'feeding', label: 'Alimentación', icon: Utensils },
    ...(animal.species?.name === 'vaca' || animal.species?.name === 'cow'
      ? [{ id: 'production', label: 'Producción', icon: TrendingUp }]
<<<<<<< HEAD
      : []
    ),
    ...(animal?.sex === 'hembra' ? [{ id: 'repro', label: 'Reproducción', icon: History }] : [])
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO']} redirectPath="/acceso-denegado">
      <div className="space-y-8 animate-fade-in pb-10">
=======
      : []),
    ...(animal?.sex === 'hembra' ? [{ id: 'repro', label: 'Reproducción', icon: History }] : []),
  ];

  const dropdownItems = [
    {
      label: 'Registrar Servicio',
      icon: Activity,
      action: () => setIsServiceModalOpen(true),
      disabled: animal?.sex !== 'hembra',
    },
    {
      label: 'Historial Completo',
      icon: FileText,
      action: () => setActiveTab('health'),
    },
    {
      label: 'Generar Informe',
      icon: TrendingUp,
      action: () => alert('Próximamente: Generar informe'),
    },
    ...(animal?.status === 'activo'
      ? [
          {
            label: 'Dar de Baja',
            icon: AlertTriangle,
            action: () => setIsEgressModalOpen(true),
            danger: true,
          },
        ]
      : []),
  ];

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR', 'ENCARGADO']} redirectPath="/acceso-denegado">
      <div className="space-y-6 pb-10">
>>>>>>> 503c2fa89500585e208404b93b94a54312e3eb62

        {/* Header Rediseñado */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
          {/* Fila 1: Volver + ID */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
            <Badge variant="neutral" className="font-mono text-xs">
              {animal.code}
            </Badge>
          </div>

          {/* Fila 2: Nombre + especie */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 capitalize">
                {displayName}
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1 flex flex-wrap items-center gap-1">
                <span>{animal.species?.display_name || 'Especie'}</span>
                <span className="text-gray-300">·</span>
                <span>{animal.breed?.name || 'Mestiza'}</span>
                <span className="text-gray-300">·</span>
                <span className="capitalize">{animal.sex}</span>
                <span className="text-gray-300">·</span>
                <span>{animal.current_weight_kg || 0} kg</span>
              </p>
            </div>
          </div>

<<<<<<< HEAD
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                if (!canEditRecord(animal)) {
                  alert('No tienes permiso para editar este animal. Solo puedes editar animales que tú mismo registraste.');
                  return;
                }
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <Edit3 size={18} className="text-blue-500" />
              <span>Editar Animal</span>
            </button>

            <button
              onClick={() => {
                if (!canEditRecord(animal)) {
                  alert('No tienes permiso para registrar alimentación en este animal. Solo puedes registrar en animales que tú mismo creaste.');
                  return;
                }
                setIsFeedingModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <Utensils size={18} className="text-orange-500" />
              <span>Nueva Carga Alimenticia</span>
            </button>

            <button
              onClick={() => {
                if (!canEditRecord(animal)) {
                  alert('No tienes permiso para registrar vacunas en este animal. Solo puedes registrar en animales que tú mismo creaste.');
                  return;
                }
                setIsVaccinationModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <Syringe size={18} className="text-green-600" />
              <span>Registrar Vacuna</span>
            </button>

            <button
              onClick={() => {
                if (!canEditRecord(animal)) {
                  alert('No tienes permiso para registrar eventos de salud en este animal. Solo puedes registrar en animales que tú mismo creaste.');
                  return;
                }
                setIsHealthModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-xl font-bold hover:bg-[var(--brand-hover)] shadow-sm transition-all"
            >
              <PlusCircle size={18} />
              <span>Evento de Salud</span>
            </button>
=======
          {/* Fila 3: Cards de estado */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <StatusCard
              label="Salud"
              value={animal.health_status}
              icon={Heart}
              status={getStatusVariant(animal.health_status)}
              onClick={() => setActiveTab('health')}
            />
            <StatusCard
              label="Vacunación"
              value={animal.vaccination_status || 'pendiente'}
              icon={Syringe}
              status={getStatusVariant(animal.vaccination_status || 'pendiente')}
              onClick={() => setActiveTab('health')}
            />
            <StatusCard
              label="Estado"
              value={animal.status}
              icon={CheckCircle}
              status={getStatusVariant(animal.status)}
            />
            <StatusCard
              label="Reproducción"
              value={animal.reproductive_status}
              icon={Calendar}
              status={getStatusVariant(animal.reproductive_status)}
              onClick={() => setActiveTab('repro')}
            />
            <StatusCard
              label="Nacimiento"
              value={formatDate(animal.birth_date)}
              icon={CalendarDays}
              status="neutral"
            />
          </div>

          {/* Fila 4: Botones de acción */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
            <ActionButton
              icon={Edit3}
              label="Editar"
              onClick={() => setIsEditModalOpen(true)}
              variant="secondary"
            />
            <ActionButton
              icon={Utensils}
              label="Alimentación"
              onClick={() => setIsFeedingModalOpen(true)}
              variant="orange"
            />
            <ActionButton
              icon={Syringe}
              label="Vacunar"
              onClick={() => setIsVaccinationModalOpen(true)}
              variant="green"
            />
            <ActionButton
              icon={PlusCircle}
              label="Salud"
              onClick={() => setIsHealthModalOpen(true)}
              variant="primary"
            />
            <MoreDropdown items={dropdownItems} />
>>>>>>> 503c2fa89500585e208404b93b94a54312e3eb62
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/5 gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
<<<<<<< HEAD
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all font-bold whitespace-nowrap ${activeTab === tab.id
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
=======
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all font-bold whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? 'border-[var(--brand)] text-[var(--brand)]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
>>>>>>> 503c2fa89500585e208404b93b94a54312e3eb62
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ Tab 1: Información General */}
        {activeTab === 'info' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatItem icon={Scale} label="Peso Actual" value={`${animal.current_weight_kg || 0} kg`} color="brand" />
              <StatItem icon={UserCheck} label="Encargado" value="Sin asignar" color="purple" />
              <StatItem
                icon={Heart} label="Estado Salud"
                value={<Badge variant={animal.health_status === 'sano' ? 'success' : animal.health_status === 'fallecido' ? 'danger' : 'warning'}>{animal.health_status.replace('_', ' ')}</Badge>}
                color="red"
              />
              <StatItem icon={Calendar} label="F. Nacimiento" value={animal.birth_date || 'Desconocida'} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-black/5">
                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                  <Activity size={24} className="text-[var(--brand)]" /> Producción Reciente
                </h3>
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <Activity size={32} className="text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-400">Sin datos de producción (M5)</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 flex flex-col gap-6">
                <h3 className="text-xl font-black text-gray-900">Detalles de Registro</h3>
                <InfoRow label="ID de Sistema" value={animal.id} font="mono" />
                <InfoRow label="Sexo" value={<span className="capitalize">{animal.sex}</span>} />
                <InfoRow label="Origen" value={animal.origin ? animal.origin.replace('_', ' ') : 'No definido'} />
                <InfoRow label="Peso Inicial" value={`${animal.initial_weight_kg || 0} kg`} />
                <InfoRow label="F. Adquisición" value={animal.acquisition_date || 'No registrada'} />
                <InfoRow
                  label="Vacunación"
                  value={<Badge variant={animal.vaccination_status === 'al_dia' ? 'success' : animal.vaccination_status === 'pendiente' ? 'warning' : 'danger'}>{animal.vaccination_status.replace('_', ' ').toUpperCase()}</Badge>}
                />
                <InfoRow
                  label="Estatus Comercial"
                  value={<Badge variant={animal.status === 'activo' ? 'neutral' : 'danger'}>{animal.status.toUpperCase()}</Badge>}
                />
                <InfoRow
                  label="Estado Reproductivo"
                  value={<span className="capitalize">{animal.reproductive_status.replace('_', ' ')}</span>}
                />
                {animal.notes && <InfoRow label="Notas" value={animal.notes} layout="column" />}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Tab 2: Historial de Salud */}
        {activeTab === 'health' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-gray-900">Historial Clínico</h3>
                <Badge variant="neutral" className="flex items-center gap-1">
                  <Heart size={14} />
                  Eventos de salud
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-6">
                Enfermedades, tratamientos, vacunas y consultas veterinarias.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Tipo de evento
                  </label>
                  <select
                    value={healthCategory}
                    onChange={(e) => setHealthCategory(e.target.value as TimelineCategory)}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[var(--brand)]"
                  >
                    <option value="all">Todos</option>
                    <option value="salud">Salud</option>
                    <option value="vacunacion">Vacunación</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={healthFrom}
                    onChange={(e) => setHealthFrom(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={healthTo}
                    onChange={(e) => setHealthTo(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Buscar
                  </label>
                  <input
                    type="search"
                    value={healthSearch}
                    onChange={(e) => setHealthSearch(e.target.value)}
                    placeholder="Diagnóstico, medicamento..."
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>
            </div>
<<<<<<< HEAD

            {/* ✅ Timeline de salud (SOLO eventos clínicos) */}
            <div className="bg-white p-1 rounded-[2rem] shadow-sm border border-black/5 overflow-hidden">
              <AnimalTimeline events={timelineEvents} loading={loadingHistory} />
            </div>

            {/* ✅ Timeline de vacunas (independiente) */}
=======
            
            <div className="bg-white p-1 rounded-[2rem] shadow-sm border border-black/5 overflow-hidden">
              <AnimalTimeline events={timelineEvents} loading={loadingHistory} />
            </div>
            
>>>>>>> 503c2fa89500585e208404b93b94a54312e3eb62
            <VaccinationTimeline animalId={id} limit={5} />
          </div>
        )}

        {/* ✅ Tab 3: Alimentación */}
        {activeTab === 'feeding' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-gray-900">Historial de Alimentación</h3>
                <Badge variant="neutral" className="flex items-center gap-1">
                  <Utensils size={14} />
                  Consumo registrado
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-6">
                Registro detallado de consumo de alimento, suplementos y cambios de dieta.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={feedingFrom}
                    onChange={(e) => setFeedingFrom(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={feedingTo}
                    onChange={(e) => setFeedingTo(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Buscar por insumo
                  </label>
                  <input
                    type="search"
                    value={feedingSearch}
                    onChange={(e) => setFeedingSearch(e.target.value)}
                    placeholder="Nombre del alimento..."
                    className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              {loadingHistory ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[var(--brand)]" /></div>
              ) : feedingHistory.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <Utensils size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-bold">Sin registros de alimentación</p>
                  <p className="text-sm text-gray-400 mt-1">Registra la primera carga alimenticia</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        <th className="px-6 py-4">Insumo</th>
                        <th className="px-6 py-4">Cantidad</th>
                        <th className="px-6 py-4">Unidad</th>
                        <th className="px-6 py-4 text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {feedingHistory.map(rec => (
                        <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5 font-bold text-gray-900">{(rec as any).supply?.name ?? 'Insumo'}</td>
                          <td className="px-6 py-5">
                            <span className="font-black text-[var(--brand)]">{rec.quantity}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-bold text-gray-400 uppercase">{rec.unit}</span>
                          </td>
                          <td className="px-6 py-5 text-right font-medium text-gray-500">
                            {new Date(rec.fed_at || '').toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ Tab 4: Producción */}
        {activeTab === 'production' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5">
              <h3 className="text-xl font-black text-gray-900 mb-2">Producción</h3>
              <p className="text-sm font-medium text-gray-500 mb-6">
                Rendimiento productivo del animal.
              </p>
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                <TrendingUp size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-400">Próximamente</p>
                <p className="text-xs text-gray-400 mt-1">Producción de leche, huevos, etc.</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Tab 5: Reproducción */}
        {activeTab === 'repro' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-1 rounded-[2rem] shadow-sm border border-black/5 overflow-hidden">
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">Historial Reproductivo</h3>
                <Badge variant={animal.reproductive_status === 'sin_gestion_activa' ? 'neutral' : 'warning'}>
                  Estado: {animal.reproductive_status.replace('_', ' ')}
                </Badge>
              </div>
              {loadingHistory ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[var(--brand)]" /></div>
              ) : reproHistory.length === 0 ? (
                <div className="p-20 text-center text-gray-400 font-bold">Sin eventos reproductivos.</div>
              ) : (
                <div className="divide-y divide-black/5">
                  {reproHistory.map(ev => (
                    <div key={ev.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <History size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-lg uppercase">
                              {ev.event_type.replace('_', ' ')}
                            </span>
                            {ev.gestation_status && (
                              <Badge variant={
                                ev.gestation_status === 'parto_exitoso' ? 'success' :
                                  ev.gestation_status === 'fallida' ? 'danger' : 'warning'
                              }>
                                {ev.gestation_status.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 font-medium">
                            {ev.notes || 'Sin notas.'}
                          </p>
                          {(ev as any).male_animal && (
                            <p className="text-sm text-gray-400 mt-1">
                              Macho: <b>{(ev as any).male_animal.code}</b>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{ev.event_date.slice(0, 10)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modales */}
        <HealthEventModal
          isOpen={isHealthModalOpen}
          animalId={id}
          onClose={() => setIsHealthModalOpen(false)}
          onSuccess={() => {
            fetchAnimal();
            if (activeTab === 'health') fetchHealthHistory();
          }}
        />
        <FeedingModal
          isOpen={isFeedingModalOpen}
          animalId={id}
          onClose={() => setIsFeedingModalOpen(false)}
          onSuccess={() => {
            void fetchAnimal();
            if (activeTab === 'feeding') void fetchFeedingHistory();
          }}
        />
        {animal && (
          <VaccinationModal
            isOpen={isVaccinationModalOpen}
            animal={{
              id: animal.id,
              code: animal.code,
              name: animal.name || 'Animal',
              species: animal.species?.display_name || 'Especie',
            }}
            onClose={() => setIsVaccinationModalOpen(false)}
            onSuccess={() => {
              void fetchAnimal();
              if (activeTab === 'health') void fetchHealthHistory();
            }}
          />
        )}
        {animal && (
          <ServiceModal
            isOpen={isServiceModalOpen}
            animal={animal}
            onClose={() => setIsServiceModalOpen(false)}
            onSuccess={() => {
              void fetchAnimal();
              if (activeTab === 'health') void fetchHealthHistory();
            }}
          />
        )}
        {animal && (
          <AnimalEditModal
            isOpen={isEditModalOpen}
            animal={animal}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              fetchAnimal();
            }}
          />
        )}
        {animal && (
          <EgressModal
            isOpen={isEgressModalOpen}
            animal={{
              id: animal.id,
              name: animal.name || 'Animal',
              code: animal.code,
            }}
            onClose={() => setIsEgressModalOpen(false)}
            onSuccess={() => {
              fetchAnimal();
            }}
          />
        )}

      </div>
    </RoleGuard>
  );
}

// Componentes auxiliares
function StatItem({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  const colorMap: Record<string, string> = {
    brand: 'bg-[#E4EFE4]/60 text-[var(--brand)]',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-500',
    orange: 'bg-orange-50 text-orange-500'
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 flex flex-col gap-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">{label}</span>
        <span className="text-xl font-black text-gray-900 mt-1">{value}</span>
      </div>
    </div>
  );
}

function InfoRow({ label, value, font = 'sans', layout = 'row' }: { label: string, value: any, font?: 'sans' | 'mono', layout?: 'row' | 'column' }) {
  return (
    <div className={`flex ${layout === 'row' ? 'items-center justify-between pb-4 border-b border-gray-50' : 'flex-col gap-1'}`}>
      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-bold text-gray-700 ${font === 'mono' ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}