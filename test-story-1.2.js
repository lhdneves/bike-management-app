const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let authToken = null;
let userId = null;
let bikeId = null;
let componentId = null;

// Test data
const testUser = {
  name: 'Teste Story 1.2',
  email: 'teste.story1.2@example.com',
  password: 'password123',
  role: 'BIKE_OWNER'
};

const testBike = {
  name: 'Mountain Bike de Teste',
  description: 'Bicicleta para testes da Story 1.2',
  manufacturer: 'Trek',
  type: 'MOUNTAIN_BIKE',
  traction_type: 'MANUAL'
};

const testComponent = {
  name: 'Freio Dianteiro',
  description: 'Freio hidráulico Shimano',
  installation_date: '2024-01-15',
  observation: 'Instalado para testes'
};

// Utility functions
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

const setAuthToken = (token) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const logTest = (testName, result, data = null) => {
  const status = result ? '✅' : '❌';
  console.log(`${status} ${testName}`);
  if (data) {
    console.log(`   Data:`, data);
  }
  console.log('');
};

const runTests = async () => {
  console.log('🚴‍♂️ Iniciando testes da Story 1.2 - Bike & Component Management\n');

  try {
    // Test 1: User Registration
    console.log('1️⃣ Testando Registro de Usuário...');
    try {
      const registerResponse = await api.post('/auth/register', testUser);
      logTest('Registro de usuário', registerResponse.data.success, {
        userId: registerResponse.data.data?.user?.id,
        token: registerResponse.data.data?.token ? 'Token gerado' : 'Sem token'
      });
      
      if (registerResponse.data.success) {
        userId = registerResponse.data.data.user.id;
        setAuthToken(registerResponse.data.data.token);
      }
    } catch (error) {
      // If user already exists, try to login
      console.log('   Usuário já existe, tentando login...');
      try {
        const loginResponse = await api.post('/auth/login', {
          email: testUser.email,
          password: testUser.password
        });
        logTest('Login de usuário existente', loginResponse.data.success);
        
        if (loginResponse.data.success) {
          userId = loginResponse.data.data.user.id;
          setAuthToken(loginResponse.data.data.token);
        }
      } catch (loginError) {
        logTest('Login de usuário', false, loginError.response?.data);
        return;
      }
    }

    // Test 2: Get Bikes (should be empty initially)
    console.log('2️⃣ Testando Listagem de Bicicletas...');
    try {
      const bikesResponse = await api.get('/bikes');
      logTest('Listagem de bicicletas', bikesResponse.data.success, {
        count: bikesResponse.data.data?.length || 0
      });
    } catch (error) {
      logTest('Listagem de bicicletas', false, error.response?.data);
    }

    // Test 3: Get Bike Stats
    console.log('3️⃣ Testando Estatísticas de Bicicletas...');
    try {
      const statsResponse = await api.get('/bikes/stats');
      logTest('Estatísticas de bicicletas', statsResponse.data.success, statsResponse.data.data);
    } catch (error) {
      logTest('Estatísticas de bicicletas', false, error.response?.data);
    }

    // Test 4: Create Bike
    console.log('4️⃣ Testando Criação de Bicicleta...');
    try {
      const createBikeResponse = await api.post('/bikes', testBike);
      logTest('Criação de bicicleta', createBikeResponse.data.success, {
        bikeId: createBikeResponse.data.data?.id,
        name: createBikeResponse.data.data?.name
      });
      
      if (createBikeResponse.data.success) {
        bikeId = createBikeResponse.data.data.id;
      }
    } catch (error) {
      logTest('Criação de bicicleta', false, error.response?.data);
    }

    if (!bikeId) {
      console.log('❌ Não foi possível criar bicicleta. Parando testes de componentes.');
      return;
    }

    // Test 5: Get Bike by ID
    console.log('5️⃣ Testando Busca de Bicicleta por ID...');
    try {
      const getBikeResponse = await api.get(`/bikes/${bikeId}`);
      logTest('Busca de bicicleta por ID', getBikeResponse.data.success, {
        name: getBikeResponse.data.data?.name,
        type: getBikeResponse.data.data?.type
      });
    } catch (error) {
      logTest('Busca de bicicleta por ID', false, error.response?.data);
    }

    // Test 6: Update Bike
    console.log('6️⃣ Testando Atualização de Bicicleta...');
    try {
      const updateData = { description: 'Descrição atualizada para testes' };
      const updateBikeResponse = await api.put(`/bikes/${bikeId}`, updateData);
      logTest('Atualização de bicicleta', updateBikeResponse.data.success, {
        description: updateBikeResponse.data.data?.description
      });
    } catch (error) {
      logTest('Atualização de bicicleta', false, error.response?.data);
    }

    // Test 7: Get Bike Components (should be empty)
    console.log('7️⃣ Testando Listagem de Componentes...');
    try {
      const componentsResponse = await api.get(`/bikes/${bikeId}/components`);
      logTest('Listagem de componentes', componentsResponse.data.success, {
        count: componentsResponse.data.data?.length || 0
      });
    } catch (error) {
      logTest('Listagem de componentes', false, error.response?.data);
    }

    // Test 8: Create Component
    console.log('8️⃣ Testando Criação de Componente...');
    try {
      const createComponentResponse = await api.post(`/bikes/${bikeId}/components`, testComponent);
      logTest('Criação de componente', createComponentResponse.data.success, {
        componentId: createComponentResponse.data.data?.id,
        name: createComponentResponse.data.data?.name
      });
      
      if (createComponentResponse.data.success) {
        componentId = createComponentResponse.data.data.id;
      }
    } catch (error) {
      logTest('Criação de componente', false, error.response?.data);
    }

    if (componentId) {
      // Test 9: Get Component by ID
      console.log('9️⃣ Testando Busca de Componente por ID...');
      try {
        const getComponentResponse = await api.get(`/components/${componentId}`);
        logTest('Busca de componente por ID', getComponentResponse.data.success, {
          name: getComponentResponse.data.data?.name,
          bikeId: getComponentResponse.data.data?.bike_id
        });
      } catch (error) {
        logTest('Busca de componente por ID', false, error.response?.data);
      }

      // Test 10: Update Component
      console.log('🔟 Testando Atualização de Componente...');
      try {
        const updateComponentData = { observation: 'Observação atualizada para testes' };
        const updateComponentResponse = await api.put(`/components/${componentId}`, updateComponentData);
        logTest('Atualização de componente', updateComponentResponse.data.success, {
          observation: updateComponentResponse.data.data?.observation
        });
      } catch (error) {
        logTest('Atualização de componente', false, error.response?.data);
      }
    }

    // Test 11: Get Updated Stats
    console.log('1️⃣1️⃣ Testando Estatísticas Atualizadas...');
    try {
      const updatedStatsResponse = await api.get('/bikes/stats');
      logTest('Estatísticas atualizadas', updatedStatsResponse.data.success, updatedStatsResponse.data.data);
    } catch (error) {
      logTest('Estatísticas atualizadas', false, error.response?.data);
    }

    // Test 12: Get Updated Bikes List
    console.log('1️⃣2️⃣ Testando Listagem Atualizada de Bicicletas...');
    try {
      const updatedBikesResponse = await api.get('/bikes');
      logTest('Listagem atualizada de bicicletas', updatedBikesResponse.data.success, {
        count: updatedBikesResponse.data.data?.length || 0,
        bikes: updatedBikesResponse.data.data?.map(b => ({ id: b.id, name: b.name, components: b._count?.components }))
      });
    } catch (error) {
      logTest('Listagem atualizada de bicicletas', false, error.response?.data);
    }

    console.log('🎉 Testes da Story 1.2 concluídos!');
    console.log('\n📋 Resumo:');
    console.log(`- Usuário criado/logado: ${userId ? '✅' : '❌'}`);
    console.log(`- Bicicleta criada: ${bikeId ? '✅' : '❌'}`);
    console.log(`- Componente criado: ${componentId ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }
};

// Execute tests
runTests();