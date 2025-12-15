# Sistema de Notificações - Solarfy

Este documento descreve o sistema de notificações implementado no projeto Solarfy.

## 🏗️ Arquitetura

O sistema segue uma arquitetura limpa baseada em Domain-Driven Design (DDD):

```
Frontend (React/Next.js)
  ↓
Hooks (useNotification, useCreateNotification)
  ↓
Server Actions (Next.js)
  ↓
Use Cases (Application Layer)
  ↓
Repositories (Infrastructure)
  ↓
Database (Prisma/PostgreSQL)
```

## 📁 Estrutura de Arquivos

### Domain Layer
```
src/domains/notifications/
├── entities/
│   └── notification.entity.ts     # Tipagens e enums
├── repositories/
│   └── notification.repository.ts # Interface do repositório
└── types/
    └── notification-type.enum.ts  # Tipos de notificação
```

### Application Layer
```
src/application/use-cases/notifications/
└── notification-usecase.ts        # Casos de uso de notificações
```

### Infrastructure Layer
```
src/infrastructure/repositories/
└── prisma-notification.repository.ts # Implementação do repositório
```

### Frontend Layer
```
src/app/app/notification/
└── action.ts                      # Server Actions

src/hooks/
├── use-notification.ts            # Hook principal
└── use-create-notification.ts     # Hook para criar notificações

src/components/
├── providers/notification-provider.tsx # Provider global
└── ui/notification-toast.tsx      # Componente de toast
```

## 🔧 Como Usar

### 1. No Backend (Use Cases)

```typescript
import { notifyNewTicket } from '@/lib/notifications';

// Em um use case
const ticket = await this.supportRepository.create(input)

// Enviar notificações
await notifyNewTicket({
  id: ticket.id,
  subject: ticket.subject,
  tenantId: ticket.tenantId,
  createdById: ticket.createdById
})
```

### 2. No Frontend (Hooks)

#### Hook Principal
```typescript
import { useNotification } from '@/hooks/use-notification';

function MyComponent() {
  const { notifications, isLoading, markAsRead } = useNotification();

  return (
    <div>
      {notifications?.map(notification => (
        <div key={notification.id}>
          {notification.title}
        </div>
      ))}
    </div>
  );
}
```

#### Hook para Criar Notificações
```typescript
import { useCreateNotification } from '@/hooks/use-create-notification';

function MyComponent() {
  const { createNotification } = useCreateNotification();

  const handleCreate = () => {
    createNotification({
      title: 'Nova Notificação',
      message: 'Mensagem da notificação',
      type: 'SYSTEM_ANNOUNCEMENT'
    });
  };
}
```

#### Toast Notifications
```typescript
import { useAppNotifications } from '@/components/providers/notification-provider';

function MyComponent() {
  const { notifySuccess, notifyError, notifyTicketCreated } = useAppNotifications();

  const handleSuccess = () => {
    notifySuccess('Sucesso!', 'Operação realizada com sucesso');
  };

  const handleTicket = () => {
    notifyTicketCreated('TICKET-123', 'Problema no painel solar');
  };
}
```

## 📋 Tipos de Notificação

```typescript
export enum NotificationType {
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  TICKET_RESPONSE = 'TICKET_RESPONSE',
  TICKET_STATUS_CHANGED = 'TICKET_STATUS_CHANGED',
  PROJECT_STATUS_UPDATE = 'PROJECT_STATUS_UPDATE',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  INSTALLATION_SCHEDULED = 'INSTALLATION_SCHEDULED',
  MAINTENANCE_REMINDER = 'MAINTENANCE_REMINDER',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}
```

## 🎨 Interface

### Dashboard Header
- Dropdown com notificações em tempo real
- Contador de notificações não lidas
- Ações individuais e em massa

### Página de Notificações
- Lista completa de notificações
- Filtros (todas / não lidas)
- Paginação e busca
- Ações de marca como lida e exclusão

### Toast Notifications
- Notificações em tempo real
- Auto-dismiss após 5 segundos
- Cores por tipo de notificação
- Stack de múltiplas notificações

## 🔐 Segurança

### Permissões
- Usuários só podem ver suas próprias notificações
- Apenas Admins/Managers podem criar notificações para outros
- Validação de tenant para isolamento multi-tenant

### Server Actions
- Validação de sessão em todas as ações
- Verificação de permissões
- Tratamento de erros seguro

## 📊 Funcionalidades Implementadas

### ✅ Core Features
- [x] Database schema (tabela `notifications`)
- [x] Repository pattern com interface/implementação
- [x] Use cases para CRUD de notificações
- [x] Server Actions com validação
- [x] Hooks React para frontend
- [x] Componente de notificações no dashboard
- [x] Página completa de notificações
- [x] Toast notifications em tempo real

### ✅ Integração com Tickets
- [x] Notificação de novo ticket
- [x] Notificação de atribuição de ticket
- [x] Notificação de resposta em ticket
- [x] Notificação de mudança de status

### ✅ Funcionalidades Avançadas
- [x] Provider global para notificações
- [x] Sistema de toast com animações
- [x] Filtros e busca
- [x] Tempo relativo (date-fns)
- [x] Ícones por tipo de notificação
- [x] Cores e styling consistentes

## 🚀 Como Estender

### Adicionar Novo Tipo de Notificação

1. **Adicionar ao enum:**
```typescript
// notification.entity.ts
export enum NotificationType {
  // ... tipos existentes
  NEW_TYPE = 'NEW_TYPE'
}
```

2. **Adicionar helper functions:**
```typescript
// lib/notifications.ts
export async function notifyNewType(data: any) {
  return sendNotificationToUsers(
    userIds,
    'Título',
    'Mensagem',
    NotificationType.NEW_TYPE,
    data
  );
}
```

3. **Adicionar ícone e cor:**
```typescript
// notification-toast.tsx
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'NEW_TYPE':
      return '🆕';
    // ... outros casos
  }
};
```

### Adicionar em Outros Módulos

1. **Importar helper functions:**
```typescript
import { notifyNewType } from '@/lib/notifications';
```

2. **Chamar após evento:**
```typescript
// Após criar/alterar recurso
await notifyNewType(data);
```

## 🐛 Troubleshooting

### Notificações não aparecem:
1. Verificar se usuário está autenticado
2. Verificar permissões no backend
3. Verificar console para erros
4. Verificar se há dados no banco

### Toast não funciona:
1. Verificar se NotificationProvider está no layout
2. Verificar se hook está sendo usado corretamente
3. Verificar console para erros de React

### Performance:
- Cache localizado com React Query
- Refetch automático a cada 30 segundos
- Lazy loading para grandes volumes

## 📝 Próximos Passos

### Futuras Implementações:
- [ ] WebSocket para tempo real
- [ ] Preferências de notificação do usuário
- [ ] Notificações por email/SMS
- [ ] Analytics de engajamento
- [ ] Batch processing para volume alto
- [ ] Rate limiting para prevenir spam

### Melhorias:
- [ ] Componentes de loading skeleton
- [ ] Animações mais avançadas
- [ ] Tema dark/light
- [ ] Responsividade aprimorada
- [ ] Testes automatizados
- [ ] Documentação de API

## 👥 Contribuição

Ao adicionar novas notificações:
1. Siga o padrão existente
2. Adicione validações necessárias
3. Atualize a documentação
4. Teste todos os cenários
5. Considere implicações de performance

---

**Status:** ✅ Implementado e funcionando
**Versão:** 1.0.0
**Última atualização:** 2025-01-24