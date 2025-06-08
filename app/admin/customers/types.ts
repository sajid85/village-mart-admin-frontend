export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  orders?: Order[];
  stats: CustomerStats;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export interface CreateCustomerDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface UpdateCustomerDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
} 