/**
 * 📊 Monitoring Dashboard Page
 *
 * Página de monitoramento que demonstra como usar o contexto EnphaseSystem
 * Em produção, o tenantId viria do usuário logado/session
 */

'use client';

import { EnphaseSystemProvider } from '@/contexts/EnphaseSystemContext';
import RealtimeEnergyDashboard from '@/components/monitoring/RealtimeEnergyDashboard';
import ProductionOverview from '@/components/monitoring/ProductionOverview';

// Em produção, este valor viria do usuário logado, JWT token, etc.
const getDefaultTenantId = () => {
  // Exemplo: obter do usuário logado
  // const user = getCurrentUser();
  // return user?.tenantId || null;

  // Para desenvolvimento/teste: usar um tenant válido
  return 'cmhp4brz80001whqjhtdw40lo';
};

export default function MonitoringPage() {
  const defaultTenantId = getDefaultTenantId();

  return (
    <EnphaseSystemProvider defaultTenantId={defaultTenantId}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              🏠 Solarfy Monitoring Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitoramento em tempo real de sistemas solares com dados reais da API Enphase v4
            </p>
          </div>

          {/* Production Overview */}
          <div className="mb-8">
            <ProductionOverview />
          </div>

          {/* Full Dashboard */}
          <div>
            <RealtimeEnergyDashboard />
          </div>

          {/* Development Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                🛠️ Informações de Desenvolvimento
              </h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>
                  <strong>Tenant ID (Mockado):</strong> {defaultTenantId}
                </p>
                <p>
                  <strong>Em Produção:</strong> Os dados viriam do usuário logado ou do projeto atual
                </p>
                <p>
                  <strong>Context:</strong> EnphaseSystemProvider gerencia dinamicamente tenant/system
                </p>
                <p>
                  <strong>API:</strong> Dados 100% reais da API Enphase v4 via backend integration layer
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </EnphaseSystemProvider>
  );
}