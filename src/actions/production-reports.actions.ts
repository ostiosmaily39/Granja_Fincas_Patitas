'use server';
import { createClient } from '@/utils/supabase/server';

export async function getProductionStats(days: number = 7) {
  const supabase = createClient();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split('T')[0];

  const { data: milkData } = await (await supabase)
    .from('milk_production')
    .select('production_date, quantity_liters')
    .gte('production_date', fromDateStr)
    .order('production_date', { ascending: true });

  const { data: eggData } = await (await supabase)
    .from('egg_production')
    .select('production_date, quantity_units, discarded_units')
    .gte('production_date', fromDateStr)
    .order('production_date', { ascending: true });

  const milkMap: Record<string, number> = {};
  let totalMilk = 0;
  if (milkData) {
    milkData.forEach(row => {
      milkMap[row.production_date] = (milkMap[row.production_date] || 0) + Number(row.quantity_liters);
      totalMilk += Number(row.quantity_liters);
    });
  }

  const eggMap: Record<string, { total: number; damaged: number }> = {};
  let totalEggs = 0;
  let totalDamagedEggs = 0;
  if (eggData) {
    eggData.forEach(row => {
      if (!eggMap[row.production_date]) eggMap[row.production_date] = { total: 0, damaged: 0 };
      eggMap[row.production_date].total += Number(row.quantity_units);
      eggMap[row.production_date].damaged += Number(row.discarded_units || 0);
      totalEggs += Number(row.quantity_units);
      totalDamagedEggs += Number(row.discarded_units || 0);
    });
  }

  const milkChronological = [];
  const eggChronological = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    milkChronological.push({ date: dateStr, label, litros: milkMap[dateStr] || 0 });
    eggChronological.push({
      date: dateStr,
      label,
      buenos: (eggMap[dateStr]?.total || 0) - (eggMap[dateStr]?.damaged || 0),
      rotos: eggMap[dateStr]?.damaged || 0,
    });
  }

  return {
    milkChart: milkChronological,
    eggChart: eggChronological,
    kpi: {
      totalMilk,
      avgMilk: totalMilk / days,
      totalEggs,
      totalDamagedEggs,
    },
  };
}