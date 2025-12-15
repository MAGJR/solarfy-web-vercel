# CRM e Monitoring System

Este documento descreve a implementação do sistema de CRM (Customer Relationship Management) e Monitoring integrados ao projeto Solarfy.

## Visão Geral

O sistema consiste em duas tabelas principais:
1. **CRM Leads** - Gerenciamento de leads e clientes potenciais
2. **Monitoring Data** - Monitoramento de equipamentos de energia solar

## Estrutura do Banco de Dados

### CRM Leads (crm_leads)
- **id**: Identificador único
- **name**: Nome do lead/cliente
- **email**: Email de contato
- **phone**: Telefone (opcional)
- **company**: Nome da empresa
- **status**: Status do lead (LEAD, CONTACTED, QUALIFIED, etc.)
- **score**: Pontuação do lead (0-100)
- **assignee**: Responsável pelo lead
- **productService**: Tipo de produto/serviço
- **notes**: Anotações adicionais
- **lastActivity**: Data da última atividade
- **createdBy**: ID do usuário que criou o lead
- **createdAt/updatedAt**: Datas de criação e atualização

### User Journey Steps (user_journey_steps)
Tabela relacionada para registrar o progresso do lead no funil de vendas:
- **step**: Tipo de etapa (INITIAL_CONTACT, SITE_VISIT_SCHEDULED, etc.)
- **status**: Status da etapa (PENDING, IN_PROGRESS, COMPLETED, etc.)
- **completedAt**: Data de conclusão
- **notes**: Anotações da etapa
- **assignedTo**: Responsável pela etapa

### Monitoring Data (monitoring_data)
Dados de monitoramento vinculados aos leads do CRM:
- **crmLeadId**: ID do lead do CRM (chave estrangeira)
- **customerType**: Tipo de cliente (RESIDENTIAL, COMMERCIAL, FARM)
- **address**: Endereço da instalação
- **peakKwp**: Potência máxima (kWp)
- **energyTodayKwh**: Energia produzida hoje (kWh)
- **equipmentStatus**: Status do equipamento (ONLINE, WARNING, OFFLINE, MAINTENANCE)
- **alertLevel**: Nível de alerta (NORMAL, WARNING, CRITICAL)
- **lastUpdate**: Última atualização dos dados

## Relacionamento

O sistema foi projetado com um relacionamento obrigatório:
- **Monitoring Data** só pode ser criado se existir um **CRM Lead** correspondente
- Isso garante que o monitoramento seja feito apenas para clientes qualificados

## Componentes do Sistema

### Frontend

#### CrmTable Component
- **Localização**: `/src/presentation/components/app/components/crm-table.tsx`
- **Funcionalidades**:
  - Listagem de leads com filtros
  - Busca por nome, email ou empresa
  - Filtro por status e responsável
  - Edição inline de leads
  - Resumo estatístico

#### MonitoringTable Component
- **Localização**: `/src/presentation/components/app/components/monitoring-table.tsx`
- **Funcionalidades**:
  - Listagem de dados de monitoramento
  - Exibição de status de equipamentos
  - Indicadores de alerta
  - Navegação para detalhes

#### CrmUserEditModal Component
- **Localização**: `/src/presentation/components/app/components/crm-user-edit-modal.tsx`
- **Funcionalidades**:
  - Edição de informações do lead
  - Atualização de status e pontuação
  - Alteração de responsável

### Backend

#### Repositories

##### PrismaCrmLeadRepository
- **Localização**: `/src/infrastructure/repositories/prisma-crm-lead.repository.ts`
- **Métodos**:
  - `create()`: Criar novo lead
  - `findById()`: Buscar lead por ID
  - `findAll()`: Listar leads com filtros e paginação
  - `update()`: Atualizar lead
  - `delete()`: Excluir lead
  - `addJourneyStep()`: Adicionar etapa do funil
  - `getStats()`: Obter estatísticas

