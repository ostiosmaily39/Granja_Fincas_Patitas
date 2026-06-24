'use client';

import { useState, useEffect } from 'react';
import { getUnreadNotifications, markNotificationAsRead } from '@/actions/admin';
import { X, Shield } from 'lucide-react';

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const result = await getUnreadNotifications();
      
      if (result.success && result.data.length > 0) {
        setNotifications(result.data);
        setCurrentNotification(result.data[0]);
      }
    } catch (error) {
      // Silenciar errores - puede que el usuario no esté autenticado
      console.log('[NotificationBanner] No se pudieron cargar notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (currentNotification) {
      try {
        await markNotificationAsRead(currentNotification.id);
        const remaining = notifications.filter(n => n.id !== currentNotification.id);
        setNotifications(remaining);
        setCurrentNotification(remaining[0] || null);
        setShowDetails(false);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  // Si está cargando o no hay notificación, no mostrar nada
  if (isLoading) return null;
  if (!currentNotification) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              {!showDetails ? (
                <>
                  <h3 className="font-bold text-sm mb-1">
                    {currentNotification.title}
                  </h3>
                  <p className="text-sm text-white/90 mb-3">
                    {currentNotification.message}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
                    >
                      De acuerdo
                    </button>
                    <button
                      onClick={() => setShowDetails(true)}
                      className="px-4 py-2 bg-white text-blue-600 hover:bg-white/90 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Ver detalles
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-sm mb-2">
                    Detalles del cambio de rol
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Nuevo rol:</span>{' '}
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {currentNotification.data?.newRole}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Fecha del cambio:</span>{' '}
                      {new Date(currentNotification.data?.changedAt).toLocaleString('es-ES')}
                    </p>
                    <p className="text-white/80 mt-3">
                      Si tienes alguna pregunta o problema con este cambio, contacta a nuestro soporte técnico.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Entendido
                    </button>
                    <a
                      href="mailto:soporte@fincasypatitas.com"
                      className="px-4 py-2 bg-white text-blue-600 hover:bg-white/90 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Contactar soporte
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}