import axios from 'axios';
import type { QueryRequest, QueryResponse, SearchHistoryResponse } from '@/types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 240000, // 4分钟超时，为后端处理留出充足时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加响应拦截器处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw {
      status: 500,
      error: 'Network Error',
      message: error.message || 'An unexpected error occurred',
    };
  }
);

export const queryAPI = {
  /**
   * Submit query request
   */
  async processQuery(request: QueryRequest): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/api/query', request);
    return response.data;
  },

  /**
   * Get search history with pagination
   */
  async getSearchHistory(page: number = 1, limit: number = 10): Promise<SearchHistoryResponse> {
    const response = await api.get<SearchHistoryResponse>(
      `/api/query/history?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get specific query result by ID
   */
  async getQueryById(id: string): Promise<QueryResponse> {
    const response = await api.get<QueryResponse>(`/api/query/${id}`);
    return response.data;
  },
};

export default api; 