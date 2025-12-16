import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "../database/prisma"
import { emailService } from "../emails/email.service"
import { EmailType } from "@/domains/emails/types/email-type.enum"
import { stripe } from "@better-auth/stripe"
import { stripeClient } from "./stripe-client.config"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    ...(process.env.STRIPE_SECRET_KEY && stripeClient ? [stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      allowDangerousWebhookTesting: process.env.NODE_ENV === "development",
    })] : [])
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Temporarily disabled for debugging
    sendEmailVerificationOnSignUp: false, // Temporarily disabled
    sendResetPasswordToken: true,
  },
  emailVerification: {
    sendOnSignUp: false, // Temporarily disabled
    expiresIn: 60 * 60 * 24, // 24 hours
    async sendVerificationEmail({ user, url }: { user: any; url: string }) {
      try {
        await emailService.sendTemplatedEmail(
          user.email,
          EmailType.EMAIL_VERIFICATION,
          {
            userName: user.name || user.email,
            verificationUrl: url
          }
        )
      } catch (error) {
        console.error('Failed to send verification email:', error)
        throw error
      }
    },
  },
  passwordReset: {
    sendResetPasswordToken: true,
    expiresIn: 60 * 60, // 1 hour
    async sendResetPasswordEmail({ user, url }: { user: any; url: string }) {
      try {
        await emailService.sendTemplatedEmail(
          user.email,
          EmailType.PASSWORD_RESET,
          {
            userName: user.name || user.email,
            resetPasswordUrl: url
          }
        )
      } catch (error) {
        console.error('Failed to send password reset email:', error)
        throw error
      }
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_APP_URL?.includes('ngrok'),
      sameSite: "lax",
      domain: process.env.NEXT_PUBLIC_APP_URL?.includes('ngrok') ? undefined : undefined,
    },
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:3005",
      "https://7b0996823737.ngrok-free.app",
      "https://7b0996823737.ngrok-free.app"
    ],
  },
  redirect: {
    callbackURL: "/auth/callback",
  },
})

export type Session = typeof auth.$Infer.Session