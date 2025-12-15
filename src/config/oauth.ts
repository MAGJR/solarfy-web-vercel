/**
 * OAuth Configuration for Enphase Integration
 * Works with ngrok for development and real URLs for production
 */

export const oauthConfig = {
  // URL base para callbacks OAuth (ngrok em dev, produção real)
  baseUrl: process.env.NEXT_PUBLIC_OAUTH_BASE_URL || 'https://7b0996823737.ngrok-free.app',

  // Timeout para requisições
  timeout: parseInt(process.env.NEXT_PUBLIC_OAUTH_TIMEOUT || '10000'),

  // Endpoint completo de callback
  get callbackUrl(): string {
    return `${this.baseUrl}/api/v1/enphase/oauth/callback-direct`;
  },

  // Verificar se está em ambiente de desenvolvimento
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  },

  // Obter URL completa para authorize (substitui URLs antigas)
  getAuthorizeUrl(authorizationUrl: string): string {
    // Substitui qualquer URL de ngrok antiga pela nova
    const ngrokPattern = /https:\/\/[a-z0-9]+\.ngrok-free\.app/g;
    return authorizationUrl.replace(ngrokPattern, this.baseUrl);
  },

  // Obter redirect URI para token exchange
  get redirectUri(): string {
    return this.callbackUrl;
  }
};

export default oauthConfig;