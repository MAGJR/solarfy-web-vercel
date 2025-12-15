# Configuração do Stripe com Better-Auth

Este documento descreve como configurar a integração do Stripe com Better-Auth no projeto Solarfy, permitindo gerenciamento de assinaturas para usuários com role "VIEWER".

## 📋 Visão Geral

A integração permite:
- Criar e gerenciar assinaturas via Stripe
- Webhooks automáticos para sincronização de pagamentos
- Portal do cliente para gestão de cobrança
- Controle de acesso baseado em status da assinatura
- Suporte a múltiplos planos (Basic, Pro, Enterprise)

## 🔧 Configuração Backend

### 1. Dependências

As seguintes dependências já estão instaladas:

```bash
npm install @better-auth/stripe stripe@^19.1.0
```

### 2. Configuração do Better-Auth

Arquivo: `src/infrastructure/auth/auth.config.ts`

```typescript
import { betterAuth } from "better-auth"
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"
import { stripeClient } from "./stripe-client.config"

export const auth = betterAuth({
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
      createCustomerOnSignUp: true,
    })
  ],
  // ... resto da configuração
})
```

### 3. Cliente Stripe

Arquivo: `src/infrastructure/auth/stripe-client.config.ts`

```typescript
import Stripe from "stripe"

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})
```

### 4. Variáveis de Ambiente

Adicionar ao arquivo `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."  # Chave secreta do Stripe (teste ou produção)
STRIPE_PUBLISHABLE_KEY="pk_test_..."  # Chave pública para frontend
STRIPE_WEBHOOK_SECRET="whsec_..."  # Segredo do webhook
```

### 5. Schema do Banco de Dados

As seguintes tabelas foram adicionadas ao `prisma/schema.prisma`:

```prisma
model StripeCustomer {
  id       String @id @default(cuid())
  userId   String @unique
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeId String @unique

  @@map("stripe_customers")
}

model StripeSubscription {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeId       String   @unique
  stripePriceId  String
  status         String
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("stripe_subscriptions")
}
```

E as relações correspondentes no modelo `User`:

```prisma
model User {
  // ... campos existentes

  // Stripe relations
  stripeCustomer       StripeCustomer?
  stripeSubscriptions  StripeSubscription[]

  // ... resto do modelo
}
```

## 🎨 Configuração Frontend

### 1. Cliente de Autenticação

Arquivo: `src/infrastructure/auth/auth-client.config.ts`

```typescript
import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    stripeClient({
      subscription: true
    })
  ]
})
```

### 2. Hook para Gerenciamento de Assinaturas

Arquivo: `src/presentation/hooks/use-stripe-subscription.ts`

O hook `useStripeSubscription` fornece:

- Listagem de planos disponíveis
- Status da assinatura atual
- Funções para criar/cancelar assinaturas
- Acesso ao portal de cobrança

### 3. Componentes

- `SubscriptionManager`: Componente principal para gestão de assinaturas
- Página de pricing: `/app/app/pricing/page.tsx`
- Settings de billing: `/app/app/settings/billing/page.tsx`

## 🔐 Controle de Acesso

### Middleware de Verificação

Arquivo: `src/infrastructure/auth/middleware/stripe.middleware.ts`

O middleware verifica:
- Se o usuário tem role "VIEWER"
- Se possui assinatura ativa
- Retorna contexto com informações de acesso

```typescript
export async function checkStripeAccess(
  headers: Headers
): Promise<StripeMiddlewareContext>

export function canAccessStripeFeatures(context: StripeMiddlewareContext): boolean
```

### Role-based Access

Apenas usuários com role `VIEWER` podem acessar funcionalidades do Stripe. Isso é configurado no schema:

```prisma
enum UserRole {
  ADMIN
  MANAGER
  SALES_REP
  TECHNICIAN
  VIEWER  // Role com acesso ao Stripe
}
```

## 🌐 Webhooks

### Configuração no Stripe Dashboard

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá para Developers → Webhooks
3. Adicione endpoint: `https://seu-dominio.com/api/auth/[...all]`
4. Configure eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Eventos Suportados

O Better-Auth processa automaticamente:
- Criação de customer no signup
- Sincronização de status de assinatura
- Atualização de metadados

## 💳 Planos Disponíveis

### Plano Basic
- **Preço**: R$ 29,90/mês
- **Recursos**:
  - Até 10 projetos
  - Suporte por email
  - Relatórios básicos
  - API access

### Plano Professional
- **Preço**: R$ 99,90/mês
- **Recursos**:
  - Projetos ilimitados
  - Suporte prioritário
  - Relatórios avançados
  - API access completo
  - Integrações avançadas
  - Dashboard personalizado

### Plano Enterprise
- **Preço**: R$ 299,90/mês
- **Recursos**:
  - Tudo do Pro +
  - SLA garantido
  - Dedicado account manager
  - Custom integrations
  - On-site training
  - White label options

## 🔄 Fluxo de Assinatura

1. **Usuário acessa página de pricing** → Visualiza planos disponíveis
2. **Escolhe plano** → Redirecionado para checkout do Stripe
3. **Pagamento aprovado** → Webhook atualiza status no banco
4. **Acesso liberado** → Usuário pode acessar recursos premium
5. **Gestão via portal** → Usuário pode cancelar/alterar plano

## 🚀 Deploy e Produção

### Migração do Banco de Dados

```bash
npx prisma db push
```

### Variáveis de Produção

Configure as seguintes variáveis em produção:

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
BETTER_AUTH_URL="https://seu-dominio.com"
NEXT_PUBLIC_BETTER_AUTH_URL="https://seu-dominio.com"
```

### Testes

Para testar a integração:

1. Use chaves de teste do Stripe
2. Configure webhooks em modo de teste
3. Use números de cartão de teste: [Stripe Test Cards](https://stripe.com/docs/testing)

## 🔧 Troubleshooting

### Webhook não está funcionando
- Verifique se a URL do webhook está correta
- Confirme o segredo do webhook está configurado
- Use CLI do Stripe para testar: `stripe listen --forward-to localhost:3000/api/auth/[...all]`

### Assinatura não aparece no dashboard
- Verifique se o usuário foi criado como customer no Stripe
- Confirme se `createCustomerOnSignUp: true` está ativo
- Verifique logs de erros nos webhooks

### Erros de CORS
- Configure domínios permitidos no Stripe Dashboard
- Verifique se `NEXT_PUBLIC_BETTER_AUTH_URL` está correto

## 📚 Recursos Adicionais

- [Better-Auth Stripe Plugin](https://www.better-auth.com/docs/plugins/stripe)
- [Stripe Documentation](https://stripe.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique logs do servidor
2. Confirme configuração das variáveis de ambiente
3. Teste com chaves de teste do Stripe
4. Consulte documentação oficial do Better-Auth e Stripe