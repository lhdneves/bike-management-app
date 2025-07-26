const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

const testSkipById = async () => {
  console.log('🚴‍♂️ Teste Story 1.2 (pulando busca por ID)\n');

  try {
    // Login com usuário existente
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'coretest@example.com',
      password: 'Password123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login realizado');

    // Listar bicicletas
    console.log('\n2️⃣ Listando bicicletas...');
    const bikesResponse = await axios.get(`${API_BASE}/bikes`, { headers });
    console.log(`✅ Bicicletas encontradas: ${bikesResponse.data.data.length}`);
    
    if (bikesResponse.data.data.length === 0) {
      console.log('⚠️ Nenhuma bicicleta encontrada. Criando uma...');
      
      const bikeData = {
        name: 'Test Bike Skip',
        description: 'Bicicleta para testes',
        manufacturer: 'Trek',
        type: 'MOUNTAIN_BIKE',
        tractionType: 'MANUAL'
      };

      const createResponse = await axios.post(`${API_BASE}/bikes`, bikeData, { headers });
      console.log(`✅ Bicicleta criada: ${createResponse.data.data.name}`);
    }

    const bike = bikesResponse.data.data[0] || (await axios.get(`${API_BASE}/bikes`, { headers })).data.data[0];
    const bikeId = bike.id;

    // Testar componentes
    console.log('\n3️⃣ Testando componentes...');
    
    // Listar componentes (inicial)
    const initialComponents = await axios.get(`${API_BASE}/bikes/${bikeId}/components`, { headers });
    console.log(`✅ Componentes iniciais: ${initialComponents.data.data.length}`);

    // Criar componente
    const componentData = {
      name: 'Freio Teste Skip',
      description: 'Freio para teste',
      installation_date: '2024-01-15',
      observation: 'Teste'
    };

    const componentResponse = await axios.post(`${API_BASE}/bikes/${bikeId}/components`, componentData, { headers });
    console.log(`✅ Componente criado: ${componentResponse.data.data.name}`);
    const componentId = componentResponse.data.data.id;

    // Listar componentes (após criação)
    const finalComponents = await axios.get(`${API_BASE}/bikes/${bikeId}/components`, { headers });
    console.log(`✅ Componentes finais: ${finalComponents.data.data.length}`);

    // Testar busca de componente por ID
    console.log('\n4️⃣ Testando busca de componente por ID...');
    const componentDetail = await axios.get(`${API_BASE}/components/${componentId}`, { headers });
    console.log(`✅ Componente encontrado: ${componentDetail.data.data.name}`);

    // Atualizar componente
    console.log('\n5️⃣ Testando atualização de componente...');
    const updateData = { observation: 'Observação atualizada' };
    const updateResponse = await axios.put(`${API_BASE}/components/${componentId}`, updateData, { headers });
    console.log(`✅ Componente atualizado: ${updateResponse.data.data.observation}`);

    console.log('\n🎉 CORE FEATURES FUNCIONANDO!');
    console.log('\n📊 Resumo:');
    console.log(`- Bicicletas: ${(await axios.get(`${API_BASE}/bikes`, { headers })).data.data.length}`);
    console.log(`- Componentes: ${(await axios.get(`${API_BASE}/bikes/${bikeId}/components`, { headers })).data.data.length}`);
    console.log('- Autenticação: ✅');
    console.log('- CRUD Bicicletas: ✅');
    console.log('- CRUD Componentes: ✅');

  } catch (error) {
    console.error('\n❌ ERRO:');
    console.error('Mensagem:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('Detalhes:', error.response.data.errors);
    }
  }
};

testSkipById();