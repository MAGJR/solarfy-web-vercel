/**
 * 🎯 All Endpoints Visualization
 *
 * Componente que mostra TODOS os 12 endpoints funcionando com dados reais
 * Para visualização completa da implementação
 */

'use client';

import { useState, useEffect } from 'react';
import { EnphaseApiService } from './enphase-api-service';

export default function AllEndpointsVisualization() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  // Dados reais para teste
  const tenantId = 'cmhp4brz80001whqjhtdw40lo';
  const systemId = '5096922';

  const apiService = new EnphaseApiService();

  // Lista de todos os endpoints para teste
  const endpoints = [
    { name: 'System Status', method: 'getSystemStatus', icon: '📊' },
    { name: 'Production Meter Readings', method: 'getProductionMeterReadings', icon: '⚡' },
    { name: 'RGM Stats', method: 'getRgmStats', icon: '📈' },
    { name: 'Devices', method: 'getDevices', icon: '🔧' },
    { name: 'Inverters Summary', method: 'getInvertersSummary', icon: '🔄' },
    { name: 'Consumption Lifetime', method: 'getConsumptionLifetime', icon: '🏠' },
    { name: 'Energy Lifetime', method: 'getEnergyLifetime', icon: '⚡' },
    { name: 'Battery Lifetime', method: 'getBatteryLifetime', icon: '🔋' },
    { name: 'Energy Import Lifetime', method: 'getEnergyImportLifetime', icon: '📥' },
    { name: 'Energy Export Lifetime', method: 'getEnergyExportLifetime', icon: '📤' },
    { name: 'Latest Telemetry', method: 'getLatestTelemetry', icon: '📡' },
    { name: 'Production Telemetry', method: 'getProductionTelemetry', icon: '⚡' },
    { name: 'Consumption Telemetry', method: 'getConsumptionTelemetry', icon: '🏠' }
  ];

  useEffect(() => {
    const testAllEndpoints = async () => {
      setLoading(true);
      setResults({});
      setErrors({});

      // Configurar API service
      apiService.setTenant(tenantId, systemId);

      const newResults = {};
      const newErrors = {};

      // Testar cada endpoint sequencialmente para evitar rate limiting
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        try {
          console.log(`Testing ${endpoint.name}...`);
          const response = await apiService[endpoint.method]();

          if (response.success) {
            newResults[endpoint.name] = response.data;
            console.log(`✅ ${endpoint.name} - Success`);
          } else {
            newErrors[endpoint.name] = response.error;
            console.log(`❌ ${endpoint.name} - Failed: ${response.error}`);
          }
        } catch (error) {
          newErrors[endpoint.name] = error.message;
          console.log(`❌ ${endpoint.name} - Exception: ${error.message}`);
        }

        // Delay entre requisições
        if (i < endpoints.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setResults(newResults);
      setErrors(newErrors);
      setLoading(false);
    };

    testAllEndpoints();
  }, []);

  // Formatar dados para visualização
  const formatDataForDisplay = (data, endpointName) => {
    if (!data) return 'No data';

    try {
      switch (endpointName) {
        case 'System Status':
          return `Power: ${data.currentPowerW}W | Today: ${data.energyTodayKwh}kWh | Status: ${data.status}`;

        case 'Production Meter Readings':
          if (Array.isArray(data)) {
            return `${data.length} readings | Latest: ${data[0]?.current_power}W`;
          } else if (data.current_power) {
            return `Current: ${data.current_power}W | Today: ${data.energy_today}Wh`;
          }
          return 'Production data available';

        case 'Devices':
          const totalDevices = data.total_devices || 0;
          const micros = data.devices?.micros?.length || 0;
          const meters = data.devices?.meters?.length || 0;
          return `Total: ${totalDevices} | Micros: ${micros} | Meters: ${meters}`;

        case 'Inverters Summary':
          return `Total: ${data.total_inverters} | Micros: ${data.microinverters} | Others: ${data.other_inverters}`;

        case 'RGM Stats':
          return `System ${data.system_id} | Status: ${data.status} | Meters: ${data.meters?.length || 0}`;

        case 'Energy Lifetime':
        case 'Consumption Lifetime':
        case 'Energy Import Lifetime':
        case 'Energy Export Lifetime':
          const energyMWh = (data.energy_wh / 1000000).toFixed(2);
          return `Energy: ${energyMWh} MWh | Readings: ${data.reading_count} | Devices: ${data.device_count}`;

        case 'Battery Lifetime':
          const batteries = data.batteries?.length || 0;
          return `${batteries} batteries | System: ${data.system_id}`;

        case 'Latest Telemetry':
        case 'Production Telemetry':
        case 'Consumption Telemetry':
          return `Source: ${data.source} | System: ${data.systemId} | Tenant: ${data.tenantId}`;

        default:
          return typeof data === 'object' ? JSON.stringify(data).substring(0, 100) + '...' : String(data);
      }
    } catch (error) {
      return 'Error formatting data';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Testando Todos os Endpoints</h2>
          <p className="text-gray-600">Carregando dados reais da API Enphase v4...</p>
          <p className="text-sm text-gray-500 mt-2">
            Isso pode levar um momento devido ao rate limiting da API
          </p>
        </div>
      </div>
    );
  }

  const successCount = Object.keys(results).length;
  const totalCount = endpoints.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Visualização Completa da API Enphase v4
        </h1>
        <p className="text-gray-600 mb-4">
          Sistema Juanita Whitney (ID: {systemId}) | Tenant: {tenantId}
        </p>
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-green-600 font-semibold">
            ✅ Funcionando: {successCount}/{totalCount} ({successRate}%)
          </div>
          <div className="text-red-600 font-semibold">
            ❌ Falhas: {totalCount - successCount}
          </div>
          <div className="text-blue-600 font-semibold">
            📊 Fonte: 100% API Real
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {endpoints.map((endpoint) => {
          const hasData = !!results[endpoint.name];
          const hasError = !!errors[endpoint.name];

          return (
            <div
              key={endpoint.name}
              className={`p-4 rounded-lg border-2 ${
                hasData
                  ? 'border-green-200 bg-green-50'
                  : hasError
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{endpoint.icon}</span>
                  <h3 className="font-semibold text-gray-900">
                    {endpoint.name}
                  </h3>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  hasData
                    ? 'bg-green-100 text-green-800'
                    : hasError
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {hasData ? '✅ OK' : hasError ? '❌ Error' : '⏳ Pending'}
                </div>
              </div>

              {hasData && (
                <div className="text-sm text-gray-700">
                  <div className="font-medium text-green-700 mb-1">Dados:</div>
                  <div className="bg-white p-2 rounded border border-green-200">
                    {formatDataForDisplay(results[endpoint.name], endpoint.name)}
                  </div>
                </div>
              )}

              {hasError && (
                <div className="text-sm text-red-700">
                  <div className="font-medium text-red-700 mb-1">Erro:</div>
                  <div className="bg-white p-2 rounded border border-red-200 text-red-600">
                    {errors[endpoint.name]}
                  </div>
                </div>
              )}

              {/* Method name for developers */}
              <div className="mt-3 text-xs text-gray-500 font-mono">
                apiService.{endpoint.method}()
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Summary */}
      {successCount === totalCount && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>🎉 SUCESSO TOTAL!</strong> Todos os {totalCount} endpoints estão funcionando
                com dados 100% reais da API Enphase v4 através do Integration Layer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Partial Success */}
      {successCount > 0 && successCount < totalCount && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>⚠️ PARCIAL:</strong> {successCount} de {totalCount} endpoints funcionando.
                Verifique os erros acima e corrija se necessário.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* API Info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            <strong>📡 Integração Layer:</strong> Backend URL: {apiService.baseUrl} |
            Rate Limiting: 1s entre requisições |
            Fonte: 100% API Enphase v4 Real
          </p>
        </div>
      </div>
    </div>
  );
}