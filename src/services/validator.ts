const VALIDATOR_API_URL = 'https://cow-validator.onrender.com';

export const validatorAPI = {
  validateCowImage: async (file: File): Promise<{ is_cow_nose: boolean; confidence: number }> => {
    console.log('Sending file to validator:', file.name, file.size, file.type);
    
    // Ensure it's an image file
    if (!file.type.startsWith('image/')) {
      return { is_cow_nose: false, confidence: 0 };
    }
    
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    const response = await fetch(`${VALIDATOR_API_URL}/validate`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });
    
    console.log('Validator response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Validator API error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 422) {
        return { is_cow_nose: false, confidence: 0 };
      }
      
      throw new Error(`Validator API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Validator result:', result);
    
    // Handle different response formats
    if (result.detail) {
      // Error response format
      return { is_cow_nose: false, confidence: 0 };
    }
    
    // The actual API returns {is_cow: boolean, confidence: number}
    if (typeof result.is_cow !== 'undefined') {
      return {
        is_cow_nose: result.is_cow,
        confidence: result.confidence || 0
      };
    }
    
    // Fallback for unexpected format
    return { is_cow_nose: false, confidence: 0 };
  },
  
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await fetch(`${VALIDATOR_API_URL}/health`);
    return response.json();
  }
};