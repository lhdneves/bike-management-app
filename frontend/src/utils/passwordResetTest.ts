import api from './api';

// Password Reset API for frontend testing
export const passwordResetAPI = {
  // Test forgot password
  testForgotPassword: async (email: string) => {
    try {
      const response = await api.post('/password-reset/request', { email });
      console.log('✅ Forgot Password Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Forgot Password Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test token validation
  testValidateToken: async (token: string) => {
    try {
      const response = await api.get(`/password-reset/validate/${token}`);
      console.log('✅ Token Validation Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Token Validation Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test password reset
  testResetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post('/password-reset/reset', {
        token,
        newPassword
      });
      console.log('✅ Reset Password Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Reset Password Error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Test function to run all password reset flow
export const testPasswordResetFlow = async (testEmail: string = 'test@example.com') => {
  console.log('🧪 Testing Password Reset Flow...');
  
  try {
    // Step 1: Request password reset
    console.log('\n1️⃣ Testing forgot password request...');
    await passwordResetAPI.testForgotPassword(testEmail);
    
    // Step 2: Test invalid token validation
    console.log('\n2️⃣ Testing invalid token validation...');
    try {
      await passwordResetAPI.testValidateToken('invalid-token-123');
    } catch (error) {
      console.log('✅ Invalid token correctly rejected');
    }
    
    // Step 3: Test invalid password reset
    console.log('\n3️⃣ Testing invalid password reset...');
    try {
      await passwordResetAPI.testResetPassword('invalid-token-123', 'newpassword123');
    } catch (error) {
      console.log('✅ Invalid token reset correctly rejected');
    }
    
    console.log('\n✅ Password reset flow tests completed!');
    console.log('📧 Check your email for actual reset links (if using real email)');
    
  } catch (error) {
    console.error('❌ Password reset flow test failed:', error);
  }
};

export default passwordResetAPI;