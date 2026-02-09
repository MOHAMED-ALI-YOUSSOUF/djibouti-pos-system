import Dexie, { Table } from 'dexie';

/* ---------- Interfaces ---------- */

export interface LocalRole {
  id: string;
  name: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export interface LocalUser {
  id: string;
  role_id: string;
  full_name?: string;
  email: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export interface LocalCategory {
  id: string;
  name: string;
  description?: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export interface LocalProduct {
  id: string;
  name: string;
  barcode?: string;
  category_id?: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export interface LocalStockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: 'in' | 'out' | 'adjustment';
  reason?: string;
  user_id?: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export interface LocalSale {
  id: string;
  user_id: string;
  total_amount: number;
  amount_paid: number;
  change_given: number;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export interface LocalSaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  price_at_sale: number;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export interface LocalPayment {
  id: string;
  sale_id: string;
  method: 'cash' | 'd-money' | 'waafi' | 'cac-pay';
  amount: number;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export interface LocalSyncLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'insert' | 'update' | 'delete';
  status: 'success' | 'failed' | 'conflict';
  error_message?: string;
  created_at: string;
}

export interface LocalSession {
  user_id: string;
  role: string;
  expires_at: string;
}
/* ---------- Dexie DB ---------- */

export class PosDB extends Dexie {
  roles!: Table<LocalRole>;
  users!: Table<LocalUser>;
  categories!: Table<LocalCategory>;
  products!: Table<LocalProduct>;
  stock_movements!: Table<LocalStockMovement>;
  sales!: Table<LocalSale>;
  sale_items!: Table<LocalSaleItem>;
  payments!: Table<LocalPayment>;
  sync_logs!: Table<LocalSyncLog>;

  constructor() {
    super('PosDB');

    this.version(2).stores({ // Bump version si changes
      roles: 'id, updated_at, sync_status',
      users: 'id, updated_at, sync_status',
      categories: 'id, updated_at, sync_status',
      products: 'id, updated_at, sync_status, barcode, category_id',
      stock_movements: 'id, updated_at, sync_status, product_id',
      sales: 'id, updated_at, sync_status, user_id',
      sale_items: 'id, updated_at, sync_status, sale_id',
      payments: 'id, updated_at, sync_status, sale_id',
      sync_logs: 'id, table_name'
    });
  }
}

/* ---------- Instance ---------- */

export const db = new PosDB();

/* ---------- Expose for browser console (DEV only) ---------- */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // `@ts-ignore`
  window.db = db;
}
