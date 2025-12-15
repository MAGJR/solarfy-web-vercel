/**
 * 🎯 Enphase System Context
 *
 * Contexto para gerenciar dinamicamente tenantId e systemId
 * Em produção, esses dados viriam do projeto atual, usuário logado, etc.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { enphaseApiService } from '@/lib/services/enphase-api.service';

export interface EnphaseSystem {
  tenantId: string;
  systemId: string;
  systemName?: string;
  isActive: boolean;
}

interface EnphaseSystemContextType {
  // Sistema atual
  currentSystem: EnphaseSystem | null;

  // Actions
  setCurrentSystem: (system: EnphaseSystem | null) => void;
  loadAvailableSystems: () => Promise<void>;

  // Estado
  loading: boolean;
  error: string | null;

  // Sistemas disponíveis (para o tenant atual)
  availableSystems: Array<{
    system_id: number;
    name: string;
    public_name: string;
    status: string;
    modules: number;
    size_w: number;
    energy_lifetime: number;
  }>;
}

const EnphaseSystemContext = createContext<EnphaseSystemContextType | undefined>(undefined);

interface EnphaseSystemProviderProps {
  children: ReactNode;
  defaultTenantId?: string; // Em produção viria do usuário logado
}

export function EnphaseSystemProvider({
  children,
  defaultTenantId
}: EnphaseSystemProviderProps) {
  const [currentSystem, setCurrentSystem] = useState<EnphaseSystem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSystems, setAvailableSystems] = useState([]);

  // Função para definir o sistema atual
  const handleSetCurrentSystem = (system: EnphaseSystem | null) => {
    setCurrentSystem(system);

    if (system) {
      // Configurar o serviço com os novos dados
      enphaseApiService.setTenant(system.tenantId, system.systemId);

      // Salvar no localStorage para persistência
      localStorage.setItem('enphase_current_system', JSON.stringify(system));
    } else {
      // Limpar o serviço
      enphaseApiService.clearProject();
      localStorage.removeItem('enphase_current_system');
    }
  };

  // Carregar sistemas disponíveis para o tenant
  const loadAvailableSystems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Se não tiver tenant, não carrega nada
      if (!defaultTenantId && !currentSystem?.tenantId) {
        setAvailableSystems([]);
        return;
      }

      const tenantId = currentSystem?.tenantId || defaultTenantId;

      // Configurar o serviço com o tenant
      enphaseApiService.setTenant(tenantId, 'temp'); // systemId temporário

      // Buscar sistemas disponíveis
      const response = await enphaseApiService.getSystems();

      if (response.success && response.data) {
        setAvailableSystems(response.data);
      } else {
        setError(response.error || 'Failed to load systems');
      }

    } catch (err) {
      console.error('Error loading available systems:', err);
      setError(err instanceof Error ? err.message : 'Failed to load systems');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar sistema salvo no localStorage
  useEffect(() => {
    const savedSystem = localStorage.getItem('enphase_current_system');

    if (savedSystem) {
      try {
        const parsedSystem = JSON.parse(savedSystem);
        handleSetCurrentSystem(parsedSystem);
      } catch (err) {
        console.error('Error parsing saved system:', err);
        localStorage.removeItem('enphase_current_system');
      }
    }
  }, []);

  // Efeito para carregar sistemas disponíveis quando o tenant mudar
  useEffect(() => {
    if (defaultTenantId || currentSystem?.tenantId) {
      loadAvailableSystems();
    }
  }, [defaultTenantId, currentSystem?.tenantId]);

  const contextValue: EnphaseSystemContextType = {
    currentSystem,
    setCurrentSystem: handleSetCurrentSystem,
    loadAvailableSystems,
    loading,
    error,
    availableSystems,
  };

  return (
    <EnphaseSystemContext.Provider value={contextValue}>
      {children}
    </EnphaseSystemContext.Provider>
  );
}

// Hook para usar o contexto
export function useEnphaseSystem() {
  const context = useContext(EnphaseSystemContext);

  if (context === undefined) {
    throw new Error('useEnphaseSystem must be used within an EnphaseSystemProvider');
  }

  return context;
}

// Hook auxiliar para verificar se há um sistema ativo
export function useHasActiveSystem() {
  const { currentSystem } = useEnphaseSystem();
  return !!currentSystem?.isActive;
}

// Hook auxiliar para obter o sistema atual com validação
export function useCurrentSystem() {
  const { currentSystem, loading, error } = useEnphaseSystem();

  return {
    system: currentSystem,
    loading,
    error,
    hasSystem: !!currentSystem,
    tenantId: currentSystem?.tenantId,
    systemId: currentSystem?.systemId,
    systemName: currentSystem?.systemName,
  };
}