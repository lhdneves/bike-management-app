const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

const testCompleteFlow = async () => {
  console.log('🧪 Teste simples de fluxo completo Story 1.2\n');

  try {
    // 1. Registrar usuário
    console.log('1. Registrando usuário...');
    const registerData = {
      name: 'Teste Story 1.2',
      email: 'teste.story@example.com',
      confirmEmail: 'teste.story@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      acceptTerms: true
    };

    let token, userId;
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✅ Usuário registrado');
      token = registerResponse.data.data.token;
      userId = registerResponse.data.data.user.id;
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('👤 Usuário já existe, fazendo login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: registerData.email,
          password: registerData.password
        });
        console.log('✅ Login realizado');
        token = loginResponse.data.data.token;
        userId = loginResponse.data.data.user.id;
      } else {
        throw error;
      }
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Verificar estatísticas iniciais
    console.log('\n2. Verificando estatísticas iniciais...');
    const initialStats = await axios.get(`${API_BASE}/bikes/stats`, { headers });
    console.log('✅ Estatísticas:', initialStats.data.data);

    // 3. Criar bicicleta
    console.log('\n3. Criando bicicleta...');
    const bikeData = {
      name: 'Mountain Bike Teste',
      description: 'Bicicleta para testes automáticos',
      manufacturer: 'Trek',
      type: 'MOUNTAIN_BIKE',
      traction_type: 'MANUAL'
    };

    const bikeResponse = await axios.post(`${API_BASE}/bikes`, bikeData, { headers });
    console.log('✅ Bicicleta criada:', bikeResponse.data.data.name);
    const bikeId = bikeResponse.data.data.id;

    // 4. Listar bicicletas
    console.log('\n4. Listando bicicletas...');
    const bikesResponse = await axios.get(`${API_BASE}/bikes`, { headers });
    console.log('✅ Bicicletas encontradas:', bikesResponse.data.data.length);

    // 5. Criar componente
    console.log('\n5. Criando componente...');
    const componentData = {
      name: 'Freio Dianteiro',
      description: 'Freio hidráulico Shimano XT',
      installation_date: '2024-01-15',
      observation: 'Instalado durante os testes'
    };

    const componentResponse = await axios.post(`${API_BASE}/bikes/${bikeId}/components`, componentData, { headers });
    console.log('✅ Componente criado:', componentResponse.data.data.name);
    const componentId = componentResponse.data.data.id;

    // 6. Listar componentes da bicicleta
    console.log('\n6. Listando componentes da bicicleta...');
    const componentsResponse = await axios.get(`${API_BASE}/bikes/${bikeId}/components`, { headers });
    console.log('✅ Componentes encontrados:', componentsResponse.data.data.length);

    // 7. Verificar estatísticas finais
    console.log('\n7. Verificando estatísticas finais...');
    const finalStats = await axios.get(`${API_BASE}/bikes/stats`, { headers });
    console.log('✅ Estatísticas finais:', finalStats.data.data);

    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`- Total de bicicletas: ${finalStats.data.data.totalBikes}`);
    console.log(`- Total de componentes: ${finalStats.data.data.totalComponents}`);
    console.log(`- Usuário ID: ${userId}`);
    console.log(`- Bicicleta ID: ${bikeId}`);
    console.log(`- Componente ID: ${componentId}`);

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
};

testCompleteFlow();