'use client';

import React from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import { Activity as ActivityIcon, Beef, Recycle, PackageSearch, Clock } from 'lucide-react';
import { mockActivities, MockActivity } from '@/lib/mock-data';

export default function ActividadPage() {
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'animales': return <div className="h-10 w-10 rounded-xl bg-[#E4EFE4]/60 flex items-center justify-center text-[var(--brand)]"><Beef size={20} /></div>;
      case 'rutina': return <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Recycle size={20} /></div>;
      case 'bodega': return <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600"><PackageSearch size={20} /></div>;
      default: return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'animales': return 'Gestión Animal';
      case 'rutina': return 'Rutina Diaria';
      case 'bodega': return 'Bodega e Insumos';
      default: return category;
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMINISTRADOR']} redirectPath="/acceso-denegado">
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader 
          title="Registro de Actividad"
          description="Auditoría y seguimiento de todas las acciones y eventos registrados por los empleados de la granja."
          icon={ActivityIcon}
        />

        <div className="bg-white rounded-[2rem] shadow-sm border border-black/5 p-6 md:p-10">
          
          <div className="relative border-l-2 border-gray-100 ml-5 md:ml-10 space-y-12 pb-8">
            {mockActivities.map((activity, index) => (
              <div key={activity.id} className="relative pl-8 md:pl-12 group">
                
                {/* Botón Flotante / Timeline Marker */}
                <div className="absolute -left-[21px] md:-left-[21px] top-0 bg-white border border-gray-100 rounded-full shadow-sm p-1 group-hover:scale-110 group-hover:border-[var(--brand)] transition-all">
                  {getCategoryIcon(activity.category)}
                </div>

                {/* Tarjeta de Contenido */}
                <div className="bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-black/5 rounded-2xl p-6 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-extrabold pb-0.5 border-b-2 border-gray-200 text-gray-500 uppercase tracking-widest">
                          {getCategoryLabel(activity.category)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">• Sector: {activity.sector}</span>
                      </div>
                      
                      <h4 className="text-lg font-black text-gray-900 group-hover:text-[var(--brand)] transition-colors">{activity.title}</h4>
                      <p className="text-sm font-medium text-gray-600 mt-2 max-w-2xl leading-relaxed">{activity.description}</p>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">
                           {activity.user_name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-500">Registrado por <span className="text-gray-700">{activity.user_name}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm shrink-0">
                      <Clock size={14} />
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}
