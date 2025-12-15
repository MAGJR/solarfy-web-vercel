import { useState, useEffect, useCallback, useRef } from 'react';
import { enphaseApiService, EnphaseSystemStatus, EnphaseProductionData, EnphaseAlert } from '@/lib/services/enphase-api.service';

/**
 * 🎯 Hook para obter status do sistema Enphase
 */
export function useEnphaseStatus(projectId: string, options: {
  autoRefresh?: boolean;
  refreshInterval?: number;
  forceRefresh?: boolean;
} = {}) {
  const [status, setStatus] = useState<EnphaseSystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const { autoRefresh = true, refreshInterval = 60000, forceRefresh: initialForceRefresh = false } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async (force = false) => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      // Don't setProject if we already configured tenant and system
      // The setProject will be called by the page component
      if (projectId.length > 10) {
        // Assume this is a project ID, not a system ID
        enphaseApiService.setProject(projectId);
      }

      const response = await enphaseApiService.getSystemStatus(force);

      if (response.success && response.data) {
        setStatus(response.data);
        setFromCache(response.fromCache || false);
      } else {
        setError(response.error || 'Failed to fetch system status');
        setStatus(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refresh = useCallback(() => {
    fetchStatus(true);
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus(initialForceRefresh);

    // Auto-refresh se configurado
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchStatus(false);
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus, autoRefresh, refreshInterval, initialForceRefresh]);

  return {
    status,
    loading,
    error,
    fromCache,
    refresh,
  };
}

/**
 * 🎯 Hook para obter dados de produção de energia
 */
export function useEnphaseProduction(projectId: string, params: {
  startDate: string;
  endDate: string;
  period?: string;
}) {
  const [production, setProduction] = useState<EnphaseProductionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduction = useCallback(async () => {
    if (!projectId || !params.startDate || !params.endDate) return;

    try {
      setLoading(true);
      setError(null);

      // Don't setProject if we already configured tenant and system
      // The setProject will be called by the page component
      if (projectId.length > 10) {
        // Assume this is a project ID, not a system ID
        enphaseApiService.setProject(projectId);
      }

      const response = await enphaseApiService.getProductionData(params);

      if (response.success && response.data) {
        setProduction(response.data);
      } else {
        setError(response.error || 'Failed to fetch production data');
        setProduction(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProduction(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, params]);

  useEffect(() => {
    fetchProduction();
  }, [fetchProduction]);

  return {
    production,
    loading,
    error,
    refresh: fetchProduction,
  };
}

/**
 * 🎯 Hook para obter alertas do sistema
 */
export function useEnphaseAlerts(projectId: string, options: {
  activeOnly?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
} = {}) {
  const [alerts, setAlerts] = useState<EnphaseAlert[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { activeOnly = true, autoRefresh = true, refreshInterval = 120000 } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      enphaseApiService.setProject(projectId);
      const response = await enphaseApiService.getSystemAlerts(activeOnly);

      if (response.success && response.data) {
        setAlerts(response.data.alerts);
        setStats({
          total: response.data.total,
          active: response.data.active
        });
      } else {
        setError(response.error || 'Failed to fetch alerts');
        setAlerts([]);
        setStats({ total: 0, active: 0 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAlerts([]);
      setStats({ total: 0, active: 0 });
    } finally {
      setLoading(false);
    }
  }, [projectId, activeOnly]);

  useEffect(() => {
    fetchAlerts();

    // Auto-refresh se configurado
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchAlerts, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAlerts, autoRefresh, refreshInterval]);

  return {
    alerts,
    stats,
    loading,
    error,
    refresh: fetchAlerts,
  };
}

/**
 * 🎯 Hook para gerenciar configuração Enphase
 */
export function useEnphaseConfig(projectId: string) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Para configuração, vamos usar o project repository já existente
  const loadConfig = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar dados do projeto (incluindo configuração Enphase)
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to load project data');
      }

      const projectData = await response.json();

      if (projectData.success && projectData.data) {
        setConfig({
          enphaseSystemId: projectData.data.enphaseSystemId,
          enphaseApiKey: projectData.data.enphaseApiKey,
          enphaseEnabled: projectData.data.enphaseEnabled,
          enphaseStatus: projectData.data.enphaseStatus,
          enphaseLastSync: projectData.data.enphaseLastSync,
        });
      } else {
        throw new Error(projectData.message || 'Invalid project data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const saveConfig = useCallback(async (newConfig: {
    enphaseSystemId: string;
    enphaseApiKey: string;
  }) => {
    if (!projectId) return { success: false, error: 'Project ID not provided' };

    try {
      setLoading(true);
      setError(null);

      enphaseApiService.setProject(projectId);

      // 1. Primeiro, testar a conexão com as credenciais Enphase
      const testResponse = await enphaseApiService.initializeMonitoring({
        enphaseSystemId: newConfig.enphaseSystemId,
        enphaseApiKey: newConfig.enphaseApiKey,
        settings: {
          pollingInterval: 15 * 60 * 1000, // 15 minutos
          enableAlerts: true,
          alertThresholds: {
            productionLoss: 50,
            inverterOfflineMinutes: 15
          }
        }
      });

      if (!testResponse.success) {
        return {
          success: false,
          error: testResponse.error || 'Failed to initialize Enphase monitoring'
        };
      }

      // 2. Se funcionou, salvar no banco de dados do projeto
      const saveResponse = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enphaseSystemId: newConfig.enphaseSystemId,
          enphaseApiKey: newConfig.enphaseApiKey,
          enphaseEnabled: true,
          enphaseStatus: 'ACTIVE',
        }),
      });

      if (!saveResponse.ok) {
        return {
          success: false,
          error: 'Failed to save project configuration'
        };
      }

      const saveData = await saveResponse.json();

      if (saveData.success) {
        await loadConfig(); // Recarregar configuração atualizada
        return { success: true };
      } else {
        return {
          success: false,
          error: saveData.message || 'Failed to save configuration'
        };
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [projectId, loadConfig]);

  const disableMonitoring = useCallback(async () => {
    if (!projectId) return { success: false, error: 'Project ID not provided' };

    try {
      setLoading(true);
      setError(null);

      enphaseApiService.setProject(projectId);

      // 1. Desabilitar no backend
      const backendResponse = await enphaseApiService.disableMonitoring();

      if (!backendResponse.success) {
        return {
          success: false,
          error: backendResponse.error || 'Failed to disable monitoring in backend'
        };
      }

      // 2. Atualizar no banco de dados
      const saveResponse = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enphaseEnabled: false,
          enphaseStatus: 'DISABLED',
        }),
      });

      if (!saveResponse.ok) {
        return {
          success: false,
          error: 'Failed to update project configuration'
        };
      }

      await loadConfig(); // Recarregar configuração
      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [projectId, loadConfig]);

  useEffect(() => {
    if (projectId) {
      loadConfig();
    }
  }, [projectId, loadConfig]);

  return {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    disableMonitoring,
  };
}

/**
 * 🎯 Hook para saúde do sistema Enphase
 */
export function useEnphaseHealth(projectId: string, options: {
  autoRefresh?: boolean;
  refreshInterval?: number;
} = {}) {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { autoRefresh = true, refreshInterval = 300000 } = options; // 5 minutos
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHealth = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      enphaseApiService.setProject(projectId);
      const response = await enphaseApiService.getProjectHealth();

      if (response.success && response.data) {
        setHealth(response.data);
      } else {
        setError(response.error || 'Failed to fetch health data');
        setHealth(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchHealth();

    // Auto-refresh se configurado
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchHealth, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchHealth, autoRefresh, refreshInterval]);

  return {
    health,
    loading,
    error,
    refresh: fetchHealth,
  };
}