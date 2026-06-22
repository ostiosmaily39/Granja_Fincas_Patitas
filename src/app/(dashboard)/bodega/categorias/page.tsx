import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { ListTree } from 'lucide-react';
import CategoryManager from './CategoryManager';

export const metadata = { title: 'Categorías de Insumos' };

export default function CategoriasPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Categorías de Insumos"
        description="Gestione los diferentes grupos y clasificaciones de los recursos de la finca."
        icon={ListTree}
      />
      <div className="mt-8">
        <CategoryManager />
      </div>
    </div>
  );
}
