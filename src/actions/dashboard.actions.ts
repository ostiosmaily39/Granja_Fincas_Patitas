'use server';

import { createClient } from '@/utils/supabase/server';

export async function getGlobalKPIs() {
  const supabase = createClient();
  
  // 1. Total Animales
  const { count: totalAnimals } = await (await supabase)
    .from('animals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'activo');
  
  // 2. Alertas Críticas (Animales enfermos)
  const { count: criticalAlerts } = await (await supabase)
    .from('animals')
    .select('*', { count: 'exact', head: true })
    .eq('health_status', 'enfermo');
  
  // 3. Insumos Bajos (Obtenemos stocks para filtrar nivel base)
  const { data: supplyStocks } = await (await supabase)
    .from('supplies')
    .select('current_stock, min_stock')
    .eq('is_active', true);
    
  const lowStockSupplies = supplyStocks 
    ? supplyStocks.filter(s => s.current_stock <= s.min_stock).length 
    : 0;
  
  // 4. Producción de Leche (Últimos 30 días)
  const date30DaysAgo = new Date();
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
  const dateStr = date30DaysAgo.toISOString().split('T')[0];
  
  const { data: milkRecords } = await (await supabase)
    .from('milk_production')
    .select('quantity_liters')
    .gte('date', dateStr);
    
  const totalMilk = milkRecords 
    ? milkRecords.reduce((acc, curr) => acc + Number(curr.quantity_liters), 0) 
    : 0;
  
  return {
    totalAnimals: totalAnimals || 0,
    criticalAlerts: criticalAlerts || 0,
    lowStockSupplies,
    lastMonthMilk: totalMilk
  };
}

export async function getAuditHistory(limit: number = 50) {
  const supabase = createClient();
  
  // Unimos audit_logs con profiles a través de modifed_by
  const { data, error } = await (await supabase)
    .from('audit_logs')
    .select(`
      *,
      profiles(full_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
  
  return data || [];
}
