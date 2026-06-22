'use client';

import React, { useState, useEffect } from 'react';
import { Syringe, CheckCircle, Clock, AlertCircle, Calendar, User, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface VaccinationTimelineProps {
  animalId: string;
  limit?: number;
}

interface VaccinationRecord {
  id: string;
  vaccine_name: string;
  application_date: string;
  next_dose: string | null;
  responsible: string;
  notes: string | null;
  status: 'aplicada' | 'pendiente' | 'vencida';
  supply_name?: string;
  quantity?: number;
  unit?: string;
  batch?: string;
}

export default function VaccinationTimeline({ animalId, limit = 5 }: VaccinationTimelineProps) {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<'all' | 'aplicada' | 'pendiente' | 'vencida'>('all');

  useEffect(() => {
    if (animalId) {
      loadVaccinations();
    }
  }, [animalId]);

  const loadVaccinations = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/animales/${animalId}/vacunacion?limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.records) {
          setRecords(data.records);
          setTotal(data.total || data.records.length);
        } else {
          setRecords([]);
          setTotal(0);
        }
      } else {
        setRecords([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error cargando historial de vacunas:', error);
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aplicada':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle size={12} /> Aplicada</Badge>;
      case 'pendiente':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock size={12} /> Pendiente</Badge>;
      case 'vencida':
        return <Badge variant="danger" className="flex items-center gap-1"><AlertCircle size={12} /> Vencida</Badge>;
      default:
        return <Badge variant="neutral">Desconocido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aplicada':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pendiente':
        return <Clock className="text-yellow-500" size={20} />;
      case 'vencida':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Syringe className="text-gray-400" size={20} />;
    }
  };

  const filteredRecords = filter === 'all' 
    ? records 
    : records.filter(r => r.status === filter);

  const displayedRecords = filteredRecords.slice(0, limit);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-black/5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--brand)] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Syringe size={20} className="text-[var(--brand)]" />
          Historial de Vacunas
          <Badge variant="neutral" className="ml-2">{total} registros</Badge>
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
            {['all', 'aplicada', 'pendiente', 'vencida'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === status
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {status === 'all' ? 'Todos' : status}
              </button>
            ))}
          </div>
          {total > limit && (
            <button className="text-sm font-bold text-[var(--brand)] hover:underline flex items-center gap-1">
              Ver todos
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {displayedRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Syringe size={32} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold">Sin registros de vacunas</p>
            <p className="text-xs text-gray-400 mt-1">Este animal aún no tiene vacunas registradas</p>
          </div>
        ) : (
          displayedRecords.map((record) => (
            <div 
              key={record.id} 
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${
                record.status === 'aplicada' 
                  ? 'bg-green-50/50 border-green-100' 
                  : record.status === 'pendiente'
                  ? 'bg-yellow-50/50 border-yellow-100'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                record.status === 'aplicada' 
                  ? 'bg-green-100' 
                  : record.status === 'pendiente'
                  ? 'bg-yellow-100'
                  : 'bg-gray-200'
              }`}>
                {getStatusIcon(record.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 capitalize">{record.vaccine_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(record.application_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {record.responsible && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <User size={12} />
                            {record.responsible}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2">
                  {record.batch && (
                    <span className="text-xs text-gray-500">
                      📦 Lote: {record.batch}
                    </span>
                  )}
                  {record.supply_name && (
                    <span className="text-xs text-gray-500">
                      💉 {record.supply_name} {record.quantity && `(${record.quantity} ${record.unit})`}
                    </span>
                  )}
                  {record.next_dose && (
                    <span className="text-xs text-gray-500">
                      ⏰ Próxima dosis: {new Date(record.next_dose).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>

                {record.notes && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    📝 {record.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}