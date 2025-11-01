import { apiClient } from '@/lib/api';

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return apiClient.postForm('/admin/login', formData);
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiClient.get('/admin/dashboard/stats'),
};

// Cattle API
export const cattleAPI = {
  getAll: () => apiClient.get('/admin/cows'),
  getById: (id: string) => apiClient.get(`/admin/cows/${id}`),
  register: async (data: any, files: File[]) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    files.forEach(file => formData.append('files', file));
    return apiClient.postForm('/admin/register-cow', formData);
  },
  update: (id: string, data: any) => apiClient.put(`/admin/cows/${id}`, data),
  transfer: (id: string, data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return apiClient.postForm(`/admin/cows/${id}/transfer`, formData);
  },
  delete: (cowTag: string) => apiClient.delete(`/admin/cow/${cowTag}/delete`),
  deleteWithDetails: (cowTag: string) => apiClient.delete(`/admin/cow/${cowTag}/delete-full`),
  getFace: (cowTag: string) => apiClient.get(`/admin/cow/${cowTag}/face`),
  downloadReceipt: (cowTag: string) => apiClient.get(`/admin/receipt/${cowTag}`),
  getTagInfo: () => apiClient.get('/admin/cow-tag/info'),
};

// Owners API
export const ownersAPI = {
  getAll: () => apiClient.get('/admin/owners'),
};

// Verification API
export const verificationAPI = {
  verifyByTag: async (cowTag: string, location?: string) => {
    const formData = new FormData();
    formData.append('cow_tag', cowTag);
    if (location) formData.append('location', location);
    return apiClient.postForm('/admin/verify/tag', formData);
  },
  verifyByNose: async (files: File[], location?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (location) formData.append('location', location);
    return apiClient.postForm('/admin/verify/nose', formData);
  },
  getLogs: () => apiClient.get('/admin/verifications'),
};

// Reports API
export const reportsAPI = {
  getAll: (status?: string, reportType?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (reportType) params.append('report_type', reportType);
    const query = params.toString();
    return apiClient.get(`/admin/reports${query ? `?${query}` : ''}`);
  },
  reply: async (reportId: number, adminReply: string, status = 'resolved') => {
    const formData = new FormData();
    formData.append('admin_reply', adminReply);
    formData.append('status', status);
    return apiClient.postForm(`/admin/reports/${reportId}/reply`, formData);
  },
};

// Receipt API
export const receiptAPI = {
  getInfo: async (cowTag: string) => {
    const formData = new FormData();
    formData.append('cow_tag', cowTag);
    return apiClient.postForm('/admin/receipt/info', formData);
  },
  download: (cowTag: string) => apiClient.get(`/admin/receipt/${cowTag}`),
};

// System API
export const systemAPI = {
  healthCheck: () => apiClient.get('/health'),
  testEmailConfig: () => apiClient.get('/test-email-config'),
  testMLModels: () => apiClient.get('/test-ml-models'),
  sendTestEmail: async (email: string) => {
    const formData = new FormData();
    formData.append('test_email', email);
    return apiClient.postForm('/send-test-email', formData);
  },
  setupDatabase: () => apiClient.post('/setup-database', {}),
};

// Mobile API (for reference/monitoring)
export const mobileAPI = {
  getCowFace: (cowTag: string) => apiClient.get(`/mobile/cow/${cowTag}/face`),
  createReport: (data: any) => apiClient.post('/mobile/report', data),
  createGPSReport: (data: any) => apiClient.post('/mobile/report/gps', data),
  getReport: (reportId: string) => apiClient.get(`/mobile/report/${reportId}`),
  verifyLive: (data: any) => apiClient.post('/mobile/verify/live', data),
  verifyNose: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return apiClient.postForm('/mobile/verify/nose', formData);
  },
  verifyTag: (cowTag: string) => apiClient.get(`/mobile/verify/tag/${cowTag}`),
};