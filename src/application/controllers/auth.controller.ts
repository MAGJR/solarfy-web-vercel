import { validateSignUp, validateSignIn } from '@/application/schemas'
import { authClient } from '@/infrastructure/auth/auth-client.config'

export class AuthController {
  async signUp(data: unknown) {
    const validation = validateSignUp(data)

    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => err.message)
      return {
        success: false,
        error: 'Validation failed',
        details: errorMessages
      }
    }

    try {
      const result = await authClient.signUp.email(validation.data)

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        }
      }

      return {
        success: true,
        data: result.data,
        message: 'Account created successfully! Please check your email to verify your account.'
      }
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred during registration. Please try again.'
      }
    }
  }

  async signIn(data: unknown) {
    const validation = validateSignIn(data)

    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => err.message)
      return {
        success: false,
        error: 'Validation failed',
        details: errorMessages
      }
    }

    try {
      const result = await authClient.signIn.email(validation.data)

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        }
      }

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred during sign in. Please try again.'
      }
    }
  }

  async signOut() {
    try {
      await authClient.signOut()
      return {
        success: true,
        message: 'Signed out successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred during sign out.'
      }
    }
  }
}