import axios from 'axios';
import type { QueryRequest, QueryResponse } from '@/types';

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
   * 提交查询请求
   */
  async processQuery(request: QueryRequest): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/api/query', request);
    return response.data;
  },
};

export default api; 