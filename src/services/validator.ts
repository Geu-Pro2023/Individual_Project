const VALIDATOR_API_URL = 'https://cow-validator.onrender.com';

export const validatorAPI = {
  validateCowImage: async (file: File): Promise<{ is_cow_nose: boolean; confidence: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${VALIDATOR_API_URL}/validate`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to validate image');
    }
    
    return response.json();
  },
  
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await fetch(`${VALIDATOR_API_URL}/health`);
    return response.json();
  }
};