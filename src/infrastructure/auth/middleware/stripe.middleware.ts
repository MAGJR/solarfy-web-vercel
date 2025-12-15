import { auth } from "../auth.config"
import type { Session } from "../auth.config"
import { prisma } from "../../database/prisma"

export interface StripeMiddlewareContext {
  session: Session | null
  hasActiveSubscription: boolean
  isViewer: boolean
  userRole: string | null
  subscription?: {
    id: string
    status: string
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
  }
}

export async function checkStripeAccess(
  headers: Headers
): Promise<StripeMiddlewareContext> {
  try {
    // Obter sessão do usuário
    const session = await auth.api.getSession({
      headers
    })

    if (!session?.user) {
      return {
        session: null,
        hasActiveSubscription: false,
        isViewer: false,
        userRole: null
      }
    }

    // Verificar se o usuário tem role VIEWER
    // TODO: Adicionar tipagem correta quando tivermos acesso ao schema completo
    const userRole = (session.user as any).role || 'USER'
    const isViewer = userRole === 'VIEWER'

    // Verificar se tem assinatura ativa no banco de dados
    let hasActiveSubscription = false
    let subscription: any = null

    if (isViewer) {
      try {
        // Buscar assinatura ativa do usuário
        const activeSubscription = await prisma.stripeSubscription.findFirst({
          where: {
            userId: session.user.id,
            status: {
              in: ['active', 'trialing']
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        if (activeSubscription) {
          hasActiveSubscription = true
          subscription = {
            id: activeSubscription.id,
            status: activeSubscription.status,
            currentPeriodEnd: activeSubscription.currentPeriodEnd,
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd
          }
        }
      } catch (dbError) {
        console.error('Error checking subscription:', dbError)
        // Se houver erro no banco, continuamos sem assinatura
      }
    }

    return {
      session,
      hasActiveSubscription,
      isViewer,
      userRole,
      subscription
    }
  } catch (error) {
    console.error('Error checking Stripe access:', error)
    return {
      session: null,
      hasActiveSubscription: false,
      isViewer: false,
      userRole: null
    }
  }
}

/**
 * Verifica se o usuário pode acessar recursos protegidos pelo Stripe
 */
export function canAccessStripeFeatures(context: StripeMiddlewareContext): boolean {
  return context.isViewer && context.hasActiveSubscription
}

/**
 * Middleware para Next.js Middleware
 */
export async function stripeAuthMiddleware(request: Request) {
  const context = await checkStripeAccess(request.headers)

  // Se não tiver acesso, redirecionar para página de upgrade
  if (!canAccessStripeFeatures(context)) {
    const url = new URL('/pricing', request.url)
    return Response.redirect(url)
  }

  return null
}