import { db } from './index';
import { supabase } from '@/lib/supabase/client'; // Pour future sync
import { useAuth } from '@/hooks/useAuth'; // Pour role check

// Exemple: Add product local
export async function addProductLocal(product: Omit<LocalProduct, 'id' | 'created_at' | 'updated_at' | 'sync_status'>) {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const newProduct: LocalProduct = {
    ...product,
    id,
    created_at: timestamp,
    updated_at: timestamp,
    sync_status: navigator.onLine ? 'synced' : 'pending', // Si online, try direct sync (implémenter later)
  };
  await db.products.add(newProduct);
  if (navigator.onLine) {
    // Preview sync: await syncProduct(newProduct);
  }
  return newProduct;
}

// Similar pour updateProductLocal, deleteProductLocal, getProductsLocal
export async function getProductsLocal() {
  return await db.products.toArray();
}

// Pour autres tables: addSaleLocal, etc.
// RBAC exemple: if (user.role !== 'admin') throw Error('Unauthorized');