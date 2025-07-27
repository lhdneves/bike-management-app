import emailService from '../services/emailService';

async function testEmailService() {
  try {
    console.log('🧪 Testing Email Service...');
    
    // Test health status
    const health = emailService.getHealthStatus();
    console.log('📊 Email Service Health:', health);
    
    // Test connection
    const connectionTest = await emailService.testConnection();
    console.log('🔗 Connection Test:', connectionTest);
    
    // Test password reset email (without actually sending in test mode)
    const resetResult = await emailService.sendPasswordResetEmail(
      'test@example.com',
      'Test User', 
      'test-token-123'
    );
    console.log('🔑 Password Reset Test:', resetResult);
    
    // Test welcome email
    const welcomeResult = await emailService.sendWelcomeEmail(
      'test@example.com',
      'Test User'
    );
    console.log('🚲 Welcome Email Test:', welcomeResult);
    
    console.log('✅ All email service tests completed!');
    
  } catch (error) {
    console.error('❌ Email service test failed:', error);
  }
}

testEmailService();