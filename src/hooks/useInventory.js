import { useMemo } from 'react';
import { useCollection } from './useCollection';
import {
  createProduct,
  deleteProduct,
  normalizeProducts,
  updateProduct,
} from '../services/inventoryService';

export const useInventory = () => {
  const resource = useCollection('inventory', {
    mapData: normalizeProducts,
    createFn: createProduct,
    updateFn: updateProduct,
    removeFn: deleteProduct,
    entityName: 'Product',
  });

  const lowStockItems = useMemo(
    () => resource.items.filter((item) => Number(item.stock) <= Number(item.lowStockThreshold)),
    [resource.items],
  );

  const inventoryValue = useMemo(
    () =>
      resource.items.reduce((sum, item) => sum + (Number(item.stock) || 0) * (Number(item.price) || 0), 0),
    [resource.items],
  );

  return {
    ...resource,
    products: resource.items,
    lowStockItems,
    inventoryValue,
  };
};
