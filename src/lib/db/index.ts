import Dexie, { Table } from 'dexie';

export interface LocalProduct {
  id: string;
  name: string;
  // ... more fields later
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
}

export class PosDB extends Dexie {
  products!: Table<LocalProduct>;

  constructor() {
    super('PosDB');
    this.version(1).stores({
      products: 'id, updated_at, sync_status',
      // Add more tables later: sales, etc.
    });
  }
}

export const db = new PosDB();