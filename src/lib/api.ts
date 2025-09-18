const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      // Try to refresh token
      try {
        const refreshResponse = await this.refreshToken();
        if (refreshResponse.success) {
          this.setToken(refreshResponse.data.accessToken);
          // Retry original request
          headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          const retryResponse = await fetch(url, { ...config, headers });
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        }
      } catch {
        // Refresh failed, redirect to login
        this.setToken(null);
        window.location.href = '/auth';
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    upiId?: string;
  }) {
    return this.request<{ success: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{
      success: boolean;
      data: {
        accessToken: string;
        user: {
          id: string;
          name: string;
          username: string;
          email: string;
        };
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken() {
    return this.request<{
      success: boolean;
      data: { accessToken: string };
    }>('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout() {
    return this.request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request<{
      success: boolean;
      data: {
        user: {
          id: string;
          name: string;
          username: string;
          email: string;
          upiId?: string;
          friends: string[];
          friendRequests: string[];
        };
      };
    }>('/users/me');
  }

  // Friends endpoints
  async getFriends() {
    return this.request<{
      success: boolean;
      data: {
        friends: Array<{
          _id: string;
          name: string;
          username: string;
          email: string;
        }>;
      };
    }>('/friends');
  }

  async sendFriendRequest(friendId: string) {
    return this.request<{ success: boolean; message: string }>('/friends/send', {
      method: 'POST',
      body: JSON.stringify({ friendId }),
    });
  }

  async acceptFriendRequest(friendId: string) {
    return this.request<{ success: boolean; message: string }>('/friends/accept', {
      method: 'POST',
      body: JSON.stringify({ friendId }),
    });
  }

  // Groups endpoints
  async getMyGroups() {
    return this.request<{
      success: boolean;
      data: {
        groups: Array<{
          _id: string;
          name: string;
          members: Array<{
            _id: string;
            name: string;
            username: string;
            email: string;
          }>;
          createdBy: {
            _id: string;
            name: string;
            username: string;
            email: string;
          };
        }>;
      };
    }>('/groups');
  }

  async createGroup(data: { name: string; members: string[] }) {
    return this.request<{
      success: boolean;
      data: { group: any };
    }>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Expenses endpoints
  async getMyExpenses() {
    return this.request<{
      success: boolean;
      data: {
        expenses: Array<{
          _id: string;
          description: string;
          amount: number;
          paidBy: {
            _id: string;
            name: string;
            username: string;
          };
          splitDetails: Array<{
            user: {
              _id: string;
              name: string;
              username: string;
            };
            finalShare: number;
            status: 'pending' | 'paid';
          }>;
          group?: {
            _id: string;
            name: string;
          };
          createdAt: string;
        }>;
      };
    }>('/expenses');
  }

  async createExpense(data: {
    description: string;
    amount: number;
    splitWith: string[];
    group?: string;
    splitMethod: 'equal' | 'exact' | 'percentage';
    customSplits?: Array<{ user: string; amount: number }>;
  }) {
    return this.request<{
      success: boolean;
      data: { expense: any };
    }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settlement endpoints
  async getGlobalSettlement(userId?: string) {
    const queryParam = userId ? `?userId=${userId}` : '';
    return this.request<{
      success: boolean;
      data: {
        balances: Record<string, number>;
        transfers: Array<{
          from: string;
          to: string;
          amount: number;
        }>;
      };
    }>(`/settlements/global${queryParam}`);
  }

  // Payments endpoints
  async createPayment(data: {
    payeeId: string;
    expenseIds: string[];
    note?: string;
    method: 'upi' | 'cash';
  }) {
    return this.request<{
      success: boolean;
      data: {
        payment: {
          _id: string;
          amount: number;
          method: string;
          qrData?: string;
          upiIntent?: string;
        };
      };
    }>('/payments/combined', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request<{
      success: boolean;
      data: {
        notifications: Array<{
          _id: string;
          message: string;
          type: string;
          isRead: boolean;
          createdAt: string;
          sender?: {
            _id: string;
            name: string;
            username: string;
          };
        }>;
      };
    }>('/notifications');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);