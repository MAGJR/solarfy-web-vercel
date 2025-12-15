# Email System

Esta pasta contém a implementação do sistema de e-mails seguindo a arquitetura DDD do projeto.

## Estrutura de Arquivos

### Domain Layer (`src/domains/emails/`)
- **entities/**: Entidades de domínio (Email, EmailAttachment, etc.)
- **repositories/**: Interfaces dos repositórios (IEmailRepository)
- **templates/**: Templates de e-mail com suporte a HTML e texto
- **types/**: Enums e tipos (EmailType, EmailStatus)

### Application Layer (`src/application/use-cases/emails/`)
- **send-email.usecase.ts**: Use cases para envio de e-mails genéricos e com templates

### Infrastructure Layer (`src/shared/infrastructure/emails/`)
- **repositories/**: Implementação do repositório com Prisma
- **providers/**: Implementação do provider Resend e Mock para desenvolvimento
- **email.service.ts**: Serviço principal com injeção de dependências

## Configuração

### 1. Configurar o Resend

1. Crie uma conta em [Resend](https://resend.com)
2. Verifique seu domínio
3. Copie sua API key
4. Configure as variáveis de ambiente:

```bash
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="no-reply@seu-dominio.com"
```

### 2. Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Email (Resend)
RESEND_API_KEY="re_sua_api_key_aqui"
RESEND_FROM_EMAIL="no-reply@seu-dominio.com"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
```

### 3. Uso no Better Auth

O sistema já está integrado com o Better Auth para:
- ✅ Verificação de e-mail no cadastro
- ✅ Redefinição de senha

## Templates Disponíveis

### Email Verification
- **Type**: `EmailType.EMAIL_VERIFICATION`
- **Template**: Email de verificação com link para ativar conta

### Password Reset
- **Type**: `EmailType.PASSWORD_RESET`
- **Template**: Email de redefinição de senha

### Welcome
- **Type**: `EmailType.WELCOME`
- **Template**: Email de boas-vindas após verificação

## Como Usar

### Enviar Email Template
```typescript
import { EmailType } from '@/domains/emails/types/email-type.enum'
import { emailService } from '@/shared/infrastructure/emails/email.service'

// Enviar email de verificação
await emailService.sendTemplatedEmail(
  'user@example.com',
  EmailType.EMAIL_VERIFICATION,
  {
    userName: 'John Doe',
    verificationUrl: 'https://solarfy.com/verify?token=abc123'
  }
)
```

### Enviar Email Customizado
```typescript
import { emailService } from '@/shared/infrastructure/emails/email.service'

await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Assunto Personalizado',
  htmlContent: '<h1>Olá!</h1><p>Este é um email personalizado.</p>',
  textContent: 'Olá! Este é um email personalizado.',
  type: EmailType.WELCOME
})
```

## Testes

Em desenvolvimento sem `RESEND_API_KEY`, o sistema usa automaticamente o `MockEmailProvider` que apenas loga os detalhes do email no console.

## Adicionar Novos Templates

1. Adicione o novo tipo em `EmailType` enum
2. Crie o template em `email-templates.ts`
3. Use com `sendTemplatedEmail()`