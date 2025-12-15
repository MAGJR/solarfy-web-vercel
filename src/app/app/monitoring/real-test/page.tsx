/**
 * 🎯 Real-Test Monitoring Page - Complete Beautiful Dashboard
 *
 * Visualização completa com dados reais da API Enphase v4
 */

'use client';

import { useState, useEffect } from 'react';

export default function RealTestPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [productionData, setProductionData] = useState<any>(null);
  const [batteryData, setBatteryData] = useState<any>(null);
  const [configData, setConfigData] = useState<any>(null);
  const [telemetryData, setTelemetryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carregar dados básicos dos dispositivos
        const devicesResponse = await fetch('http://localhost:3005/api/v1/enphase-real-api/systems/5096922/devices?tenantId=cmhp4brz80001whqjhtdw40lo', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });

        // Carregar dados de produção individual dos microinversores
        const productionResponse = await fetch('http://localhost:3005/api/v1/enphase-fixed/systems/5096922/inverters?tenantId=cmhp4brz80001whqjhtdw40lo', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });

        // Carregar dados da bateria (lifetime)
        const batteryResponse = await fetch('http://localhost:3005/api/v1/enphase-fixed/systems/5096922/lifetime/battery?tenantId=cmhp4brz80001whqjhtdw40lo', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });

        // Carregar configurações da bateria
        const configResponse = await fetch('http://localhost:3005/api/v1/enphase-fixed/config/5096922/battery-settings?tenantId=cmhp4brz80001whqjhtdw40lo', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });

        // Carregar telemetria mais recente
        const telemetryResponse = await fetch('http://localhost:3005/api/v1/enphase-fixed/systems/5096922/latest-telemetry?tenantId=cmhp4brz80001whqjhtdw40lo', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });

        if (devicesResponse.ok && productionResponse.ok && batteryResponse.ok && configResponse.ok && telemetryResponse.ok) {
          const devicesResult = await devicesResponse.json();
          const productionResult = await productionResponse.json();
          const batteryResult = await batteryResponse.json();
          const configResult = await configResponse.json();
          const telemetryResult = await telemetryResponse.json();

          setData(devicesResult);
          setProductionData(productionResult);
          setBatteryData(batteryResult);
          setConfigData(configResult);
          setTelemetryData(telemetryResult);
          console.log('✅ Dados carregados:', {
            devices: devicesResult,
            production: productionResult,
            battery: batteryResult,
            config: configResult,
            telemetry: telemetryResult
          });
        } else {
          setError(`Backend error: ${devicesResponse.status} / ${productionResponse.status} / ${batteryResponse.status} / ${configResponse.status} / ${telemetryResponse.status}`);
        }
      } catch (err) {
        console.error('❌ Erro:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper functions
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('pt-BR');
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp * 1000;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'iq8plus': return '⚡';
      case 'iq envoy': return '📡';
      case 'gateway': return '🌐';
      default: return '🔧';
    }
  };

  // Extrair dados de produção individual
  const microInvertersProduction = productionData?.data?.inverters?.[0]?.micro_inverters || [];
  const totalProductionLifetime = microInvertersProduction.reduce((sum: number, inv: any) => sum + (inv.energy?.value || 0), 0);
  const totalProductionKwh = (totalProductionLifetime / 1000).toFixed(1);

  // Calcular estatísticas de produção
  const calculateProductionStats = () => {
    const avgProductionPerInverter = totalProductionLifetime / microInvertersProduction.length;

    // Top 5 produtores
    const topProducers = [...microInvertersProduction]
      .sort((a: any, b: any) => (b.energy?.value || 0) - (a.energy?.value || 0))
      .slice(0, 5);

    // Bottom 5 produtores
    const bottomProducers = [...microInvertersProduction]
      .sort((a: any, b: any) => (a.energy?.value || 0) - (b.energy?.value || 0))
      .slice(0, 5);

    // Todos os microinversores ordenados por produção
    const allInvertersSorted = [...microInvertersProduction]
      .sort((a: any, b: any) => (b.energy?.value || 0) - (a.energy?.value || 0));

    return {
      avgProductionPerInverter,
      topProducers,
      bottomProducers,
      allInvertersSorted
    };
  };

  const productionStats = calculateProductionStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-solar-50 via-blue-50 to-indigo-100 p-8">
        <div className="w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-yellow-400 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-orange-400 animate-pulse mx-auto"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent mt-8 mb-4">
              Solar Energy System
            </h1>
            <p className="text-xl text-gray-600 mb-6">Loading Juanita Whitney Solar System</p>
            <div className="flex justify-center gap-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-8 flex items-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Connection Error</h2>
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <p className="text-gray-500 mb-8">
            Backend URL: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3005</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  const devices = data?.data?.devices?.devices;
  const micros = devices?.micros || [];
  const meters = devices?.meters || [];
  const gateways = devices?.gateways || [];

  // Calculate system metrics
  const totalInverters = micros.length;
  const activeInverters = micros.filter(inv => inv.status === 'normal').length;
  const systemCapacity = totalInverters * 0.385; // IQ8PLUS is approximately 385W
  const systemCapacityKw = (systemCapacity / 1000).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-solar-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-blue-600 bg-clip-text text-transparent">
                ☀️ Solarfy Energy Dashboard
              </h1>
              <p className="text-xl text-gray-700 mt-2">
                Juanita Whitney Solar System • Real-time Monitoring
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-gray-600">System ID:</span>
                <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">5096922</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">Tenant:</span>
                <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded">cmhp4brz80001whqjhtdw40lo</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold border border-green-300 shadow-lg">
                ⚡ {activeInverters}/{totalInverters} Active
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-bold border border-blue-300 shadow-lg">
                📊 {data?.data?.devices?.total_devices || 0} Total Devices
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold border border-purple-300 shadow-lg">
                📡 Enphase API v4
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold border border-green-300 shadow-lg">
                🔋 {totalProductionKwh}kW Total Produzido
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="w-full px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: '📊 Overview', icon: '🏠' },
              { id: 'inverters', name: '⚡ Microinverters', icon: '🔧' },
              { id: 'production', name: '⚡ Produção Individual', icon: '📈' },
              { id: 'all-micros', name: '📋 Todos Inversores', icon: '📊' },
              { id: 'battery', name: '🔋 Bateria', icon: '🔋' },
              { id: 'config', name: '⚙️ Configurações', icon: '⚙️' },
              { id: 'telemetry', name: '📡 Telemetria', icon: '📡' },
              { id: 'meters', name: '📏 Smart Meters', icon: '📊' },
              { id: 'gateways', name: '🌐 Gateways', icon: '📡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-4 font-semibold text-lg transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        {/* System Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                    </svg>
                  </div>
                  <span className="text-4xl font-bold">5096922</span>
                </div>
                <p className="text-yellow-100 text-lg">System ID</p>
                <p className="text-yellow-200 text-sm mt-2">Juanita Whitney</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-4xl font-bold">{activeInverters}</span>
                </div>
                <p className="text-green-100 text-lg">Active Inverters</p>
                <p className="text-green-200 text-sm mt-2">100% Online</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h2a1 1 0 100-2 2 2 0 00-2 2v11a2 2 0 104 0V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-4xl font-bold">{systemCapacityKw}</span>
                </div>
                <p className="text-purple-100 text-lg">System Size</p>
                <p className="text-purple-200 text-sm mt-2">kW Peak Power</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <span className="text-4xl font-bold">{devices?.total_devices}</span>
                </div>
                <p className="text-blue-100 text-lg">Total Devices</p>
                <p className="text-blue-200 text-sm mt-2">System Components</p>
              </div>
            </div>

            {/* Device Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">⚡</span>
                    Microinverters
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    {micros.length} units
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-semibold">IQ8PLUS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold">Microinverter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600">All Normal</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>What are Microinverters?</strong> Small devices that convert DC power from individual solar panels to AC power. Each panel has its own microinverter for maximum efficiency and safety.
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">📏</span>
                    Smart Meters
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    {meters.length} units
                  </span>
                </div>
                <div className="space-y-4">
                  {meters.map((meter: any, index) => (
                    <div key={meter.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800 capitalize">{meter.name}</p>
                          <p className="text-sm text-gray-600">{meter.product_name}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {meter.status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Serial: {meter.serial_number}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>What are Smart Meters?</strong> Devices that measure energy production (production meter) and household consumption (consumption meter) for accurate monitoring and billing.
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">🌐</span>
                    Gateway
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    {gateways.length} unit
                  </span>
                </div>
                {gateways.map((gateway: any) => (
                  <div key={gateway.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all cursor-pointer">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800">{gateway.name}</p>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {gateway.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Model: {gateway.model}</p>
                        <p>Firmware: {gateway.emu_sw_version}</p>
                        <p>Last Report: {getTimeAgo(gateway.last_report_at)}</p>
                      </div>
                      {gateway.cellular_modem && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          <p className="font-semibold">Cellular Modem:</p>
                          <p>IMEI: {gateway.cellular_modem.imei}</p>
                          <p>Plan: {gateway.cellular_modem.plan_start_date && gateway.cellular_modem.plan_end_date ?
                            `Valid until ${new Date(gateway.cellular_modem.plan_end_date * 1000).toLocaleDateString()}`
                            : 'Unknown'
                          }</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>What is a Gateway?</strong> Central communication hub that connects all solar components to the internet, enabling remote monitoring and control of the solar system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Microinverters Tab */}
        {activeTab === 'inverters' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-4xl">⚡</span>
                Microinverters Details
              </h2>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{activeInverters}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600">{totalInverters - activeInverters}</p>
                  <p className="text-sm text-gray-600">Inactive</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {micros.map((inverter: any, index: number) => (
                <div
                  key={inverter.id}
                  onClick={() => setSelectedDevice(inverter)}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all cursor-pointer hover:scale-105 group"
                  style={{
                    background: inverter.status === 'normal'
                      ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                      : 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)'
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                        {getDeviceIcon(inverter.model)} {inverter.name}
                      </h3>
                      <p className="text-sm font-semibold text-gray-700">{inverter.model}</p>
                      <p className="text-xs text-gray-600 mt-1">PN: {inverter.part_number}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">SN: {inverter.serial_number}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      inverter.status === 'normal'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {inverter.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {inverter.active && (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-semibold">Active</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <p>{getTimeAgo(inverter.last_report_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meters Tab */}
        {activeTab === 'meters' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-8">
              <span className="text-4xl">📏</span>
              Smart Meters Information
            </h2>

            <div className="space-y-6">
              {meters.map((meter: any, index: number) => (
                <div
                  key={meter.id}
                  onClick={() => setSelectedDevice(meter)}
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all cursor-pointer hover:scale-102 group"
                  style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 capitalize mb-2 flex items-center gap-2">
                        📊 {meter.name} Meter
                      </h3>
                      <p className="text-lg text-gray-700">{meter.product_name}</p>
                      <p className="text-sm text-gray-600">Model: {meter.model}</p>
                      <p className="text-sm text-gray-500 font-mono">Serial: {meter.serial_number}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        meter.status === 'normal'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {meter.status}
                      </span>
                      <div className="mt-2 text-xs text-gray-500">
                        Config: {meter.config_type}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Configuration</p>
                      <p className="text-sm font-semibold text-gray-700 capitalize">{meter.config_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">State</p>
                      <p className="text-sm font-semibold text-gray-700 capitalize">{meter.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Part Number</p>
                      <p className="text-sm font-mono text-gray-700">{meter.part_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Report</p>
                      <p className="text-sm font-semibold text-gray-700">{getTimeAgo(meter.last_report_at)}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>How {meter.name === 'production' ? 'Production' : 'Consumption'} Meters Work:</strong>
                      {meter.name === 'production'
                        ? ' Measures the total electricity generated by your solar system. Essential for tracking production efficiency and system performance.'
                        : ' Measures the electricity your home consumes. Helps understand self-consumption rates and energy independence.'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production Tab */}
        {activeTab === 'production' && (
          <div className="space-y-8">
            {/* Production Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h2a1 1 0 100-2 2 2 0 00-2 2v11a2 2 0 104 0V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-4xl font-bold">{totalProductionKwh}</span>
                </div>
                <p className="text-blue-100 text-lg">Total Produzido</p>
                <p className="text-blue-200 text-sm mt-2">kW acumulados</p>
              </div>

              <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <span className="text-4xl font-bold">{(productionStats.avgProductionPerInverter / 1000).toFixed(1)}</span>
                </div>
                <p className="text-purple-100 text-lg">Média por Inversor</p>
                <p className="text-purple-200 text-sm mt-2">kW individual</p>
              </div>
            </div>

            {/* Top and Bottom Producers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top 5 Producers */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">🏆</span>
                  Top 5 Produtores
                </h3>
                <div className="space-y-4">
                  {productionStats.topProducers.map((inv: any, index: number) => (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedDevice(inv)}
                      className="border-2 border-green-200 rounded-2xl p-4 hover:shadow-2xl transition-all cursor-pointer hover:scale-102 bg-gradient-to-r from-green-50 to-emerald-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-gray-800">
                            #{index + 1} {inv.serial_number.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">{inv.model}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {inv.power_produced?.value || 0}W
                          </div>
                          <div className="text-sm text-green-700">
                            {((inv.energy?.value || 0) / 1000).toFixed(1)}kW total
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom 5 Producers */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  Menor Produção
                </h3>
                <div className="space-y-4">
                  {productionStats.bottomProducers.map((inv: any, index: number) => (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedDevice(inv)}
                      className="border-2 border-orange-200 rounded-2xl p-4 hover:shadow-2xl transition-all cursor-pointer hover:scale-102 bg-gradient-to-r from-orange-50 to-red-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-gray-800">
                            #{index + 1} {inv.serial_number.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">{inv.model}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600">
                            {inv.power_produced?.value || 0}W
                          </div>
                          <div className="text-sm text-orange-700">
                            {((inv.energy?.value || 0) / 1000).toFixed(1)}kW total
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Microinverters Tab */}
        {activeTab === 'all-micros' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-4xl">📋</span>
                Todos os Microinversores (48 unidades)
              </h2>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{microInvertersProduction.length}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{totalProductionKwh}</p>
                  <p className="text-sm text-gray-600">kW Produzido</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{(productionStats.avgProductionPerInverter / 1000).toFixed(1)}</p>
                  <p className="text-sm text-gray-600">kW Média</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {productionStats.allInvertersSorted.map((inv: any, index: number) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedDevice(inv)}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all cursor-pointer hover:scale-105 group"
                  style={{
                    background: index < 10
                      ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' // Top 10 - verde
                      : index >= microInvertersProduction.length - 10
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' // Bottom 10 - laranja
                      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' // Resto - cinza
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-gray-800">#{index + 1}</span>
                        {index < 10 && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🏆 Top</span>}
                        {index >= microInvertersProduction.length - 10 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">📊 Baixo</span>}
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                        {inv.serial_number.slice(-8)}
                      </h3>
                      <p className="text-sm font-semibold text-gray-700">{inv.model}</p>
                      <p className="text-xs text-gray-600 mt-1">SN: {inv.serial_number}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      inv.status === 'normal'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="text-left">
                      <div className="text-sm font-semibold text-green-600">
                        📊 {((inv.energy?.value || 0) / 1000).toFixed(1)}kW
                      </div>
                      <div className="text-xs text-gray-500">Total produzido</div>
                    </div>
                    {inv.power_produced?.value && inv.power_produced.value > 0 ? (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-600">
                          ⚡ {inv.power_produced.value}W
                        </div>
                        <div className="text-xs text-gray-500">Produzindo agora</div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-400">
                          ⚸️ 0W
                        </div>
                        <div className="text-xs text-gray-400">Offline</div>
                      </div>
                    )}
                  </div>

                  {inv.last_report_date && (
                    <div className="mt-2 text-xs text-gray-500">
                      🕐 Último reporte: {new Date(inv.last_report_date).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">📈 Informações sobre Produção:</h4>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc list-inside">
                <li><strong>Top 10 produtores</strong> (verde): Os microinversores que mais geraram energia em kW</li>
                <li><strong>Menor produção</strong> (laranja): Os microinversores com menor geração acumulada</li>
                <li><strong>Energy (kW)</strong>: Total acumulado desde a instalação</li>
                <li><strong>Power (W)</strong>: Produção no momento atual (pode ser 0W durante a noite)</li>
                <li>**Todos estão online**: Status "normal" indica funcionamento correto</li>
              </ul>
            </div>
          </div>
        )}

        {/* Gateways Tab */}
        {activeTab === 'gateways' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-8">
              <span className="text-4xl">🌐</span>
              Communication Gateway
            </h2>

            {gateways.map((gateway: any) => (
              <div
                key={gateway.id}
                onClick={() => setSelectedDevice(gateway)}
                className="border-2 border-gray-200 rounded-2xl p-8 mb-6 hover:shadow-2xl transition-all cursor-pointer hover:scale-102"
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{gateway.name}</h3>
                    <div className="space-y-2">
                      <p className="text-lg text-gray-700">
                        <span className="font-semibold">Product:</span> {gateway.product_name}
                      </p>
                      <p className="text-lg text-gray-700">
                        <span className="font-semibold">Model:</span> {gateway.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Serial:</span> {gateway.serial_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Part:</span> {gateway.part_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      ✅ {gateway.status}
                    </span>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">SKU: {gateway.sku}</p>
                    </div>
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">Network Information</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Firmware Version:</p>
                          <p className="text-sm font-mono text-gray-700">{gateway.emu_sw_version}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Report:</p>
                          <p className="text-sm text-gray-700">{formatTime(gateway.last_report_at)}</p>
                        </div>
                      </div>
                    </div>

                    {gateway.cellular_modem && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3">Cellular Modem</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">IMEI:</p>
                            <p className="text-sm font-mono text-gray-700">{gateway.cellular_modem.imei}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Part Number:</p>
                            <p className="text-sm text-gray-700">{gateway.cellular_modem.part_num}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">SKU:</p>
                            <p className="text-sm text-gray-700">{gateway.cellular_modem.sku}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Plan Period:</p>
                            <p className="text-sm text-gray-700">
                              {new Date(gateway.cellular_modem.plan_start_date * 1000).toLocaleDateString()} -
                              {new Date(gateway.cellular_modem.plan_end_date * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">💡 How Gateways Work:</h4>
                    <p className="text-sm text-green-700">
                      The IQ Envoy Gateway is the central hub that enables:
                      <ul className="mt-2 ml-4 list-disc list-inside">
                        <li>Real-time data collection from all system components</li>
                        <li>Remote monitoring and control capabilities</li>
                        <li>Internet connectivity via cellular or Ethernet</li>
                        <li>Local data processing and analytics</li>
                        <li>Integration with grid monitoring systems</li>
                      </ul>
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Battery Tab */}
        {activeTab === 'battery' && (
          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                <span className="text-4xl">🔋</span>
                Dados da Bateria (Lifetime)
              </h2>

              {batteryData?.data?.batteries ? (
                <div className="space-y-6">
                  {/* Se for um array, mapeia; se for objeto, converte em array */}
                  {Array.isArray(batteryData.data.batteries) ? (
                    batteryData.data.batteries.map((battery: any, index: number) => (
                      <div key={index} className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          🔋 Bateria #{index + 1}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-gray-600">System ID:</p>
                            <p className="font-mono text-sm font-bold text-gray-800">{battery.system_id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status:</p>
                            <p className="font-semibold text-gray-800">{battery.meta?.status || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Último Reporte:</p>
                            <p className="font-semibold">{new Date(battery.meta?.last_report_at * 1000).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Operacional desde:</p>
                            <p className="font-semibold">{new Date(battery.meta?.operational_at * 1000).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>

                        {/* Estatísticas de carga/descarga */}
                        {battery.charge && battery.discharge && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <h4 className="font-semibold text-gray-800 mb-3">📊 Estatísticas de Energia:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-green-600 font-semibold">📈 Total Cargas:</p>
                                <p className="text-2xl font-bold text-green-700">
                                  {battery.charge.reduce((sum: number, val: number) => sum + val, 0)} Wh
                                </p>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-4">
                                <p className="text-sm text-orange-600 font-semibold">📉 Total Descargas:</p>
                                <p className="text-2xl font-bold text-orange-700">
                                  {battery.discharge.reduce((sum: number, val: number) => sum + val, 0)} Wh
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        🔋 Sistema de Bateria
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600">System ID:</p>
                          <p className="font-mono text-sm font-bold text-gray-800">{batteryData.data.batteries.system_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status:</p>
                          <p className="font-semibold text-gray-800">{batteryData.data.batteries.meta?.status || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Data Início:</p>
                          <p className="font-semibold">{batteryData.data.batteries.start_date || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Último Reporte:</p>
                          <p className="font-semibold">{new Date(batteryData.data.batteries.meta?.last_report_at * 1000).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>

                      {/* Estatísticas de carga/descarga */}
                      {batteryData.data.batteries.charge && batteryData.data.batteries.discharge && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <h4 className="font-semibold text-gray-800 mb-3">📊 Estatísticas de Energia:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-lg p-4">
                              <p className="text-sm text-green-600 font-semibold">📈 Total Cargas:</p>
                              <p className="text-2xl font-bold text-green-700">
                                {batteryData.data.batteries.charge.reduce((sum: number, val: number) => sum + val, 0)} Wh
                              </p>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4">
                              <p className="text-sm text-orange-600 font-semibold">📉 Total Descargas:</p>
                              <p className="text-2xl font-bold text-orange-700">
                                {batteryData.data.batteries.discharge.reduce((sum: number, val: number) => sum + val, 0)} Wh
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum dado de bateria disponível</p>
                  <p className="text-sm text-gray-400 mt-2">Este sistema pode não ter baterias instaladas</p>
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">🔋 Sobre os Dados da Bateria:</h4>
                <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc list-inside">
                  <li><strong>Energy Lifetime</strong>: Energia total armazenada/liberada pela bateria</li>
                  <li><strong>Reading Count</strong>: Número de medições registradas</li>
                  <li><strong>Period</strong>: Período de monitoramento da bateria</li>
                  <li>Dados coletados via endpoint <code>/api/v4/systems/5096922/battery_lifetime</code></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                <span className="text-4xl">⚙️</span>
                Configurações do Sistema
              </h2>

              {configData?.data?.settings ? (
                <div className="space-y-6">
                  {configData.data.settings.map((config: any, index: number) => (
                    <div key={index} className="border-2 border-purple-200 rounded-2xl p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        ⚙️ Configuração da Bateria #{index + 1}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">ID da Bateria:</p>
                          <p className="font-mono text-sm font-bold text-gray-800">{config.batteryId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Modo de Operação:</p>
                          <p className="font-semibold text-gray-800">{config.mode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Reserva de SOC:</p>
                          <p className="font-semibold text-gray-800">{config.reserveSoc}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Carregar da Rede:</p>
                          <p className="font-semibold">{config.chargeFromGrid ? 'Sim' : 'Não'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Descarregar para Rede:</p>
                          <p className="font-semibold">{config.dischargeToGrid ? 'Sim' : 'Não'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Preservação Backup:</p>
                          <p className="font-semibold text-gray-800">{config.backupPreserve}%</p>
                        </div>
                      </div>

                      {config.peakShaving && (
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Peak Shaving:</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Ativado:</p>
                              <p className="font-semibold">{config.peakShaving.enabled ? 'Sim' : 'Não'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Limite (W):</p>
                              <p className="font-semibold">{config.peakShaving.threshold}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma configuração disponível</p>
                  <p className="text-sm text-gray-400 mt-2">Configurações simuladas (dados placeholders)</p>
                </div>
              )}

              <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">⚙️ Sobre as Configurações:</h4>
                <ul className="text-sm text-purple-700 space-y-1 ml-4 list-disc list-inside">
                  <li><strong>Modo</strong>: Como a bateria opera (self-consumption, backup, etc.)</li>
                  <li><strong>SOC Reserve</strong>: Nível mínimo de carga para preservar a bateria</li>
                  <li><strong>Peak Shaving</strong>: Limita o consumo da rede em horários de pico</li>
                  <li>Configurações obtidas via <code>/api/v4/systems/config/5096922/battery_settings</code></li>
                  <li><strong>Nota</strong>: Estes são dados simulados para demonstração</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Telemetry Tab */}
        {activeTab === 'telemetry' && (
          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                <span className="text-4xl">📡</span>
                Telemetria mais Recente
              </h2>

              {telemetryData?.data?.telemetry ? (
                <div className="space-y-6">
                  <div className="border-2 border-green-200 rounded-2xl p-6 bg-gradient-to-r from-green-50 to-emerald-50">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      📡 Dados de Telemetria em Tempo Real
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(telemetryData.data.telemetry).map(([key, value]) => (
                        <div key={key} className="bg-white/80 rounded-lg p-4">
                          <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</p>
                          <p className="font-bold text-gray-800">
                            {typeof value === 'number' ?
                              (key.includes('power') || key.includes('voltage') ? `${value}W` :
                               key.includes('energy') ? `${(value/1000).toFixed(1)}kWh` :
                               key.includes('current') ? `${value}A` : value) :
                              String(value)
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong>Timestamp:</strong> {new Date(telemetryData.data.timestamp).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>System ID:</strong> {telemetryData.data.systemId}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Tenant ID:</strong> {telemetryData.data.tenantId}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum dado de telemetria disponível</p>
                  <p className="text-sm text-gray-400 mt-2">Dados coletados via latest_telemetry endpoint</p>
                </div>
              )}

              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">📡 Sobre a Telemetria:</h4>
                <ul className="text-sm text-green-700 space-y-1 ml-4 list-disc list-inside">
                  <li><strong>Latest Telemetry</strong>: Dados mais recentes do sistema em tempo real</li>
                  <li><strong>Production</strong>: Dados de geração de energia</li>
                  <li><strong>Consumption</strong>: Dados de consumo do sistema</li>
                  <li><strong>Storage</strong>: Status de armazenamento (se aplicável)</li>
                  <li><strong>Grid</strong>: Status da conexão com a rede elétrica</li>
                  <li>Dados obtidos via <code>/api/v4/systems/5096922/latest_telemetry</code></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Selected Device Details */}
        {selectedDevice && (
          <div className="fixed bottom-8 right-8 w-96 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Device Details</h3>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(selectedDevice).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
    </div>
  );
}