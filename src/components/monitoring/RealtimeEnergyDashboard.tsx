/**
 * 🎯 Realtime Energy Dashboard
 *
 * Componente que consome os novos endpoints reais da API Enphase v4
 * Implementado com dados 100% reais, sem simulações
 */

'use client';

import { useState, useEffect } from 'react';
import { enphaseApiService, EnphaseSystemStatus, EnphaseDevice, EnphaseTelemetryData } from '@/lib/services/enphase-api.service';
import { useCurrentSystem } from '@/contexts/EnphaseSystemContext';

interface DashboardData {
  systemStatus?: EnphaseSystemStatus;
  devices?: {
    micros: EnphaseDevice[];
    meters: EnphaseDevice[];
    gateways: EnphaseDevice[];
  };
  telemetry?: EnphaseTelemetryData;
  invertersCount?: {
    total: number;
    microinverters: number;
    others: number;
  };
}

export default function RealtimeEnergyDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 🎯 EM PRODUÇÃO: Obter dados dinâmicos do contexto
  const { system, loading: systemLoading, hasSystem } = useCurrentSystem();

  // Fallback para desenvolvimento (mostra aviso)
  const tenantId = system?.tenantId;
  const systemId = system?.systemId;

  // Função para carregar todos os dados
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🎯 Validação: só carrega se houver sistema configurado
      if (!tenantId || !systemId) {
        setError('Nenhum sistema Enphase configurado. Selecione um projeto com integração Enphase.');
        return;
      }

      // Configurar o serviço com dados dinâmicos
      enphaseApiService.setTenant(tenantId, systemId);

      // Carregar múltiplos endpoints em paralelo
      const [
        statusResponse,
        devicesResponse,
        telemetryResponse,
        invertersResponse
      ] = await Promise.all([
        enphaseApiService.getSystemStatus(),
        enphaseApiService.getDevices(),
        enphaseApiService.getLatestTelemetry(),
        enphaseApiService.getInvertersSummary()
      ]);

      // Processar respostas
      const newData: DashboardData = {};

      if (statusResponse.success && statusResponse.data) {
        newData.systemStatus = statusResponse.data;
      }

      if (devicesResponse.success && devicesResponse.data) {
        newData.devices = devicesResponse.data.devices;
      }

      if (telemetryResponse.success && telemetryResponse.data) {
        newData.telemetry = telemetryResponse.data;
      }

      if (invertersResponse.success && invertersResponse.data) {
        newData.invertersCount = {
          total: invertersResponse.data.total_inverters,
          microinverters: invertersResponse.data.microinverters,
          others: invertersResponse.data.other_inverters
        };
      }

      setData(newData);
      setLastUpdate(new Date());

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na montagem
  useEffect(() => {
    loadDashboardData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Formatar números
  const formatPower = (watts: number) => {
    if (watts >= 1000) {
      return `${(watts / 1000).toFixed(2)} kW`;
    }
    return `${watts.toFixed(0)} W`;
  };

  const formatEnergy = (wh: number) => {
    if (wh >= 1000000) {
      return `${(wh / 1000000).toFixed(2)} MWh`;
    } else if (wh >= 1000) {
      return `${(wh / 1000).toFixed(2)} kWh`;
    }
    return `${wh.toFixed(0)} Wh`;
  };

  // Loading states diferentes
  if (systemLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados reais do sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <div className="text-red-600 text-xl mb-4">❌ Erro ao carregar dados</div>
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🏠 {system?.systemName || 'Energy Dashboard'}
          </h1>
          <p className="text-gray-600">
            {hasSystem ? (
              <>Sistema ID: {systemId} | Tenant: {tenantId}</>
            ) : (
              'Nenhum sistema configurado'
            )}
          </p>
          <p className="text-sm text-gray-500">
            {hasSystem ? (
              <>📊 Dados 100% reais da API Enphase v4</>
            ) : (
              <>⚠️ Configure um projeto com integração Enphase para ver dados</>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Última atualização</p>
          <p className="text-lg font-semibold">
            {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Status Cards */}
      {data.systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full ${
                  data.systemStatus.status === 'normal' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Status do Sistema</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.systemStatus.status === 'normal' ? '✅ Normal' : '⚠️ Atenção'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm font-medium text-gray-500">Produção Atual</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPower(data.systemStatus.currentPowerW)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm font-medium text-gray-500">Energia Hoje</p>
            <p className="text-2xl font-bold text-green-600">
              {formatEnergy(data.systemStatus.energyTodayKwh * 1000)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm font-medium text-gray-500">Energia Lifetime</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatEnergy(data.systemStatus.energyLifetimeKwh * 1000)}
            </p>
          </div>
        </div>
      )}

      {/* Devices Summary */}
      {data.devices && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📡 Dispositivos</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Microinversores:</span>
                <span className="font-semibold">{data.devices.micros?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Medidores:</span>
                <span className="font-semibold">{data.devices.meters?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gateways:</span>
                <span className="font-semibold">{data.devices.gateways?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔌 Inversores</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{data.invertersCount?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Microinversores:</span>
                <span className="font-semibold">{data.invertersCount?.microinverters || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outros:</span>
                <span className="font-semibold">{data.invertersCount?.others || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Telemetria</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Fonte:</span>
                <span className="font-semibold text-green-600">API v4 Real</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-semibold text-xs">
                  {data.telemetry?.timestamp ?
                    new Date(data.telemetry.timestamp).toLocaleTimeString('pt-BR') :
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Atualização:</span>
                <span className="font-semibold text-green-500">Ao vivo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Dashboard em Tempo Real:</strong> Todos os dados são obtidos diretamente da API Enphase v4
              através do nosso backend integration layer. Não há dados simulados.
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          🔄 Atualizar Dados
        </button>
      </div>
    </div>
  );
}