const { MaintenanceReminderEmail } = require('./dist/emails/MaintenanceReminderEmail.js');

function previewEmailTemplate() {
  try {
    console.log('📧 Gerando preview do template de lembrete...');
    
    // Simular dados da manutenção recém-criada
    const emailData = {
      userName: 'Luiz Neves',
      bikeName: 'Speed Spec. 8',
      serviceDescription: 'TESTE Email Lembrete - Ajuste de freios',
      scheduledDate: '2025-07-28T17:00:00.000Z',
      daysUntil: 1,
      bikeUrl: 'http://localhost:3003/bikes/f8e58f7a-af98-48a9-a453-b1acf81fcc94',
      unsubscribeUrl: 'http://localhost:3003/settings/email-preferences'
    };
    
    console.log('📋 Dados do email:', {
      usuario: emailData.userName,
      bike: emailData.bikeName,
      servico: emailData.serviceDescription,
      diasRestantes: emailData.daysUntil,
      dataManutencao: new Date(emailData.scheduledDate).toLocaleDateString('pt-BR')
    });
    
    // Gerar HTML do email
    const emailHtml = MaintenanceReminderEmail(emailData);
    
    // Salvar o HTML para visualização
    const fs = require('fs');
    const previewPath = './email-preview.html';
    
    fs.writeFileSync(previewPath, emailHtml);
    
    console.log('✅ Preview gerado com sucesso!');
    console.log('📁 Arquivo salvo em:', previewPath);
    console.log('🌐 Para visualizar, abra este arquivo no navegador');
    
    // Mostrar início do HTML
    console.log('\n📄 Início do template:');
    console.log(emailHtml.substring(0, 200) + '...');
    
    // Verificar elementos importantes
    const hasUrgency = emailHtml.includes('AMANHÃ') || emailHtml.includes('1 dia');
    const hasBikeName = emailHtml.includes('Speed Spec. 8');
    const hasService = emailHtml.includes('Ajuste de freios');
    const hasUnsubscribe = emailHtml.includes('email-preferences');
    
    console.log('\n✅ Elementos do template:');
    console.log('   Indicador de urgência:', hasUrgency ? '✅' : '❌');
    console.log('   Nome da bike:', hasBikeName ? '✅' : '❌');
    console.log('   Descrição do serviço:', hasService ? '✅' : '❌');
    console.log('   Link de descadastro:', hasUnsubscribe ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Erro ao gerar preview:', error.message);
    console.error('Stack:', error.stack);
  }
}

previewEmailTemplate();