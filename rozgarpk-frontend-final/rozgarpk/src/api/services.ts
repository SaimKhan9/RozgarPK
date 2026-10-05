import apiClient from './client';

// ─── AUTH ─────────────────────────────────────────
export const authAPI = {
  register: (data: {
    name: string; email: string; phone: string;
    password: string; role: string; city: string; area: string;
  }) => apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string; role?: string }) =>
    apiClient.post('/auth/login', data),

  getMe: () => apiClient.get('/auth/me'),

  updateMe: (data: {
    name: string; email: string; phone: string; city: string; area: string;
    currentPassword?: string;
  }) => apiClient.patch('/auth/me', data),
};

// ─── WORKERS ──────────────────────────────────────
export const workersAPI = {
  getAll: (params?: {
    category?: string; city?: string; minRating?: number;
    maxRate?: number; search?: string; page?: number; limit?: number;
  }) => apiClient.get('/workers', { params }),

  getById: (id: string) => apiClient.get(`/workers/${id}`),

  createProfile: (data: {
    category: string; subCategory: string; skills: string[];
    ratePerDay: number; ratePerHour?: number; ratePerMonth?: number;
    experience: number; bio: string; licenseType?: string;
    hasOwnVehicle?: boolean; vehicleModel?: string;
  }) => apiClient.post('/workers/profile', data),

  toggleAvailability: () => apiClient.patch('/workers/availability'),
};

// ─── JOBS ─────────────────────────────────────────
export const jobsAPI = {
  getAll: (params?: {
    category?: string; city?: string; isUrgent?: boolean;
    search?: string; page?: number; limit?: number;
  }) => apiClient.get('/jobs', { params }),

  getById: (id: string) => apiClient.get(`/jobs/${id}`),

  getMy: () => apiClient.get('/jobs/my'),

  create: (data: {
    title: string; description: string; category: string;
    subCategory?: string; budget: number; budgetMax?: number;
    paymentType: string; duration: string; city: string;
    area: string; isUrgent: boolean; imageUrl?: string;
  }) => apiClient.post('/jobs', data),

  update: (id: string, data: Partial<{
    title: string; description: string; budget: number;
    budgetMax: number; isUrgent: boolean; status: string;
  }>) => apiClient.patch(`/jobs/${id}`, data),

  delete: (id: string) => apiClient.delete(`/jobs/${id}`),
};

// ─── PROPOSALS ────────────────────────────────────
export const proposalsAPI = {
  create: (data: { jobId: string; quotedPrice: number; message: string }) =>
    apiClient.post('/proposals', data),

  getMy: () => apiClient.get('/proposals/my'),

  getByJob: (jobId: string) => apiClient.get(`/proposals/job/${jobId}`),

  updateStatus: (id: string, status: 'accepted' | 'rejected') =>
    apiClient.patch(`/proposals/${id}`, { status }),
};

// ─── CHAT ─────────────────────────────────────────
export const chatAPI = {
  getRooms: () => apiClient.get('/chat/rooms'),
  startRoom: (data: { targetUserId: string; jobId?: string }) => apiClient.post('/chat/rooms', data),

  getMessages: (roomId: string) => apiClient.get(`/chat/messages/${roomId}`),

  sendMessage: (roomId: string, text: string) =>
    apiClient.post('/chat/messages', { roomId, text }),
};

// ─── REVIEWS ──────────────────────────────────────
export const reviewsAPI = {
  getWorkerReviews: (workerId: string) =>
    apiClient.get(`/reviews/worker/${workerId}`),

  create: (data: {
    jobId: string; workerId: string; rating: number; comment: string;
  }) => apiClient.post('/reviews', data),
};

// ─── UPLOAD (Cloudinary) ──────────────────────────
export const uploadAPI = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET || 'rozgarpk');
    formData.append('folder', 'rozgarpk');

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Image upload failed');
    const data = await response.json();
    return data.secure_url as string;
  },
};
