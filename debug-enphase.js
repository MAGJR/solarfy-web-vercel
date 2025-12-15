// Script para testar API Enphase com novas credenciais
const API_KEY = '468ec43b5a149761c67fba3e72500e7c'; // Nova API Key
const CLIENT_ID = '54053eaf1b8279cffe497485486573f9'; // Novo Client ID
const CLIENT_SECRET = 'e5ef167ad387c0c5ce6be6f1385f938b'; // Novo Client Secret
const BASE_URL = 'https://api.enphaseenergy.com';

console.log('🚀 Testando API Enphase com novas credenciais...');
console.log('API Key:', API_KEY);
console.log('Client ID:', CLIENT_ID);

// Teste 1: Verificar sistemas sem token (deve falhar)
console.log('\n=== Teste 1: API sem token ===');
fetch(`${BASE_URL}/api/v4/systems?key=${API_KEY}`)
  .then(response => {
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    return response.json();
  })
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.log('Error:', error.message);
  });

// Teste 2: Gerar URL de autorização manual
console.log('\n=== Teste 2: Gerar URL de Autorização ===');
const STATE = Buffer.from(JSON.stringify({
  tenantId: 'test-tenant-123',
  flow: 'tenant_oauth'
})).toString('base64');

const REDIRECT_URI = 'http://localhost:3000/app/settings/enphase/callback';
const AUTH_URL = `https://api.enphaseenergy.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;

console.log('📋 URL de Autorização:');
console.log(AUTH_URL);
console.log('\n🔗 Copie esta URL e abra no navegador para testar manualmente');
console.log('📍 Ou clique em "Authorize with Enphase" na aplicação');

// Teste 3: Gerar token (se você tiver um código de autorização)
console.log('\n=== Teste 3: Gerar Token (com código) ===');
console.log('Para gerar um token, você precisa:');
console.log('1. Abrir a URL acima no navegador');
console.log('2. Fazer login com credenciais de um homeowner');
console.log('3. Aprovar o acesso');
console.log('4. Copiar o código retornado na URL de callback');
console.log('5. Usar o código para gerar um token com o script abaixo:');

const EXAMPLE_TOKEN_REQUEST = `curl --location --request POST 'https://api.enphaseenergy.com/oauth/token?grant_type=authorization_code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=SEU_CODIGO_AQUI' --header 'Authorization: Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}' --header 'Content-Type: application/x-www-form-urlencoded'`;

console.log('\n📝 Comando para gerar token:');
console.log(EXAMPLE_TOKEN_REQUEST);