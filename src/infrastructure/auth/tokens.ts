import crypto from 'crypto'

/**
 * Generate a random invitation token
 */
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate a random password reset token
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}