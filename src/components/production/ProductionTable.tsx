import React from 'react';
import { CalendarDays, AlertCircle } from 'lucide-react';

interface Props {
  milkChart: Record<string, string | number>[];
  eggChart: Record<string, string | number>[];
}

export default function ProductionTable({ milkChart, eggChart }: Props) {
  // Combine both chronological arrays into one list by index since they line up directly
  const combined = milkChart.map((milk, idx) => {
    const egg = eggChart[idx];
    return {
      date: milk.date as string,
      label: milk.label as string,
      milk: Number(milk.litros || 0),
      eggGood: Number(egg?.buenos || 0),
      eggDamaged: Number(egg?.rotos || 0),
    };
  }).reverse(); // Most recent first for the table

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100/50 flex flex-col items-center justify-center text-purple-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Vista Cronológica</h3>
            <p className="text-xs font-bold text-gray-400">Detalle diario consolidado</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left whitespace-nowrap min-w-[700px]">
          <thead>
            <tr className="bg-white text-gray-400 font-extrabold text-[10px] uppercase tracking-widest border-b border-gray-100">
              <th className="p-5 pl-8">Fecha</th>
              <th className="p-5 text-right">Leche (L)</th>
              <th className="p-5 text-right">Huevos Sanos</th>
              <th className="p-5 text-right">Huevos Rotos</th>
              <th className="p-5 text-right pr-8">Eficiencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/80">
            {combined.map((row) => {
              const totalEggs = row.eggGood + row.eggDamaged;
              const eff = totalEggs > 0 ? ((row.eggGood / totalEggs) * 100).toFixed(1) : '-';
              
              return (
                <tr key={row.date} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-5 pl-8">
                    <span className="font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">{row.date}</span>
                  </td>
                  <td className="p-5 text-right">
                    {row.milk > 0 ? (
                      <span className="font-black text-blue-600 text-lg">{row.milk}</span>
                    ) : (
                      <span className="font-bold text-gray-300">-</span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    {row.eggGood > 0 ? (
                      <span className="font-black text-amber-500 text-lg">{row.eggGood}</span>
                    ) : (
                      <span className="font-bold text-gray-300">-</span>
                    )}
                  </td>
                  <td className="p-5 text-right relative">
                    {row.eggDamaged > 0 ? (
                      <span className="font-black text-red-500 text-lg inline-flex items-center gap-1 justify-end">
                        {row.eggDamaged}
                      </span>
                    ) : (
                      <span className="font-bold text-gray-300">-</span>
                    )}
                  </td>
                  <td className="p-5 text-right pr-8">
                    {eff !== '-' ? (
                      <div className="flex items-center justify-end gap-2">
                         <span className={`font-black text-sm ${parseFloat(eff) < 90 ? 'text-red-500' : 'text-emerald-500'}`}>
                           {eff}%
                         </span>
                         {parseFloat(eff) < 90 && <AlertCircle className="w-4 h-4 text-red-400" />}
                      </div>
                    ) : (
                      <span className="font-bold text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
