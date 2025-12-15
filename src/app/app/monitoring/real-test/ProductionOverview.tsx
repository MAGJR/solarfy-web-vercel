/**
 * 🎯 Production Overview Component
 *
 * Exemplo simples de como usar o contexto EnphaseSystem
 * e consumir os novos endpoints da API real v4
 */

'use client';

import { useState, useEffect } from 'react';
import { EnphaseApiService } from './enphase-api-service';

interface ProductionData {
  telemetry?: any;
  meterReadings?: any;
  inverters?: any;
  lastUpdate?: Date;
}

export default function ProductionOverview() {
  const [productionData, setProductionData] = useState<ProductionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados reais para teste
  const tenantId = 'cmhp4brz80001whqjhtdw40lo';
  const systemId = '5096922';
  const apiService = new EnphaseApiService();

  // Carregar dados de produção automaticamente
  useEffect(() => {
    const loadProductionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Configurar API service com dados reais
        apiService.setTenant(tenantId, systemId);

        // 🎯 Carregar dados reais do integration layer
        const [telemetry, meterReadings, inverters] = await Promise.all([
          apiService.getLatestTelemetry(),
          apiService.getProductionMeterReadings(),
          apiService.getInvertersSummary()
        ]);

        if (telemetry.success || meterReadings.success || inverters.success) {
          setProductionData({
            telemetry: telemetry.data,
            meterReadings: meterReadings.data,
            inverters: inverters.data,
            lastUpdate: new Date()
          });
        } else {
          setError('Falha ao carregar dados de produção');
        }

      } catch (err) {
        console.error('Error loading production data:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadProductionData();
  }, []);

  // Estado de loading
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  // 🎯 Sistema configurado para teste visual

  // Erro no carregamento
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          ❌ Erro ao Carregar Dados
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Dados carregados com sucesso
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            ⚡ Produção de Energia
          </h3>
          <p className="text-sm text-gray-600">
            Sistema: Juanita Whitney (ID: {systemId})
          </p>
        </div>
        {productionData?.lastUpdate && (
          <p className="text-sm text-gray-500">
            Atualizado: {productionData.lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        )}
      </div>

      {productionData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Produção Atual */}
          {productionData.telemetry?.current_power && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600 mb-1">Produção Atual</p>
              <p className="text-2xl font-bold text-green-700">
                {productionData.telemetry.current_power >= 1000
                  ? `${(productionData.telemetry.current_power / 1000).toFixed(2)} kW`
                  : `${productionData.telemetry.current_power} W`
                }
              </p>
            </div>
          )}

          {/* Inversores Ativos */}
          {productionData.inverters && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600 mb-1">Inversores</p>
              <p className="text-2xl font-bold text-blue-700">
                {productionData.inverters.total_inverters}
              </p>
              <p className="text-xs text-blue-600">
                {productionData.inverters.microinverters} micros
              </p>
            </div>
          )}

          {/* Leituras do Medidor */}
          {productionData.meterReadings && Array.isArray(productionData.meterReadings) && (
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-600 mb-1">Leituras</p>
              <p className="text-2xl font-bold text-purple-700">
                {productionData.meterReadings.length}
              </p>
              <p className="text-xs text-purple-600">disponíveis</p>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          📊 <strong>Fonte de Dados:</strong> API Enphase v4 (100% real) |
          Tenant: <code className="bg-gray-200 px-1 rounded">{tenantId}</code> |
          System: <code className="bg-gray-200 px-1 rounded">{systemId}</code>
        </p>
      </div>
    </div>
  );
}