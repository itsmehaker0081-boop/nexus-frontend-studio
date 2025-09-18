import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Notification event listeners
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  offNotification(callback: (notification: any) => void) {
    this.socket?.off('notification', callback);
  }

  // Payment event listeners
  onPaymentUpdate(callback: (payment: any) => void) {
    this.socket?.on('payment_update', callback);
  }

  offPaymentUpdate(callback: (payment: any) => void) {
    this.socket?.off('payment_update', callback);
  }

  // Expense event listeners
  onExpenseUpdate(callback: (expense: any) => void) {
    this.socket?.on('expense_update', callback);
  }

  offExpenseUpdate(callback: (expense: any) => void) {
    this.socket?.off('expense_update', callback);
  }
}

export const socketManager = new SocketManager();