##### PrismaMonitoringRepository
- **Localização**: `/src/infrastructure/repositories/prisma-monitoring.repository.ts`
- **Métodos**:
  - `create()`: Criar dados de monitoramento
  - `findById()`: Buscar por ID
  - `findByCrmLeadId()`: Buscar por lead do CRM
  - `findAll()`: Listar com filtros e paginação
  - `update()`: Atualizar dados
  - `updateByCrmLeadId()`: Atualizar por lead do CRM
  - `getStats()`: Obter estatísticas

#### Use Cases

##### CRM Use Cases
- **GetCrmLeadsUseCase**: Listar leads
- **CreateCrmLeadUseCase**: Criar lead
- **UpdateCrmLeadUseCase**: Atualizar lead

##### Monitoring Use Cases
- **GetMonitoringDataUseCase**: Listar dados de monitoramento
- **CreateMonitoringDataUseCase**: Criar dados (valida existência do lead)
- **UpdateMonitoringDataUseCase**: Atualizar dados

#### APIs

##### CRM APIs
- `GET /api/crm/leads`: Listar leads
- `POST /api/crm/leads`: Criar lead
- `GET /api/crm/leads/[id]`: Buscar lead específico
- `PATCH /api/crm/leads/[id]`: Atualizar lead
- `DELETE /api/crm/leads/[id]`: Excluir lead

##### Monitoring APIs
- `GET /api/monitoring/data`: Listar dados de monitoramento
- `POST /api/monitoring/data`: Criar dados de monitoramento
- `GET /api/monitoring/data/[id]`: Buscar dados específicos
- `PATCH /api/monitoring/data/[id]`: Atualizar dados
- `DELETE /api/monitoring/data/[id]`: Excluir dados

## Enums e Tipos

### CrmUserStatus
```typescript
enum CrmUserStatus {
  LEAD = 'LEAD',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
  ON_HOLD = 'ON_HOLD'
}
```

### ProductService
```typescript
enum ProductService {
  SOLAR_PANELS = 'SOLAR_PANELS',
  SOLAR_WATER_HEATER = 'SOLAR_WATER_HEATER',
  BATTERY_STORAGE = 'BATTERY_STORAGE',
  EV_CHARGING = 'EV_CHARGING',
  ENERGY_AUDIT = 'ENERGY_AUDIT',
  MAINTENANCE = 'MAINTENANCE',
  CONSULTING = 'CONSULTING'
}
```

### EquipmentStatus
```typescript
enum EquipmentStatus {
  ONLINE = 'ONLINE',
  WARNING = 'WARNING',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE'
}
```

### AlertLevel
```typescript
enum AlertLevel {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}
```

## Fluxo de Trabalho

1. **Criação de Lead**: Um novo lead é criado no sistema CRM
2. **Qualificação**: O lead passa pelas etapas do funil de vendas
3. **Conversão**: Quando o lead se torna cliente, dados de monitoramento são criados
4. **Monitoramento**: Os dados de produção e status são atualizados regularmente
5. **Alertas**: O sistema gera alertas baseados no status dos equipamentos

## Validações de Negócio

- **Monitoring Data**: Só pode ser criado se o CRM Lead existir
- **Journey Steps**: Atualizam automaticamente a data de última atividade do lead
- **Status Changes**: Podem gerar automaticamente novas etapas no funil
- **Score Updates**: Baseados em interações e progresso no funil

## Próximos Passos

1. Implementar dashboard com métricas combinadas
2. Adicionar sistema de notificações para alertas
3. Criar relatórios de performance
4. Implementar integração com sistemas externos
5. Adicionar permissões e controle de acesso
6. Implementar auditoria de alterações

## Considerações Técnicas

- O sistema usa Prisma ORM para interação com o banco de dados
- As APIs seguem o padrão REST
- Os componentes React usam hooks para gerenciamento de estado
- O sistema é totalmente responsivo e funciona em dispositivos móveis
- Foi implementado sistema de loading states para melhor UX