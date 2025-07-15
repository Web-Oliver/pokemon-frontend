import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { handleApiError } from '../utils/errorHandler';

/**
 * Central API client for all HTTP requests
 * Configured with base URL and error handling
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful responses as-is
    return response;
  },
  error => {
    // Handle all failed requests globally
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default apiClient;
