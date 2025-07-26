const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

const testCoreFlow = async () => {
  console.log('🚴‍♂️ Teste Core Story 1.2: Bike & Component Management\n');

  try {
    // 1. Registrar usuário
    console.log('1️⃣ Registrando usuário...');
    const registerData = {
      name: 'Core Test User',
      email: 'coretest@example.com',
      confirmEmail: 'coretest@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      acceptTerms: true
    };

    let token, userId;
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      token = registerResponse.data.data.token;
      userId = registerResponse.data.data.user.id;
      console.log('✅ Usuário registrado com sucesso');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('👤 Usuário já existe, fazendo login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: registerData.email,
          password: registerData.password
        });
        token = loginResponse.data.data.token;
        userId = loginResponse.data.data.user.id;
        console.log('✅ Login realizado com sucesso');
      } else {
        throw error;
      }
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Listar bicicletas (deve estar vazio)
    console.log('\n2️⃣ Listando bicicletas iniciais...');
    const initialBikes = await axios.get(`${API_BASE}/bikes`, { headers });
    console.log(`✅ Bicicletas encontradas: ${initialBikes.data.data.length}`);

    // 3. Criar primeira bicicleta
    console.log('\n3️⃣ Criando primeira bicicleta...');
    const bikeData1 = {
      name: 'Mountain Bike Pro',
      description: 'Bicicleta para trilhas e aventuras',
      manufacturer: 'Trek',
      type: 'MOUNTAIN_BIKE',
      tractionType: 'MANUAL'
    };

    const bike1Response = await axios.post(`${API_BASE}/bikes`, bikeData1, { headers });
    const bike1Id = bike1Response.data.data.id;
    console.log(`✅ Bicicleta criada: ${bike1Response.data.data.name} (ID: ${bike1Id})`);

    // 4. Criar segunda bicicleta
    console.log('\n4️⃣ Criando segunda bicicleta...');
    const bikeData2 = {
      name: 'Speed Urbana',
      description: 'Bicicleta para uso urbano',
      manufacturer: 'Specialized',
      type: 'SPEED',
      tractionType: 'MANUAL'
    };

    const bike2Response = await axios.post(`${API_BASE}/bikes`, bikeData2, { headers });
    const bike2Id = bike2Response.data.data.id;
    console.log(`✅ Bicicleta criada: ${bike2Response.data.data.name} (ID: ${bike2Id})`);

    // 5. Listar todas as bicicletas
    console.log('\n5️⃣ Listando todas as bicicletas...');
    const allBikes = await axios.get(`${API_BASE}/bikes`, { headers });
    console.log(`✅ Total de bicicletas: ${allBikes.data.data.length}`);
    allBikes.data.data.forEach((bike, index) => {
      console.log(`   ${index + 1}. ${bike.name} (${bike.type})`);
    });

    // 6. Buscar bicicleta por ID
    console.log('\n6️⃣ Buscando bicicleta por ID...');
    const bikeDetail = await axios.get(`${API_BASE}/bikes/${bike1Id}`, { headers });
    console.log(`✅ Bicicleta encontrada: ${bikeDetail.data.data.name}`);

    // 7. Listar componentes (deve estar vazio)
    console.log('\n7️⃣ Listando componentes da bicicleta...');
    const initialComponents = await axios.get(`${API_BASE}/bikes/${bike1Id}/components`, { headers });
    console.log(`✅ Componentes encontrados: ${initialComponents.data.data.length}`);

    // 8. Criar primeiro componente
    console.log('\n8️⃣ Criando primeiro componente...');
    const componentData1 = {
      name: 'Freio Dianteiro',
      description: 'Freio hidráulico Shimano XT',
      installation_date: '2024-01-15',
      observation: 'Instalado durante montagem'
    };

    const component1Response = await axios.post(`${API_BASE}/bikes/${bike1Id}/components`, componentData1, { headers });
    const component1Id = component1Response.data.data.id;
    console.log(`✅ Componente criado: ${component1Response.data.data.name} (ID: ${component1Id})`);

    // 9. Criar segundo componente
    console.log('\n9️⃣ Criando segundo componente...');
    const componentData2 = {
      name: 'Corrente',
      description: 'Corrente KMC X11',
      installation_date: '2024-01-15',
      observation: 'Corrente de 11 velocidades'
    };

    const component2Response = await axios.post(`${API_BASE}/bikes/${bike1Id}/components`, componentData2, { headers });
    const component2Id = component2Response.data.data.id;
    console.log(`✅ Componente criado: ${component2Response.data.data.name} (ID: ${component2Id})`);

    // 10. Listar todos os componentes
    console.log('\n🔟 Listando todos os componentes...');
    const allComponents = await axios.get(`${API_BASE}/bikes/${bike1Id}/components`, { headers });
    console.log(`✅ Total de componentes: ${allComponents.data.data.length}`);
    allComponents.data.data.forEach((component, index) => {
      console.log(`   ${index + 1}. ${component.name}`);
    });

    // 11. Buscar componente por ID
    console.log('\n1️⃣1️⃣ Buscando componente por ID...');
    const componentDetail = await axios.get(`${API_BASE}/components/${component1Id}`, { headers });
    console.log(`✅ Componente encontrado: ${componentDetail.data.data.name}`);

    // 12. Atualizar componente
    console.log('\n1️⃣2️⃣ Atualizando componente...');
    const updateData = {
      observation: 'Atualizado via teste automático'
    };
    const updateResponse = await axios.put(`${API_BASE}/components/${component1Id}`, updateData, { headers });
    console.log(`✅ Componente atualizado: ${updateResponse.data.data.observation}`);

    // 13. Atualizar bicicleta
    console.log('\n1️⃣3️⃣ Atualizando bicicleta...');
    const updateBikeData = {
      description: 'Descrição atualizada via teste automático'
    };
    const updateBikeResponse = await axios.put(`${API_BASE}/bikes/${bike1Id}`, updateBikeData, { headers });
    console.log(`✅ Bicicleta atualizada: ${updateBikeResponse.data.data.description}`);

    // 14. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    const finalBikes = await axios.get(`${API_BASE}/bikes`, { headers });
    const finalComponents = await axios.get(`${API_BASE}/bikes/${bike1Id}/components`, { headers });
    
    console.log(`✅ Usuário: ${userId}`);
    console.log(`✅ Total de bicicletas: ${finalBikes.data.data.length}`);
    console.log(`✅ Total de componentes na bike 1: ${finalComponents.data.data.length}`);
    console.log(`✅ Token válido: ${token ? 'Sim' : 'Não'}`);

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('🚴‍♂️ Story 1.2 - Bike & Component Management está funcionando perfeitamente!');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error('Mensagem:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('Detalhes:', error.response.data.errors);
    }
    if (error.response?.data?.error) {
      console.error('Stack:', error.response.data.error.stack);
    }
  }
};

testCoreFlow();