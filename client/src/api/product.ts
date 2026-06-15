import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/product` : 'http://localhost:3000/api/product';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to an expired or invalid token
    if (
      (error.response?.status === 401 ||
        (error.response?.data?.message &&
          (error.response.data.message.toLowerCase().includes('expired') ||
           error.response.data.message.toLowerCase().includes('invalid')))) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token using the auth API
        const refreshUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth/refreshToken` : 'http://localhost:3000/api/auth/refreshToken';
        const refreshResponse = await axios.get(refreshUrl, {
          withCredentials: true,
        });

        const newAccessToken = refreshResponse.data.accessToken;
        if (newAccessToken) {
          // Save new token
          localStorage.setItem('accessToken', newAccessToken);
          
          // Update the failed request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If the refresh token fails (e.g. it is also expired), clear everything and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface Product {
  _id: string;
  productName: string;
  productType: string;
  brandName: string;
  quantityStock: number;
  sellingPrice: number;
  mrp: number;
  productImage: string;
  exchange: boolean;
  isPublished: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const productApi = {
  getMyProducts: async (): Promise<Product[]> => {
    const response = await api.get('/my-products');
    return response.data.products;
  },

  addProduct: async (formData: FormData): Promise<Product> => {
    const response = await api.post('/add-product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.product;
  },

  editProduct: async (id: string, formData: FormData): Promise<Product> => {
    const response = await api.patch(`/edit-product/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/delete-product/${id}`);
  },

  publishProduct: async (id: string): Promise<Product> => {
    const response = await api.post('/../publish/publish-product', { id });
    return response.data;
  },

  unpublishProduct: async (id: string): Promise<Product> => {
    const response = await api.post('/../publish/unpublish-product', { id });
    return response.data;
  },

  getPublishedProducts: async (): Promise<Product[]> => {
    const response = await api.get('/../publish/get-published-products');
    return response.data.products;
  },

  getUnpublishedProducts: async (): Promise<Product[]> => {
    const response = await api.get('/../publish/get-unpublished-products');
    return response.data.products;
  },
};
